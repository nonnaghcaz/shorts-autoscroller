function findElementsByVisibleText(text) {
    return findElementsByXpath(`//*[contains(text(), "${text}")]`);
}

function waitForUrlChange(originalUrl, interval_ms=1000) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            var currentUrl = getCurrentUrl();
            if (currentUrl !== originalUrl) {
                clearInterval(checkInterval);
                resolve();
            }
        }, interval_ms);
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

function hasUrlChanged(originalUrl) {
    return getCurrentUrl() !== originalUrl;
}



export {
    findElementByXpath, findElementsByVisibleText, findElementsByXpath, getCurrentUrl, hasUrlChanged, isCurrentUrl, waitForElement, waitForUrlChange, waitForXpath
};

