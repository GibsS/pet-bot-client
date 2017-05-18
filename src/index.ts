import * as fetch from 'isomorphic-fetch'

let url = "35.185.42.232:5000"

let promptField: HTMLInputElement, 
    talkButton: HTMLElement, 
    conversationList: HTMLElement

let locked = false

function init() {
    promptField = document.getElementById("prompt") as HTMLInputElement
    talkButton = document.getElementById("talk")
    conversationList = document.getElementById("conversation")
}

function talk() {
    if(!locked) {
        let newElement = document.createElement("li")
        newElement.innerText = promptField.value
        conversationList.appendChild(newElement)
        locked = true
        fetch("http://" + url + "/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: promptField.value
            })
        })
        .then(r => {
            r.text().then(function(text) {
                locked = false
                let newElement = document.createElement("li")
                newElement.innerText = text
                conversationList.appendChild(newElement)
            })
        })
    }
}

window.onload = function() {
    init()

    talkButton.onclick = talk
    promptField.onkeypress = (e) => {
        if(e.keyCode == 13) {
            talk()
        }
    }
}