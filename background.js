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

//TODO: instead of adding and removing listeners, build a more robust one.
// Also, filter based on xmlhttprequest as well (other requests are not from the
// content script)

function getLocation(responseHeaders) {
    for (var i = responseHeaders.length - 1; i >= 0; --i) {
        if (responseHeaders[i].name === "Location") {
            return responseHeaders[i].value;
        }
    }
    
    return "";
}

var redirectRE = /HTTP\/1\.1 30[12378]/;
function addListener(url, tabId, callbackUID, sendResponse) {
    function callback(info) {
        
        // Get the location from the headers
        var redirectLocation = getLocation(info.responseHeaders);
        
        // If no new location - no redirect. Continue as normal.
        if (redirectLocation === "") {
            chrome.webRequest.onHeadersReceived.removeListener(callback);
            return;
        }
//        console.log("response");
//        console.log(info);
//        console.log(redirectLocation);
        // Send back the new url
        //sendResponse({redirectUrl:redirectLocation});
//        console.log({redirectUrl:redirectLocation, callbackUID: callbackUID});
        chrome.tabs.sendMessage(tabId, {redirectUrl:redirectLocation, callbackUID: callbackUID});
        
        // Remove the listener
        chrome.webRequest.onHeadersReceived.removeListener(callback);
        
        return {cancel:true};
    }
    chrome.webRequest.onHeadersReceived.addListener(
      callback,
      {urls: [url]},
      ["blocking", "responseHeaders"]
      );
          
    sendResponse({url:url});
    
}

function messageHandler(request, sender, sendResponse) {
//    console.log(sender.tab ?
//                "from a content script:" + sender.tab.url :
//                "from the extension");
//    console.log(request);
    if (request.type === "urlquery") {
//        console.log("indeed?");
//        console.log(request);
        addListener(request.url, sender.tab.id, request.callbackUID, sendResponse);
        return true;
    }
}

chrome.extension.onMessage.addListener(messageHandler);