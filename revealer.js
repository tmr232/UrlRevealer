/* 
 * Content script. Used for finding the interesting links!
 */

function processURL(url) {
    // assumes post-filtering
    
    // Send the url to the background script
    chrome.extension.sendMessage({type:"urlquery", url: url}, handleResponse);
    
    // Fake-open the url for the background script to do it's magic
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
}

function handleResponse(response) {
    console.log(response.redirectUrl);
}

processURL("http://tinyurl.com/c65vxz5")