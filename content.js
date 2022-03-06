// create the timer interface
let div = document.createElement("div");
div.id = "kronos";
dragElement(div);
document.body.appendChild(div);

// tell the background script to create a new port
chrome.runtime.sendMessage({newPort: true}, function(response) {
    // if successful, set the timer value and show the timer if it should not be hidden
    if (response !== undefined) {
        div.innerHTML = Math.floor(response.time / 60) + ":" + ("00" + (response.time % 60)).slice(-2);
        if (!response.hidden) {
            show();
        }
    }
});

// listen for the connection to the background script
chrome.runtime.onConnect.addListener(function(port) {
    // check if the port name is correct
    console.assert(port.name == "timer");

    // listen for post messages
    port.onMessage.addListener(function(msg) {
        // get the timer div
        let kronos = document.getElementById("kronos");
        
        if (msg.visibility === "Show") { // show the timer
            show();
        } else if (msg.visibility === "Hide") { // hide the timer
            kronos.style.display = "none";
        } else if (msg.ended) { // turn the timer red when ended
            kronos.style.display = "flex";
            kronos.style.borderColor = kronos.style.color = "red";
        } else { // show the timer progress
            kronos.innerHTML = Math.floor(msg.time / 60) + ":" + ("00" + (msg.time % 60)).slice(-2);
        }
    });
});

// shows the timer
function show() {
    let kronos = document.getElementById("kronos");
    kronos.style.borderColor = "teal";
    kronos.style.color = "white";
    kronos.style.display = "flex";
}

// https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
  
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;

        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // set the element's new position:
        let bounds = elmnt.getBoundingClientRect();
        if (elmnt.offsetTop - pos2 > 0 && bounds.bottom - pos2 < window.innerHeight) {
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        }
        if (elmnt.offsetLeft - pos1 > 0 && bounds.right - pos1 < document.body.clientWidth) {
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
    }
  
    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
  }