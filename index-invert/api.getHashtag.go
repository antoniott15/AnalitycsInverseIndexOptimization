package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (api *API) registerHashtag(r *gin.RouterGroup){
	r.GET("/get-hashtag/:hashtag/:limit", func(c *gin.Context) {
		hashtag := c.Param("hashtag")
		limit := c.Param("limit")
		tweets, err := api.engine.GetTweets(hashtag,limit)
		fmt.Println(hashtag, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(tweets.Tweet)
		return
	})
}