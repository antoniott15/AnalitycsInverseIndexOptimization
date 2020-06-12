# Inverse index Twitter Search

![logo](public/logo.png)

El presente proyecto trata de scrappear la pagina de twitter dado un hashtag, seguido a eso tokeniza las palabras mas importantes y las muestra en una interfaz amigable.


# Procedimiento

El proyecto se base en 3 servicios fundamentales, servicio en python, este usa un tercero llamado twint el cual nos facilita la extraccion de data de twitter dado un limite y un hashtag provee todos los últimos tweets.
El segundo servicio escrito en go te permite procesar la data y recepcionar los requests del cliente, este se encarga de ejecutar via RPC los requerimientos del cliente, al ser llamados se encarga de limpiar los datos y almacenarlos en memoria secundaria, si encuentra datos ya existentes el query se ejecuta más rapido, ya que están almacenados en memoria secundaria y se obvia el proceso de generar un request al servicio en python.

El último y no menos importante es el servicio de cara al cliente o tambien llamado frontend, en este se encuentra el query engine/search engine en el cual gracias a un agradable UI es posible manejar los datos que requieren.

# Dependencias
    - Go
    - Python
    - Node
  
# Ejecutar

El proyecto usa una comunicación entre el servicio de go y de python usando grpc y de go hacia el cliente en react usando rest es por esto que para poder levantar el proyecto tendras que ejecutar los 3 servicios

para el de go, entrar a la carpeta index-invert:

      $ go build && ./indexInvert

para el de python, entrar a la carpeta:

     $ python3 index.py

para el front, entrar a la carpeta search-engine:

     $ npm install && npm run start
  
o también puedes correr el docker-compose.

     $ docker-compose up


# Arquitectura

El proyecto tiene un pequeño approach de micro servicios teniendo en cuenta las dependencias de cada uno.

- Scrapper Engine: Encargado de scrappear los datos de twitter para seguidamente ser procesados
- Index inverse engine: Encargado de procesar la data, tokenizar, filtrar por stopwords y brindar las estructuras que se manejaran en el fronted, estos datos se guardan en disco, por lo que su persistencia queda explicita.
- Search engine: Frontend, encargado de recibir y manejar las peticiones.

 ![Architectura](public/arch.png)


# Cliente

El cliente esta compuesto por una interfaz en la que puedes preguntar por hashtags y hacer un filtrado por palabras relevantes.




# Autores

- Miguel Yurivilca
- Antonio Toche


# Librerías usadas
- React
- Gin
- Twint
- Grpc
- Node
- otras...
