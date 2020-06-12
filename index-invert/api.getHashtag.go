package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (api *API) registerHashtag(r *gin.RouterGroup) {
	r.GET("/get-hashtag/:hashtag/:limit", func(c *gin.Context) {
		hashtag := c.Param("hashtag")

		limit := c.Param("limit")

		var has = false

		if val, ok := api.engine.Query[file(hashtag)]; ok {
			if val == limit {
				has = true
			} else {
				has = false
			}
		} else {
			api.engine.Query[file(hashtag)] = limit
			has = false
		}

		if !has {
			tweets, err := api.engine.GetTweets("#"+hashtag, limit)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			words, tokens, err := api.engine.getIndexInvert(tweets.Tweet)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}

			if err :=  api.engine.saveIndexInvertInitial(fileIndexInvert(hashtag), words); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			tokens = api.engine.cleanTokens(tokens)

			if err:= api.engine.saveInitial(file(hashtag), tweets.Tweet); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"data": gin.H{
					"tweets": tweets,
					"tokens": tokens,
				},
			})

			if err :=  api.engine.saveIndexInvert(fileIndexInvert(hashtag), words); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if err := api.engine.save(file(hashtag), tweets.Tweet); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			return
		}

		tweets, token, err := api.engine.getTokenAndTweetsByFile(file(hashtag))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"tweets": tweets,
				"tokens": token,
			},
		})
		return
	})


	r.GET("get-tweets-by-page/:hashtag/:page", func(c *gin.Context) {
		hashtag := c.Param("hashtag")
		page := c.Param("page")

		tweets, err := api.engine.GetListPaginated(file(hashtag),page)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"tweets": tweets,
			},
		})
		return
	})
}

func file(value string) string {
	return ROOT + "/" + value
}

func fileIndexInvert(value string) string {
	return INVERT + "/" + value
}

func (e *Engine) cleanTokens(tokens map[string]int) map[string]int {
	newTokens := make(map[string]int)
	for key, val := range tokens {
		if strings.Contains(e.CleanWord(key), " ") {
			newkey:= strings.Split(e.CleanWord(key), " ")
			for _, elements := range newkey {
				newTokens[elements] = val
			}
		}else {
			newTokens[e.CleanWord(key)] = val
		}
	}
	return newTokens
}
