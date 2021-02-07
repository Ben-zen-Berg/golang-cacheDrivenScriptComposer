package main

import (
	"bufio"
	"os"
	"regexp"
)

const delimiter string = "function tempInstantAction"

func ioScriptComposer(modules []string) []byte {
	content := ""
	inject := ""
	action := ""
	root, _ := os.Getwd()
	for i := 0; i < len(modules); i = i + 1 {
		partOfInject := ""
		partOfAction := ""
		f, err := os.Open(root + "\\static\\js\\modules\\" + modules[i])
		if err != nil {
			content = content + "/* --- Module " + modules[i] + " not found. --- */\n"
			continue
		}
		defer f.Close()
		splitter := regexp.MustCompile(delimiter + "\\(\\) {")
		scanner := bufio.NewScanner(f)
		tier := "inject"
		for scanner.Scan() {
			text := scanner.Text()
			if splitter.MatchString(text) {
				tier = "action"
			} else {
				if tier == "inject" {
					partOfInject = partOfInject + text + "\n"
				} else if text != "}" {
					partOfAction = partOfAction + text + "\n"
				}
			}
		}
		if err := scanner.Err(); err != nil {
			content = content + "/* --- Error while processing " + modules[i] + ". --- */\n"
			continue
		}
		inject = inject + partOfInject
		action = action + partOfAction
	}
	if inject != "" {
		content = inject + "\n" + content + "\n"
	}
	if action != "" {
		content = content + delimiter + "() {\n" + action + "}"
	}
	return []byte(content)
}
