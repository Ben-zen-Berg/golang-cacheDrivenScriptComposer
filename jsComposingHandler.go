package main

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
)

const chunkSize int = 15

func getChunkStart(num int) int {
	num = num - chunkSize
	if num > 0 {
		return num
	}
	return 0
}

func chunkanizeKey(key string) []string {
	chars := []rune(key)
	chunks := make([]string, 0)
	end := len(chars)
	finalized := false
	for start := getChunkStart(end); start >= 0 && !finalized; start = getChunkStart(end) {
		finalized = start == 0
		chunk := string(chars[start:end])
		chunks = append(chunks, chunk)
		end = start
	}
	return chunks
}

func getModuleNamesFromKeys(chunks []string) []string {
	moduleNames := make([]string, 0)
	upleveler := "000000000000000"
	nameAppendix := ".js"
	for i := 0; i < len(chunks); i = i + 1 {
		i64, _ := strconv.ParseInt(chunks[i], 16, 0)
		key := int(i64)
		for compare := 1; compare <= key; compare = compare << 1 {
			if key&compare == compare {
				moduleName := fmt.Sprintf("%0x", compare) + nameAppendix
				moduleNames = append(moduleNames, moduleName)
			}
		}
		nameAppendix = upleveler + nameAppendix
	}
	return moduleNames
}

func getModuleCollectionFromKey(key string) []string {
	chunks := chunkanizeKey(key)
	moduleNames := getModuleNamesFromKeys(chunks)
	return moduleNames
}

func jsComposingHandler(w http.ResponseWriter, r *http.Request) {
	isJsModule := regexp.MustCompile("\\/js\\/modules\\/([0-9,A-F]+)\\.js")
	if isJsModule.MatchString(r.URL.Path) {
		key := isJsModule.ReplaceAllString(r.URL.Path, "$1")
		/*
			isSingleModule := regexp.MustCompile("^[1|2|4|8]0?$")
			if isSingleModule.MatchString(key) {
				http.ServeHttp(w, r)
			}
		*/
		modules := getModuleCollectionFromKey(key)
		content := ioScriptComposer(modules)
		w.Header().Set("Content-Type", "application/javascript")
		w.Write(content)
	} else {
		http.Error(w, "404 not found.", http.StatusNotFound)
	}
}
