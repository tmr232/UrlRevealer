/* 
 * Content script. Used for finding the interesting links!
 */


chrome.extension.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});

function processURL(url) {
    // assumes post-filtering
    
    // Send the url to the background script
    chrome.extension.sendMessage({url: url})
    
    // Fake-open the url for the background script to do it's magic
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
}