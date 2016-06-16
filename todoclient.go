package main

import (
	"flag"
	"log"
	"net/url"
	"os"
	"os/signal"
	// "time"

	"github.com/gorilla/websocket"
	// "golang.org/x/net/websocket"
	"encoding/json"
	"fmt"
	// "time"
)

type Task struct {
	ID       string `json:"id,omitempty"`
	Content  string `json:"content,omitempty"`
	Complete bool   `json:"complete"`
}

type WSMessage struct {
	MessageData  []Task `json:"messageData,omitempty"`
	MessageLabel string `json:"messageLabel"`
}

var addr = flag.String("addr", "localhost:3000", "http service address")

func main() {
	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/ws"}
	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	// var wsmessages WSMessage
	var message_data []Task
	task := Task{
		ID:       "eswfwrfwrf",
		Content:  "repeat",
		Complete: false,
	}
	message_data = append(message_data, task)
	task = Task{
		ID:       "fwfwrfwrfd",
		Content:  "sleep",
		Complete: false,
	}
	message_data = append(message_data, task)
	task = Task{
		ID:       "aswfwrfwrfd",
		Content:  "eat",
		Complete: false,
	}
	message_data = append(message_data, task)

	ws1 := WSMessage{
		MessageData:  message_data,
		MessageLabel: "insert",
	}

	// wsmessages = append(wsmessages,ws1)

	// fmt.Println(wsmessages)

	b, err1 := json.Marshal(ws1)
	if err1 != nil {
		fmt.Println(" error : ", err1)
	}
	fmt.Println(string(b))
	c.WriteMessage(1, b)
}
