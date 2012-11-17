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

function addListener(url, sendResponse) {
    function callback(info) {
        // make sure this is a redirect
        if (info.statusLine.indexOf("HTTP/1.1 30") !== 0) {
            //return new Object();
            return {cancel:true};
        }
        
        // Get the location from the headers
        var redirectLocation = getLocation(info.responseHeaders);
        console.log(info.responseHeaders);
        console.log(redirectLocation);
        // Send back the new url
        sendResponse({redirectUrl:redirectLocation});
        
        // Remove the listener
        chrome.webRequest.onHeadersReceived.removeListener(callback);
        
        return {cancel:true};
    }
    chrome.webRequest.onHeadersReceived.addListener(
      callback,
      {urls: [url]},
      ["blocking", "responseHeaders"]
      );
}

function messageHandler(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.log(request);
    if (request.type === "urlquery") {
        addListener(request.url, sendResponse);
        return true;
    }
}

chrome.extension.onMessage.addListener(messageHandler);