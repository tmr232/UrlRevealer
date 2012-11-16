/* 
 * Background script to manage the request handling.
 */

/*
 * Workflow for the extension:
 *      Content Script                  |       Background Script
 * 1. Sends the URL to test             | saves it in special list
 * 2. XMLHttpRequest to the desired URL | 
 * 3.                                   | Request capruted and data extracted
 * 4. replaces original link            | sends data back to content script
 * 
 * to make things faster for other links - only set the listener when waiting
 * for a url to test!
 */

function getLocation(responseHeaders) {
    for (var i = responseHeaders.length - 1; i >= 0; --i) {
        if (responseHeaders[i].name === "Location") {
            return responseHeaders[i].value;
        }
    }
    
    return "";
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "It's alive!"});
  });

function headerHandler(details) {
    // make sure this is a redirect
    if (details.statusLine.indexOf("HTTP/1.1 30") !== 0) {
        return new Object();
    }
    
    // Get the location from the headers
    var redirectLocation = getLocation(details.responseHeaders);
    console.log(redirectLocation);
    console.log(details);
    alert("test");
}

chrome.webRequest.onHeadersReceived.addListener(
      headerHandler,
      {urls: ["*://tinyurl.com/*"]},
      ["blocking", "responseHeaders"]
      );
      

var request = new XMLHttpRequest();
request.open("GET", "http://tinyurl.com/bptcl74", true);
request.send(null);