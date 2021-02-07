package main

import (
	"fmt"
	"log"
	"net/http"
)

func webroot() http.Handler {
	return http.FileServer(http.Dir("./static"))
}

func main() {
	http.Handle("/", webroot())
	http.HandleFunc("/js/modules/", jsComposingHandler)
	http.Handle("/js/modules/0.js", webroot())

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
