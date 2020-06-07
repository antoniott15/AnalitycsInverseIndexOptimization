package main

import (

	"github.com/gin-gonic/gin"
	"net/http"
)

func (api *API) registerHashtag(r *gin.RouterGroup){
	r.GET("/get-hashtag/:hashtag/:limit", func(c *gin.Context) {
		hashtag := c.Param("hashtag")
		limit := c.Param("limit")


		dirs  := WalkDir(ROOT)
		var has bool
		for _,values := range dirs {
			if values == file(hashtag) {
				has = true
			}
		}

		if !has {
			tweets, err := api.engine.GetTweets(hashtag,limit)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			tokens := api.engine.getTokens(tweets.Tweet)
			err = api.engine.save(file(hashtag), tweets.Tweet)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"data": gin.H{
					"tweets": tweets,
					"tokens": tokens,
				},
			})
			return
		}




		return
	})
}



func file(value string) string {
	return ROOT + "/"+ value
}