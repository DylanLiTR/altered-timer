var counting = false;
var paused = false;
var hidden = true;
var timer;
var sec = 0;
var ports = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.run === "Start") {
        hidden = false;
        toggleVisibility("Show");
        if (paused) {
            paused = false;
        } else {
            countdown(request.dur, request.spd);
        }
    } else if (request.run === "Reset") {
        hidden = false;
        toggleVisibility("Show");
        paused = true;
        clearInterval(timer);
        countdown(request.dur, request.spd);
    } else if (request.query === "Already counting?") {
        let running = counting && !paused;
        sendResponse({running});
    } else if (request.query === "Timer hidden?") {
        sendResponse({hidden});
    } else if (request.pause) {
        paused = true;
    } else if (request.visiblility === "Show" || request.visiblility === "Hide") {
        hidden = !hidden;
        toggleVisibility(request.visiblility);
    }
});

function toggleVisibility(v) {
    let len = ports.length;
    for (let i = 0; i < len; ++i) {
        ports[i].postMessage({visiblility: v});
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.newPort) {
        addPort();
    }
    if (counting) {
        sendResponse({time: sec+1, hidden});
    }
});

async function countdown(duration, speed) {
    let interval = 1000 / speed;
    sec = duration * 60;
    counting = true;

    let len = ports.length;
    for (let i = 0; i < len; ++i) {
        ports[i].postMessage({time: sec});
    }

    timer = setInterval(function() {
        if (sec < 0) {
            clearInterval(timer);
            counting = false;
            for (let i = 0; i < ports.length; ++i) {
                ports[i].postMessage({ended: true});
            }
            chrome.runtime.sendMessage({ended: true});
        } else if (ports.length === 0) {
            clearInterval(timer);
            problem("No tabs found.");
            return -1;
        } else if (!paused) {
            for (let i = 0; i < ports.length; ++i) {
                try {
                    ports[i].postMessage({time: sec});
                } catch (e) {
                    ports.splice(i, 1);
                }
            }
            sec--;
        }
    }, interval);
}

function addPort() {
    let queryOptions = { active: true, currentWindow: true };
    chrome.tabs.query(queryOptions).then(function([tab]) {
        port = chrome.tabs.connect(tab.id, {name: "timer"});
        port.onDisconnect.addListener(function() {
            ports.splice(ports.indexOf(port), 1);
        })
        ports.push(port);
    });
}

function problem(e) {
    console.log(e);

    counting = paused = false;
    chrome.runtime.sendMessage({failed: true});
}