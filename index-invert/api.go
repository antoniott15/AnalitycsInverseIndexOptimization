package main


import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func newDBAPI(prefix, port string) (*API, error) {
	e := Engine{Query: map[string]string{}}
	return &API{
		e:      gin.Default(),
		Port:   port,
		prefix: prefix,
		engine: &e,
	}, nil
}

type API struct {
	e      *gin.Engine
	engine *Engine
	Port   string
	prefix string
	done   chan error
}

func (api *API) registerEndpoints() {

	corsConf := cors.DefaultConfig()
	corsConf.AllowAllOrigins = true
	c := cors.New(corsConf)
	api.e.Use(c)
	r := api.e.Group(api.prefix)

	api.registerHashtag(r)
	api.registerIndexInvert(r)
}

func (api *API) Launch() error {
	api.registerEndpoints()
	return api.e.Run(api.Port)
}
