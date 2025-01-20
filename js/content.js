
console.log("Content script loaded");

const SHORTS_PLAYER_XPATH = '//*[@id="shorts-player"]';
const SHORTS_PLAYER_VIDEO_XPATH = `${SHORTS_PLAYER_XPATH}//video`;
const NAVIGATION_BUTTON_DOWN_XPATH = '//*[@id="navigation-button-down"]//button';
const INTERVAL_MS = 1000;

checkIfVideoEnded();

function checkIfVideoEnded() {
    // const currentUrl = getCurrentUrl();
    var endOnNext = false;
    const checkInterval = setInterval(() => {
        waitForXpath(SHORTS_PLAYER_VIDEO_XPATH).then((videoElement) => {
            if (!videoElement) {
                console.log("No video element found");
                clearInterval(checkInterval);
                return;
            }
            
            var videoDuration = videoElement.duration;
            var currentTime = videoElement.currentTime;
            // var urlHasChanged = currentUrl !== getCurrentUrl();
            // if (urlHasChanged) {
            //     console.log("URL has changed, stopping video check");
            //     clearInterval(checkInterval);
            //     return;
            // }
            var remainingTime = videoDuration - currentTime;
            if (endOnNext || videoElement.ended) {
                clearInterval(checkInterval);
                onVideoEnded();
            } else if (remainingTime <= INTERVAL_MS / 1000 + 0.1) {
                console.log("Video is about to end");
                endOnNext = true;
            }
        });
    }, INTERVAL_MS);
}

function onVideoEnded() {
    console.log("Video ended");
    const nextButton = findElementByXpath(NAVIGATION_BUTTON_DOWN_XPATH);
    if (nextButton) {
        nextButton.click();
        checkIfVideoEnded();
    } else {
        console.log("No next button found");
    }
}

function findElementsByXpath(path) {
    return document.evaluate(
      path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  }
  
function findElementByXpath(path) {
    return document.evaluate(
        path, 
        document, 
        null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE, 
        null
    ).singleNodeValue;
}

function waitForXpath(xpath) {
    return new Promise((resolve) => {
        if (findElementByXpath(xpath)) {
            return resolve(findElementByXpath(xpath));
        }
    
        const observer = new MutationObserver((mutations) => {
            if (findElementByXpath(xpath)) {
                resolve(findElementByXpath(xpath));
                observer.disconnect();
            }
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

function waitForElement(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
    
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

function getCurrentUrl() {
    return window.location.href;
}

function isCurrentUrl(url) {
    return getCurrentUrl() === url;
}

