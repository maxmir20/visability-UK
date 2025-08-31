// Handle extension icon click - always show popup
browser.browserAction.onClicked.addListener((tab) => {
  // Always show the popup window, let the popup handle the logic
  browser.browserAction.setPopup({ popup: 'popup.html' });
});

// Handle badge updates from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    browser.browserAction.setBadgeText({ text: request.text });
    browser.browserAction.setBadgeBackgroundColor({ color: request.color });
  }
});

// Monitor tab updates to clear badge when leaving supported job sites
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Clear badge if not on a supported job site
    const supportedSites = ['linkedin.com', 'charityjob.co.uk'];
    const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
    
    if (!isSupportedSite) {
      browser.browserAction.setBadgeText({ text: '' });
      browser.browserAction.setBadgeBackgroundColor({ color: '' });
    }
  }
});

// Monitor tab activation to clear badge when switching to non-supported job site tabs
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId).then((tab) => {
    browser.browserAction.setBadgeText({ text: '' });
    browser.browserAction.setBadgeBackgroundColor({ color: '' });
    
    // Check if the active tab is on a supported job site
    const supportedSites = ['linkedin.com', 'charityjob.co.uk'];
    const isSupportedSite = tab.url ? supportedSites.some(site => tab.url.includes(site)) : false;
    if (isSupportedSite) {
      browser.tabs.sendMessage(activeInfo.tabId, { action: 'getCurrentResults' });
    } 
  }).catch((error) => {
    // Handle error if tab doesn't exist
    return;
  });
});
