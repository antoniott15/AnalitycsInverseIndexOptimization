package main

import (
	proto "indexInverse/protos"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (api *API) registerIndexInvert(r *gin.RouterGroup) {
	r.GET("/get-index-invert/:hashtag", func(c *gin.Context) {
		hashtag := c.Param("hashtag")
		var values map[string][]string
		if err := c.BindJSON(&values); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		list := values["data"]
		if len(list) == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "List is empty"})
			return
		}

		index, err := api.engine.getIndexInvertByName(fileIndexInvert(hashtag))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		data, err := api.engine.getTweetsByFile(file(hashtag))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		idsAppearing := make(map[string]bool)
		indexToCheck := make(map[string]bool)
		for _, elements := range list {
			ifNot := strings.Split(elements, " ")
			if len(ifNot) == 1 {
				indexToCheck[elements] = true
			} else {
				if ifNot[0] == "not" {
					indexToCheck[elements] = false
				} else {
					indexToCheck[elements] = true
				}
			}
		}

		for _, elements := range index {
			if val, ok := indexToCheck[elements.Name]; ok {
				for _, values := range elements.IdsAppearing {
					if val {
						idsAppearing[values] = true
					} else {
						idsAppearing[values] = false
					}
				}
			}
		}

		result := &proto.DataResponse{}
		for _, elements := range data.Tweet {
			if val, ok := idsAppearing[elements.Id]; ok {
				if val {
					result.Tweet = append(result.Tweet, elements)
				}
			}
		}
		result.Lenght = int32(len(result.Tweet))

		c.JSON(http.StatusOK, gin.H{
			"data": result,
		})
	})

}
