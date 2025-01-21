
console.log("Content script loaded");

const SHORTS_PLAYER_XPATH = '//*[@id="shorts-player"]';
const SHORTS_PLAYER_VIDEO_XPATH = `${SHORTS_PLAYER_XPATH}//video`;
const NAVIGATION_BUTTON_DOWN_XPATH = '//*[@id="navigation-button-down"]//button';
const SPONSORED_BADGE_XPATH = '//*[contains(@class, "badge-shape-wiz__text")]';
const INTERVAL_MS = 100;

checkIfVideoEnded();

var sinceSponsored = 0;
var wasJustSponsored = false;


function checkIfVideoEnded() {
    var endOnNext = false;
    var originalUrl = getCurrentUrl();
    const checkInterval = setInterval(() => {
        waitForXpath(SHORTS_PLAYER_VIDEO_XPATH).then((videoElement) => {
            if (!videoElement) {
                console.log("No video element found");
                clearInterval(checkInterval);
                return;
            }
            var currentUrl = getCurrentUrl();

            if (!currentUrl.includes("/shorts/")) {
                console.log("Not a shorts video");
                clearInterval(checkInterval);
                return;
            }

            var sponsoredBadge = findElementByXpath(SPONSORED_BADGE_XPATH);
            if (sponsoredBadge && sinceSponsored > 0) {
                console.log("Sponsored badge found, since last ", sinceSponsored);
                endOnNext = true;
                wasJustSponsored = true;
                sinceSponsored = 0;
            }

            var videoDuration = videoElement.duration;
            var currentTime = videoElement.currentTime;
            if (originalUrl !== currentUrl && !sponsoredBadge) {
                console.log(`Url changed from ${originalUrl} to ${currentUrl}`);
                endOnNext = false;
                _handleSinceSponsored();
                clearInterval(checkInterval);
                return checkIfVideoEnded();
            }
            var remainingTime = videoDuration - currentTime;
            if (endOnNext || videoElement.ended) {
                endOnNext = false;
                clearInterval(checkInterval);
                return onVideoEnded();
            } else if (remainingTime <= (INTERVAL_MS / 1000) * 1.01) {
                console.log("Video is about to end");
                endOnNext = true;
            }
        });
    }, INTERVAL_MS);
}

function _handleSinceSponsored() {
    var sponsoredBadge = findElementByXpath(SPONSORED_BADGE_XPATH);
    if (!sponsoredBadge) {
        wasJustSponsored = false;
        sinceSponsored++;
    }
    console.log("Since sponsored: ", sinceSponsored);
}

function onVideoEnded() {
    console.log("Video ended");
    var currentUrl = getCurrentUrl();
    const nextButton = findElementByXpath(NAVIGATION_BUTTON_DOWN_XPATH);
    if (nextButton) {
        nextButton.click();
        waitForUrlChange(currentUrl).then(() => {
            _handleSinceSponsored();
            return checkIfVideoEnded();
        });
    } else {
        console.log("No next button found");
    }
}

function findElementsByVisibleText(text) {
    return findElementsByXpath(`//*[contains(text(), "${text}")]`);
}

function waitForUrlChange(originalUrl) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            var currentUrl = getCurrentUrl();
            if (currentUrl !== originalUrl) {
                clearInterval(checkInterval);
                resolve();
            }
        }, INTERVAL_MS);
    });
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

