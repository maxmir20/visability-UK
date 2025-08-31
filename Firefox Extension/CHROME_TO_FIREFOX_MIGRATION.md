# Chrome to Firefox Migration Guide

This document outlines the key differences between the Chrome Extension and Firefox Add-on versions of Visability.

## Manifest Differences

### Chrome Extension (manifest.json)
```json
{
  "manifest_version": 3,
  "permissions": [
    "activeTab",
    "action"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://*.charityjob.co.uk/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

### Firefox Add-on (manifest.json)
```json
{
  "manifest_version": 2,
  "permissions": [
    "activeTab",
    "tabs",
    "https://www.linkedin.com/*",
    "https://*.charityjob.co.uk/*"
  ],
  "background": {
    "scripts": ["background.js"]
  },
  "browser_action": {
    "default_popup": "popup.html"
  }
}
```

## API Differences

### Chrome APIs → Firefox APIs

| Chrome API | Firefox API | Notes |
|------------|-------------|-------|
| `chrome.runtime.getURL()` | `browser.runtime.getURL()` | Same functionality |
| `chrome.runtime.sendMessage()` | `browser.runtime.sendMessage()` | Same functionality |
| `chrome.runtime.onMessage.addListener()` | `browser.runtime.onMessage.addListener()` | Same functionality |
| `chrome.tabs.query()` | `browser.tabs.query()` | Same functionality |
| `chrome.tabs.sendMessage()` | `browser.tabs.sendMessage()` | Same functionality |
| `chrome.tabs.get()` | `browser.tabs.get()` | Returns Promise in Firefox |
| `chrome.action.setBadgeText()` | `browser.browserAction.setBadgeText()` | Different namespace |
| `chrome.action.setBadgeBackgroundColor()` | `browser.browserAction.setBadgeBackgroundColor()` | Different namespace |
| `chrome.action.onClicked.addListener()` | `browser.browserAction.onClicked.addListener()` | Different namespace |
| `chrome.tabs.onUpdated.addListener()` | `browser.tabs.onUpdated.addListener()` | Same functionality |
| `chrome.tabs.onActivated.addListener()` | `browser.tabs.onActivated.addListener()` | Same functionality |

## Key Changes Made

### 1. Manifest Version
- **Chrome**: Uses Manifest V3
- **Firefox**: Uses Manifest V2 (current standard for Firefox)

### 2. Background Scripts
- **Chrome**: Uses service worker (`"service_worker": "background.js"`)
- **Firefox**: Uses background scripts array (`"scripts": ["background.js"]`)

### 3. Action vs Browser Action
- **Chrome**: Uses `"action"` namespace
- **Firefox**: Uses `"browser_action"` namespace

### 4. Permissions
- **Chrome**: Separates permissions and host_permissions
- **Firefox**: Combines all permissions in a single array

### 5. Promise Handling
- **Chrome**: Some APIs use callbacks
- **Firefox**: Many APIs return Promises (e.g., `browser.tabs.get()`)

## Code Changes Required

### utils.js
```javascript
// Chrome
const response = await fetch(chrome.runtime.getURL('companies.txt'));

// Firefox
const response = await fetch(browser.runtime.getURL('companies.txt'));
```

### content.js
```javascript
// Chrome
chrome.runtime.sendMessage({ action: 'updateBadge', color: '', text: '' });

// Firefox
browser.runtime.sendMessage({ action: 'updateBadge', color: '', text: '' });
```

### background.js
```javascript
// Chrome
chrome.action.setBadgeText({ text: request.text });
chrome.action.setBadgeBackgroundColor({ color: request.color });

// Firefox
browser.browserAction.setBadgeText({ text: request.text });
browser.browserAction.setBadgeBackgroundColor({ color: request.color });
```

### popup.js
```javascript
// Chrome
const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'getCurrentResults' });

// Firefox
const tabs = await browser.tabs.query({ active: true, currentWindow: true });
const response = await browser.tabs.sendMessage(activeTab.id, { action: 'getCurrentResults' });
```

## Testing Differences

### Chrome Extension Testing
1. Load unpacked extension in Chrome
2. Use Chrome DevTools for debugging
3. Extension works immediately after loading

### Firefox Add-on Testing
1. Use `about:debugging` for temporary installation
2. Use `web-ext run` for development testing
3. May require signing for permanent installation

## Development Tools

### Chrome
- Chrome DevTools
- Chrome Extensions page (`chrome://extensions/`)

### Firefox
- Firefox Web Developer Tools
- `about:debugging` for temporary add-ons
- `web-ext` command-line tool
- Firefox Add-ons page (`about:addons`)

## Distribution

### Chrome Extension
- Submit to Chrome Web Store
- Package as .crx file (deprecated)

### Firefox Add-on
- Submit to Firefox Add-ons store
- Package using `web-ext build`
- Can be distributed as .xpi or .zip files

## Compatibility Notes

- Firefox WebExtensions API is based on the Chrome Extensions API
- Most APIs work identically between browsers
- Firefox has some additional APIs not available in Chrome
- Chrome Manifest V3 features are not yet fully supported in Firefox
- Firefox requires add-on signing for distribution (with some exceptions for development)

## Future Considerations

- Firefox is working on Manifest V3 support
- Consider using `webextension-polyfill` for better cross-browser compatibility
- Monitor for API changes in both browsers
- Test regularly on both platforms
