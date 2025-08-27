// Background script for LinkedIn Company Checker
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Company Checker extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('linkedin.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'showResults' });
  } else {
    // Show a message if not on LinkedIn
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});

// Handle badge updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({ text: request.text });
    chrome.action.setBadgeBackgroundColor({ color: request.color });
    console.log('✅ Badge updated:', request.text, request.color);
  }
});
