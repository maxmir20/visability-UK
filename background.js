
// Handle extension icon click - always show popup
chrome.action.onClicked.addListener((tab) => {
  // Always show the popup window, let the popup handle the logic
  chrome.action.setPopup({ popup: 'popup.html' });
});

// Handle badge updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({ text: request.text });
    chrome.action.setBadgeBackgroundColor({ color: request.color });
  }
});

// Monitor tab updates to clear badge when leaving supported job sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Clear badge if not on a supported job site
    const supportedSites = ['linkedin.com', 'charityjob.co.uk'];
    const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
    
    if (!isSupportedSite) {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '' });
    }
  }
});

// Monitor tab activation to clear badge when switching to non-supported job site tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      return;
    }

    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '' });
    
    // Check if the active tab is on a supported job site
    const supportedSites = ['linkedin.com', 'charityjob.co.uk'];
    const isSupportedSite = tab.url ? supportedSites.some(site => tab.url.includes(site)) : false;
    if (isSupportedSite) {
      chrome.tabs.sendMessage(activeInfo.tabId, { action: 'getCurrentResults' });
    } 
  });
});
