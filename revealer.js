/* 
 * Content script. Used for finding the interesting links!
 */


/*
 * TODO: Refactor:
 *  1. Create an easy-to-use API for revealer.js
 *      processUrl(url, function(trueUrl) { doCoolStuff(); });
 *  2. Move regex to a seperate file
 *  3. Recode all required parts in both modules...
 *  4. Add a 'how to add your shortener' manual to docs.
 *  
 *  http://updates.html5rocks.com/2012/02/Detect-DOM-changes-with-Mutation-Observers
 */

var callbackQueue = [];
var currentCallbackUID = 0;

//TODO: make sure we don't get a sync error here!!!
function makeNewUID() {
    return currentCallbackUID++;
}

function processURL(url, callback) {
    function handleResponse(response) {
        handler(response.redirectUrl);
    }
    
    // Send the url to the background script
    var callbackUID = makeNewUID();
    callbackQueue[callbackUID] = callback;
    console.log(callbackQueue);
    var data = {type:"urlquery", url: url, callbackUID: callbackUID};
    chrome.extension.sendMessage(data, function(response) {fakeGetUrl(response.url);});
    
    
    
}

function fakeGetUrl(url) {
    // Fake-open the url for the background script to do it's magic
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
}

/*
 *  Go over all anchors in page, and replace tinyurls with real ones!
 */
var tinyurlRE = /.*:\/\/tinyurl\.com\/.*/;
var bitlyRE = /.*:\/\/bit\.ly\/.*/;
function processPage() {
    var anchors = document.querySelectorAll("a");
    for (var i = anchors.length - 1; i >= 0; --i) {
        var anchor = anchors[i];
        anchorHandler(anchor);
    }
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
      //TODO: perhaps use .call and pass the request as 'this' ?
      callbackQueue[request.callbackUID](request);
      delete callbackQueue[request.callbackUID];
  });

console.log("Revealer loaded!");
// Replace all links in page!!!
//processURL("http://bit.ly/Wg77nW", function(request) { console.log("A"); console.log(request);});
//processURL("http://tinyurl.com/cgdj65m", function(request) { console.log("B"); console.log(request);});

var urlREs = [
    /.*:\/\/bit\.ly\/.*/, //biy.ly
    /.*:\/\/tinyurl\.com\/.*/ //tinyurl.com
];

function checkUrl(url) {
    for (var i = urlREs.length - 1; i >= 0; --i) {
        if (url.match(urlREs[i]) !== null) {
            return true;
        }
    }
    
    return false;
}

function anchorHandler(anchor) {
    /*
     * Flow:
     *  1. Check the URL vs. URL REs
     *  2. Process the URL (processURL(...)
     *  3. Replace the anchor's href
     */
    
    // 1. Check the url
    if (!checkUrl(anchor.href)) {
        return;
    }
    
    function processUrlCallback(request) {
        // 3. Replace the anchor's href
        anchor.href = request.redirectUrl;
    }
    
    // 2. Process the URL
    processURL(anchor.href, function(request){processUrlCallback(request);});
}

function handleAnchorChanges(summaries) {
    var anchorSummaries = summaries[0];
//    console.log(anchorSummaries);
    //TODO: make sure you handle all interesting events!!!    
            
    // 1. Go over changed hrefs
    anchorSummaries.attributeChanged.href.forEach(anchorHandler);
    
    // 2. Go over added anchors
    anchorSummaries.added.forEach(anchorHandler);
};

var observer = new MutationSummary({
    callback: handleAnchorChanges,
    queries: [{element: "a", elementAttributes: "href"}]
});


processPage();