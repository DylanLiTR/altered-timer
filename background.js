// Things to implement next:
// * Change colour on timer end
// * Style popup
// * Error: 

var counting = false;
var stop = false;
var paused = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.run === "Start") {
        if (paused) {
            paused = false;
        } else {
            countdown(request.dur, request.spd);
        }
    } else if (request.run === "Reset") {
        stop = true;
        paused = true;
        countdown(request.dur, request.spd);
    } else if (request.query === "Already counting?") {
        sendResponse({counting});
    } else if (request.pause) {
        paused = true;
    }
});

async function countdown(duration, speed) {
    let interval = 1000 / speed;
    let sec = duration * 60;

    try {
        var tabId = await getTabId();
        var port = chrome.tabs.connect(tabId, {name: "timer"});
        port.postMessage({time: sec});
    } catch (e) {
        problem(e);
        return -1;
    }
    console.log("connected to " + tabId);

    let timer = setInterval(function() {
        if (sec < 0) {
            clearInterval(timer);
            counting = false;
            port.postMessage({ended: true});
            chrome.runtime.sendMessage({ended: true});
        } else if (stop) {
            clearInterval(timer);
            stop = false;
        } else if (!paused) {
            try {
                port.postMessage({time: sec});
            } catch (e) {
                problem(e);
                clearInterval(timer);
                return -1;
            }
            sec--;
        }
    }, interval);
}

async function getTabId() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    if (tab === undefined) {
        throw "Tab could not be found.";
    }
    return tab.id;
}

function problem(e) {
    console.log(e);

    counting = stop = paused = false;
    chrome.runtime.sendMessage({failed: true});
}