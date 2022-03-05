window.onload = function () {
    let duration = document.getElementById("duration");
    let speed = document.getElementById("speed");

    chrome.runtime.sendMessage({query: "Already counting?"}, function(response) {
        if (response.counting) {
            document.getElementById("playpause").value = "Pause";
        }
    });

    document.getElementById("form").addEventListener("submit", function (e) {
        e.preventDefault();
        let running = document.activeElement.getAttribute('value');
        let playpause = document.getElementById("playpause");
        if (running === "Pause") {
            pause();
            playpause.value = "Start";
        } else if (running === "Start") {
            setTimer(running);
            playpause.value = "Pause";
        } else if (running === "Reset") {
            setTimer(running);
            playpause.value = "Start";
        }
    });

    duration.addEventListener("input", sync);
    speed.addEventListener("input", sync);

    chrome.storage.local.get(null, function(result) {
        duration.value = result["duration"];
        speed.value = result["speed"];
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.failed || request.ended) {
            document.getElementById("playpause").value = "Start";
        }
    });
}

function sync() {
    clearInterval(timer);
    var timer = setTimeout(save, 500);
}

function save() {
    let duration = document.getElementById("duration").value;
    let speed = document.getElementById("speed").value;

    chrome.storage.local.set({speed, duration});
}

function setTimer(running) {
    let duration = document.getElementById("duration").value;
    let speed = document.getElementById("speed").value;

    chrome.runtime.sendMessage({run: running, dur: duration, spd: speed});
}

function pause() {
    chrome.runtime.sendMessage({pause: true});
}