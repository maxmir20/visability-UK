# Visa-bility - Chrome Extension

A Chrome extension that checks job posting sites against a list of companies with UK Sponsor Licenses. The extension works on LinkedIn and CharityJob to help users identify companies that can sponsor UK work visas.

## Features

- **Multi-Site Support**: Works on LinkedIn and CharityJob job pages
- **Real-Time Checking**: Instantly checks company names against UK sponsor license database
- **Smart Matching**: Uses fuzzy matching to find exact, near-exact, and partial matches
- **Visual Indicators**: Extension badge changes color based on match status
- **Interactive Popup**: Clean, modern results display with collapsible match details
- **Large Dataset**: Checks against 136,000+ UK companies with sponsor licenses

## Supported Sites

- **LinkedIn**: Company pages and job postings
- **CharityJob**: Organization pages and job listings

## How It Works

1. **Install the extension** from the Chrome Web Store
2. **Navigate to a job site** (LinkedIn, CharityJob)
3. **View company information** on company pages or job postings
4. **Click the extension icon** to see if the company has a UK sponsor license
5. **Review results** showing exact, near-exact, or partial matches

## Match Types

- **✓ Exact Match**: Company name exactly matches a sponsor license holder
- **≈ Near Match**: Company name is very similar to a sponsor license holder
- **⚠ Partial Match**: Company name partially matches sponsor license holders
- **❌ No Match**: No sponsor license found for this company

## Installation

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store
2. Search for "Visa-bility"
3. Click "Add to Chrome"
4. Confirm installation

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

## Project Structure

```
├── manifest.json           # Extension configuration
├── popup.html              # Extension popup interface
├── popup.js                # Popup functionality
├── content.js              # Content script for job sites
├── background.js           # Background service worker
├── jobSiteHandler.js       # Job site-specific handlers
├── utils.js                # Utility functions
├── companies.txt           # UK sponsor license database
├── icons/                  # Extension icons
│   ├── visa_icon16.png
│   ├── visa_icon32.png
│   ├── visa_icon48.png
│   └── icon128.png
└── README.md               # This file
```

## Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension manifest
- **Content Scripts**: Inject into job sites to extract company information
- **Background Service Worker**: Handles badge updates and tab monitoring
- **Popup Interface**: Modern, responsive design with clear match indicators

### Data Source
The extension uses a comprehensive database of UK companies with sponsor licenses, containing over 136,000 entries. This data is regularly updated to ensure accuracy.

### Privacy
- **No Data Collection**: The extension does not collect or transmit any user data
- **Local Processing**: All company matching happens locally in your browser
- **No Tracking**: No analytics, tracking, or personal information is gathered

## License

This project is part of the Visa-bility extension suite.

## Support

For issues, questions, or feature requests, please use the GitHub issues page or contact the development team.

## Version History

- **v1.0.0**: Initial release with LinkedIn and CharityJob support
- Basic company matching functionality
- Modern popup interface
- Real-time badge updates
