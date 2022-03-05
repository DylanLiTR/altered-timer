var div = document.createElement("div");
div.id = "kronos";
dragElement(div);
document.body.appendChild(div);

chrome.runtime.onConnect.addListener(function(port) {
    console.log("now receiving.");
    console.assert(port.name == "timer");
    let kronos = document.getElementById("kronos");
    kronos.style.borderColor = "teal";
    kronos.style.color = "white";
    kronos.style.display = "flex";

    port.onMessage.addListener(function(msg) {
        if (msg.ended) {
            kronos = document.getElementById("kronos");
            kronos.style.borderColor = kronos.style.color = "red";
        } else {
            kronos.innerHTML = Math.floor(msg.time / 60) + ":" + ("00" + (msg.time % 60)).slice(-2);
        }
    });
});

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