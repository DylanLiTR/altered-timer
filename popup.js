window.onload = function () {
    let duration = document.getElementById("duration");
    let speed = document.getElementById("speed");

    chrome.runtime.sendMessage({query: "Already counting?"}, function(response) {
        if (response.running) {
            document.getElementById("playpause").value = "Pause";
        }
    });

    document.getElementById("form").addEventListener("submit", function (e) {
        e.preventDefault();
        let status = document.activeElement.getAttribute('value');
        let playpause = document.getElementById("playpause");
        if (status === "Pause") {
            pause();
            playpause.value = "Start";
        } else if (status === "Start") {
            setTimer(status);
            playpause.value = "Pause";
        } else if (status === "Reset") {
            setTimer(status);
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
        if (request.failed) {
            document.getElementById("playpause").value = "Start";
            document.getElementById("error").innerHTML = "Please refresh the page.";
        } else if (request.ended) {
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

function setTimer(status) {
    let duration = document.getElementById("duration").value;
    let speed = document.getElementById("speed").value;

    chrome.runtime.sendMessage({run: status, dur: duration, spd: speed});
}

function pause() {
    chrome.runtime.sendMessage({pause: true});
}