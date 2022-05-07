/*=============================================================================
 |      Project:  Export Patreon Comments
 | 
 |  Description:  Extension to interact with the Patreon Comments.
 |
 |       Author:  MARK CLAUS NUNES
 |    
 |     Created - Date:  17/04/2022
 *===========================================================================*/

const genericOnClick = (info, tab) => {
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ['jquery.min.js']
    })
    .then(() => {
      if (info.menuItemId === 'contextId1') {
        chrome.tabs.sendMessage(tab.id, {
          message: 'show-comments'
        })
      } else if (info.menuItemId === 'contextId2') {
        chrome.tabs.sendMessage(tab.id, {
          message: 'export-comments'
        })
      }
    })
    .catch(err => console.log(err))
}

// Load jQuery
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ['jquery.min.js']
      })
      .catch(err => console.log(err))
  }
})

const contextMenusCommonValues = {
  documentUrlPatterns: ['*://*.patreon.com/posts/*'],
  contexts: ['page']
}

chrome.contextMenus.create({
  title: 'Show all comments',
  id: 'contextId1',
  ...contextMenusCommonValues
})

chrome.contextMenus.create({
  title: 'Export comments',
  id: 'contextId2',
  ...contextMenusCommonValues
})

chrome.contextMenus.onClicked.addListener(genericOnClick)
