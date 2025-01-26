import { INTERVAL_MS, NAVIGATION_BUTTON_DOWN_XPATH, SHORTS_PLAYER_VIDEO_XPATH, SPONSORED_BADGE_XPATH } from "./utils/constants.js";
import { findElementByXpath, getCurrentUrl, waitForUrlChange, waitForXpath } from "./utils/dom.js";

var sinceSponsored = 0;
var wasJustSponsored = false;

export function main() {
    console.log("Content script main function");
    checkIfVideoEnded();
}


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


