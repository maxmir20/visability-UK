
<img width="128" height="128" alt="visa_logo" src="https://github.com/user-attachments/assets/be323ec4-b5dc-4dbe-966d-b5d79965de9a" />

––––––––––––––––––––––––––––––––––––––––––––––––


A Chrome extension that checks job posting sites against a list of companies with UK Sponsor Licenses. The extension works on LinkedIn and CharityJob to help users identify companies that can sponsor UK work visas.
<kbd>
  <img width="250" height="250" src="https://github.com/user-attachments/assets/edd60788-2887-4768-8630-afced4ce8c54"/>
</kbd>
<kbd>
<img width="250" height="250" src="https://github.com/user-attachments/assets/84565edd-6de1-46fb-9d1b-75cca4dbc1c6"/>
</kbd>
<kbd>
<img width="250" height="250" src="https://github.com/user-attachments/assets/30384f38-a441-4ff1-a33d-0331fac682fe"/>
</kbd>


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

### Data Source
This exists used the [Register of licensed sponsors](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers) list of UK companies posted the the UK Visa and Immigration Office (data current as of August 29th 2525)

### Privacy
- **No Data Collection**: The extension does not collect or transmit any user data
- **Local Processing**: All company matching happens locally in your browser
- **No Tracking**: No analytics, tracking, or personal information is gathered

## Support

For issues, questions, or feature requests, please use the GitHub issues page or contact the development team.

## Version History

- **v1.0.0**: Initial release with LinkedIn and CharityJob support
- Basic company matching functionality
- Modern popup interface
- Real-time badge updates
