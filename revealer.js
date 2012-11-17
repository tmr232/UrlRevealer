/* 
 * Content script. Used for finding the interesting links!
 */

function processURL(url, extraData) {
    //console.log(handler);
    function handleResponse(response) {
        console.log(response);
        handler(response.redirectUrl);
    }
    
    // Send the url to the background script
    var data = {type:"urlquery", url: url, extra: extraData};
    console.log("data");
    console.log(data);
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
        if ((anchor.href.match(tinyurlRE) === null) && 
            (anchor.href.match(bitlyRE) === null)) {
            continue;
        }
        console.log("yep");
        var callbackMaker = function(anchor) {
            return function(url){
                anchor.href=url;
                console.log("handler");
                console.log(url);
            };
        };
        processURL(anchor.href, i);
    }
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
      console.log("message again!");
      console.log(request);
    document.querySelectorAll("a")[request.extra].href=request.redirectUrl;
  });

console.log("Revealer loaded!");
// Replace all links in page!!!
processPage();
window.processPage = processPage;
window.processURL = processURL;