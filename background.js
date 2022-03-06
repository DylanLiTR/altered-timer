// global variables/flags (badness 1000000)
var counting = false;
var paused = false;
var hidden = true;
var timer;
var sec = 0;
var ports = [];

// listen for requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.run === "Start") {
        // add port if none are left due to timeout
        if (ports.length === 0) {
            addPort();
        }

        // show the timer
        hidden = false;
        toggleVisibility("Show");

        // if paused, unpause, otherwise start a new timer
        if (paused) {
            paused = false;
        } else {
            countdown(request.dur, request.spd);
        }
    } else if (request.run === "Reset") {
        // show the timer
        hidden = false;
        toggleVisibility("Show");

        // pause the new timer
        paused = true;

        // clear the old timer
        clearInterval(timer);

        // start the new timer
        countdown(request.dur, request.spd);
    } else if (request.query === "Already counting?") {
        // tell popup if the timer is already running
        let running = counting && !paused;
        sendResponse({running});
    } else if (request.query === "Timer hidden?") {
        // tell popyp if the timer is hidden
        sendResponse({hidden});
    } else if (request.pause) {
        // pause the timer
        paused = true;
    } else if (request.visibility === "Show" || request.visibility === "Hide") {
        // toggle the visibility of the timer
        hidden = !hidden;
        toggleVisibility(request.visibility);
    }
});

// changes the visibility of the timer
function toggleVisibility(v) {
    // iterate through all ports to change the visibility of the timer
    let len = ports.length;
    for (let i = 0; i < len; ++i) {
        ports[i].postMessage({visibility: v});
    }
}

// listen for new tabs to create a new connection and show the timer
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.newPort) {
        addPort();
    }
    if (counting) {
        sendResponse({time: sec+1, hidden});
    }
});

// the timer itself
async function countdown(duration, speed) {
    // create the interval and time in seconds
    let interval = 1000 / speed;
    sec = duration * 60;
    counting = true;

    // send initial time to timers
    let len = ports.length;
    for (let i = 0; i < len; ++i) {
        ports[i].postMessage({time: sec});
    }

    // begin the timer
    timer = setInterval(function() {
        if (sec < 0) { // check if the duration has ended
            // clear the timer, make the counting flag false
            clearInterval(timer);
            counting = false;

            // tell content script the timer has ended to change the colour of the interface
            for (let i = 0; i < ports.length; ++i) {
                ports[i].postMessage({ended: true});
            }
            // tell the popup script that the timer has ended to change the playpause button value
            chrome.runtime.sendMessage({ended: true});
        } else if (ports.length === 0) { // check if there are no ports for the timer to communicate with
            // cancel the timer
            clearInterval(timer);
            problem("No tabs found.");
            return -1;
        } else if (!paused) { // check that the timer is not paused
            // try posting messages to each port
            for (let i = 0; i < ports.length; ++i) {
                // if port message fails, delete the port from the array
                try {
                    ports[i].postMessage({time: sec});
                } catch (e) {
                    ports.splice(i, 1);
                }
            }
            // decrement the timer
            sec--;
        }
    }, interval);
}

// adds a new port connection
function addPort() {
    // set the query options to the current open tab
    let queryOptions = { active: true, currentWindow: true };

    // apply the query
    chrome.tabs.query(queryOptions).then(function([tab]) {
        // connect to the tab
        port = chrome.tabs.connect(tab.id, {name: "timer"});
        
        // delete the tab from the array on disconnect
        port.onDisconnect.addListener(function() {
            ports.splice(ports.indexOf(port), 1);
        })
        // add the port to the array
        ports.push(port);
    });
}

// exception handling
function problem(e) {
    // log the exception
    console.log(e);

    // reset flags
    counting = paused = false;

    // tell the popup script the the timer has failed
    chrome.runtime.sendMessage({failed: true});
}