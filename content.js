var div = document.createElement("div");
div.id = "kronos";
div.innerHTML = "bruh";
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