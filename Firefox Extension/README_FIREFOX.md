# Visability Firefox Add-on

A Firefox Add-on that checks job posting sites against a list of companies with UK Sponsor Licences.

## Features

- **Real-time checking**: Automatically checks company names on LinkedIn and CharityJob pages
- **Visual indicators**: Shows colored badges on the extension icon to indicate match status
- **Smart matching**: Uses fuzzy search to find exact, near-exact, and partial matches
- **Detailed results**: Click the extension icon to see detailed match information

## Installation

### Method 1: Temporary Installation (for testing)

1. Open Firefox and navigate to `about:debugging`
2. Click on "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the Firefox Extension directory and select the `manifest.json` file
5. The extension will be installed temporarily and will work until you restart Firefox

### Method 2: Permanent Installation (for development)

1. Open Firefox and navigate to `about:config`
2. Search for `xpinstall.signatures.required` and set it to `false`
3. Navigate to `about:addons`
4. Click the gear icon and select "Install Add-on From File..."
5. Select the `manifest.json` file from the Firefox Extension directory

### Method 3: Using web-ext (recommended for developers)

1. Install web-ext globally: `npm install -g web-ext`
2. Navigate to the Firefox Extension directory
3. Run: `web-ext run` to test the extension
4. Run: `web-ext build` to create a distributable package

## Usage

1. **Navigate to a supported job site**:
   - LinkedIn (https://www.linkedin.com/jobs/)
   - CharityJob (https://www.charityjob.co.uk/)

2. **Look for the extension badge**:
   - **Green with ✓**: Exact match found
   - **Blue with ≈**: Near-exact match found
   - **Yellow with ⚠**: Partial match found
   - **Red with ✗**: No match found
   - **Blue with ⏳**: Loading/checking

3. **Click the extension icon** to see detailed results:
   - Company name being checked
   - Match type and confidence
   - List of all potential matches
   - Collapsible sections for multiple matches

## Supported Sites

- **LinkedIn**: Company pages and job postings
- **CharityJob**: Organisation pages and job postings

## Technical Details

### Manifest Version
This add-on uses Manifest V2, which is the current standard for Firefox WebExtensions.

### Key Differences from Chrome Extension
- Uses `browser.*` APIs instead of `chrome.*` APIs
- Uses `browser_action` instead of `action`
- Uses `background.scripts` array instead of `background.service_worker`
- Permissions are specified differently in the manifest

### Files Structure
```
Firefox Extension/
├── manifest.json          # Add-on configuration
├── background.js          # Background script for badge management
├── content.js            # Content script for page interaction
├── utils.js              # Utility functions for company matching
├── jobSiteHandler.js     # Site-specific handlers
├── popup.html            # Popup interface
├── popup.js              # Popup logic
├── companies.txt         # List of UK sponsor companies
├── images/               # Extension icons
│   ├── visa_icon16.png
│   ├── visa_icon32.png
│   ├── visa_icon48.png
│   ├── visa_icon128.png
│   └── visa_logo.png
└── README_FIREFOX.md     # This file
```

## Development

### Testing
1. Use `web-ext run` to test the extension in a temporary Firefox profile
2. Use `web-ext lint` to check for common issues
3. Use Firefox's built-in developer tools to debug

### Building for Distribution
1. Run `web-ext build` to create a `.zip` file
2. The resulting file can be submitted to Firefox Add-ons store or distributed manually

### Debugging
- Use `about:debugging` to access console logs from background and content scripts
- Use Firefox's Web Developer Tools to inspect the popup
- Check the Browser Console for any errors

## Troubleshooting

### Extension not working
1. Check that you're on a supported site (LinkedIn or CharityJob)
2. Refresh the page and try again
3. Check the browser console for errors
4. Ensure the extension has the necessary permissions

### Badge not updating
1. Check if the page has loaded completely
2. Try navigating to a different job posting
3. Check the browser console for any error messages

### Popup not showing results
1. Ensure you're on a supported job site
2. Try refreshing the page
3. Check that the content script is running properly

## Privacy

This extension:
- Only runs on LinkedIn and CharityJob pages
- Does not collect or transmit any personal data
- Only reads company names from the current page
- Stores no data locally or remotely

## License

See the main README.md file for license information.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the project repository.
