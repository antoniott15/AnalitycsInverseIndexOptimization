package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (api *API) registerHashtag(r *gin.RouterGroup) {
	r.GET("/get-hashtag/:hashtag/:limit", func(c *gin.Context) {
		hashtag := c.Param("hashtag")
		limit := c.Param("limit")

		var has = false

		if val,ok := api.engine.Query[file(hashtag)]; ok {
			if val == limit{
				has = true
			}else {
				has =false
			}
		}else {
			api.engine.Query[file(hashtag)] = limit
			has = false
		}

		if !has {
			tweets, err := api.engine.GetTweets(hashtag, limit)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			words, tokens, err := api.engine.getIndexInvert(tweets.Tweet)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}

			if err := api.engine.saveIndexInvert(fileIndexInvert(hashtag), words); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}

			if err := api.engine.save(file(hashtag), tweets.Tweet); err != nil {
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
}


func file(value string) string {
	return ROOT + "/" + value
}

func fileIndexInvert(value string) string {
	return INVERT + "/" + value
}
