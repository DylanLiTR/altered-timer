// setup for popup
window.onload = function () {
    // get input boxes
    let duration = document.getElementById("duration");
    let speed = document.getElementById("speed");

    // if the timer is already counting in the background, make the button pause
    chrome.runtime.sendMessage({query: "Already counting?"}, function(response) {
        if (response.running) {
            document.getElementById("playpause").value = "Pause";
        }
    });

    // if the timer is hidden, make the button show
    chrome.runtime.sendMessage({query: "Timer hidden?"}, function(response) {
        if (response !== undefined && response.hidden) {
            document.getElementById("visibility").value = "Show";
        }
    });

    // actions for when the inputs are submited
    document.getElementById("form").addEventListener("submit", function (e) {
        // prevent popup from refreshing
        e.preventDefault();

        // get value of the button that was pressed
        let status = document.activeElement.getAttribute('value');

        // change the value of the buttons accordingly
        let playpause = document.getElementById("playpause");
        let visibility = document.getElementById("visibility");

        if (status === "Start") {
            setTimer(status);
            playpause.value = "Pause";
            visibility.value = "Hide";
        } else if (status === "Pause") {
            pause();
            playpause.value = "Start";
        } else if (status === "Reset") {
            setTimer(status);
            playpause.value = "Start";
        } else if (status === "Hide") {
            visibility.value = "Show";
            chrome.runtime.sendMessage({visibility: "Hide"});
        } else if (status === "Show") {
            visibility.value = "Hide";
            chrome.runtime.sendMessage({visibility: "Show"});
        }
    });

    // listen for input and save to local storage
    duration.addEventListener("input", sync);
    speed.addEventListener("input", sync);

    // get data from local storage and set them to the input values
    chrome.storage.local.get(null, function(result) {
        duration.value = result["duration"];
        speed.value = result["speed"];
    });

    // listen for errors or end of timer
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.failed) {
            document.getElementById("playpause").value = "Start";
            document.getElementById("error").innerHTML = "Please refresh the page.";
        } else if (request.ended) {
            document.getElementById("playpause").value = "Start";
        }
    });
}

// call save with at most 500ms between calls
function sync() {
    clearInterval(timer);
    var timer = setTimeout(save, 500);
}

// save duration and speed to local storage
function save() {
    let duration = document.getElementById("duration").value;
    let speed = document.getElementById("speed").value;

    chrome.storage.local.set({speed, duration});
}

// set the timer in background
function setTimer(status) {
    let duration = document.getElementById("duration").value;
    let speed = document.getElementById("speed").value;

    chrome.runtime.sendMessage({run: status, dur: duration, spd: speed});
}

// pause the timer
function pause() {
    chrome.runtime.sendMessage({pause: true});
}