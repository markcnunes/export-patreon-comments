/*=============================================================================
 |      Project:  Export Patreon Comments
 | 
 |  Description:  Extension to interact with the Patreon Comments.
 |
 |       Author:  MARK CLAUS NUNES
 |    
 |     Created - Date:  17/04/2022
 *===========================================================================*/

 
function genericOnClick(info, tab) {
    
    chrome.tabs.executeScript(
        null,
        {
            file: "jquery.min.js"
        },
        function() {
            if (info.menuItemId === "contextId1") {
                chrome.tabs.sendMessage(tab.id, {
                    message: "show-comments"
                });
            } else if (info.menuItemId === "contextId2") {
                chrome.tabs.sendMessage(tab.id, {
                    message: "export-comments"
                });
            }
            
        }
    );
}

// Load jQuery
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.executeScript(tabId, {
        file: 'jquery.min.js'
    }, () => chrome.runtime.lastError);
}); 

const showForPages = ["*://*.patreon.com/posts/*"];

chrome.contextMenus.create({
    title: "Show all comments",
    "documentUrlPatterns":showForPages,
    contexts: ["page"],
    id: "contextId1"
});

chrome.contextMenus.create({
    title: "Export comments",
    "documentUrlPatterns":showForPages,
    contexts: ["page"],
    id: "contextId2"
});

chrome.contextMenus.onClicked.addListener(genericOnClick);