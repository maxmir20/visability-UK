// Background script for LinkedIn Company Checker
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Company Checker extension installed');
});

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

// Monitor tab updates to clear badge when leaving LinkedIn
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Clear badge if not on LinkedIn
    if (!tab.url.includes('linkedin.com')) {
      console.log('Tab updated - clearing badge (not LinkedIn):', tab.url);
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '' });
    }
  }
});

// Monitor tab activation to clear badge when switching to non-LinkedIn tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo);
  
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting tab:', chrome.runtime.lastError);
      return;
    }
    
    console.log('Active tab URL:', tab.url);
    
    if (!tab.url?.includes('linkedin.com')) {
      console.log('Switching to non-LinkedIn tab - clearing badge');
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '' });
    }
  });
});
