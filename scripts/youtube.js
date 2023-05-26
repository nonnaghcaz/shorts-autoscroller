waitForElement('video').then((elem) => {
    const videoElem = document.querySelector("video.html5-main-video");
    var i = setInterval(function() {
        if(videoElem.readyState > 0) {
            _init(videoElem);
            clearInterval(i);
        }
    }, 200);
});


function getElementsByXpath(xpathToExecute) {
    var result = [];
    var nodesSnapshot = document.evaluate(xpathToExecute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
    for ( var i=0 ; i < nodesSnapshot.snapshotLength; i++ ){
        result.push( nodesSnapshot.snapshotItem(i) );
    }
    return result;
}


function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


function _init(videoElem) {

    const nextElem = getElementsByXpath("//div[@id='navigation-button-down']//button")[0];
    videoElem.addEventListener("timeupdate", function(event) {
        try { this.removeAttribute("loop"); } catch {}
        if (this.currentTime >= this.duration) {
            nextElem.click();
            return true;
        }
    });
    return false;
}