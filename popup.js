class PopupManager {
  contentElement;

  constructor() {
    const element = document.getElementById('content');
    if (!element) {
      throw new Error('Content element not found');
    }
    this.contentElement = element;
    this.init();
  }

  async init(){
    try {
      // Get the current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];

      // Check if the active tab is on a supported job site
      const supportedSites = ['linkedin.com', 'indeed.com', 'charityjob.co.uk'];
      const isSupportedSite = activeTab.url ? supportedSites.some(site => activeTab.url.includes(site)) : false;
      
      if (!activeTab.url || !isSupportedSite) {
        this.showError('This extension only works on LinkedIn, Indeed, and CharityJob pages.');
        return;
      }

      // Send message to content script to get current company and results
      try {
        if (!activeTab.id) {
          this.showError('Unable to access tab. Please refresh and try again.');
          return;
        }
        const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'getCurrentResults' });

        if (response && response.currentCompany) {
          this.showResults(response.currentCompany, response.results);
        } else {
          this.showMessage('No company found on this page. Navigate to a LinkedIn company or job page.');
        }
      } catch (error) {
        this.showError('Unable to get company data. Please refresh the page and try again.');
      }
    } catch (error) {
      this.showError('An error occurred while loading the extension.');
    }
  }

  showLoading() {
    this.contentElement.innerHTML = '<div class="loading">Loading...</div>';
  }

  showError(message) {
    this.contentElement.innerHTML = `<div class="error">${message}</div>`;
  }

  showMessage(message) {
    this.contentElement.innerHTML = `
      <div class="message">
        <p>${message}</p>
      </div>
    `;
  }

  showResults(currentCompany, results) {
    const { exactMatches, nearExactMatches, partialMatches } = results;

    let content = '';

    if (exactMatches.length > 0) {
      content = `
        <div class="company-results">
          <div class="header">
            <h3 class="exact-match">✓ Exact Match Found!</h3>
          </div>
          <div class="company-info">
            <p><strong>Company:</strong> ${currentCompany}</p>
            <p class="best-match"><strong>Match:</strong> ${exactMatches[0]}</p>
          </div>
        </div>
      `;
    } else if (nearExactMatches.length > 0) {
      const allMatches = [...nearExactMatches, ...partialMatches];
      const collapsibleContent = allMatches.length > 1 ? `
        <div class="collapsible">
          <details>
            <summary class="near-match">
              Show all ${allMatches.length} matches (${nearExactMatches.length} near exact, ${partialMatches.length} partial)
            </summary>
            <ul>
              ${nearExactMatches.map(match => `<li class="near-exact">${match} (near exact)</li>`).join('')}
              ${partialMatches.map(match => `<li>${match}</li>`).join('')}
            </ul>
          </details>
        </div>
      ` : '';

      content = `
        <div class="company-results">
          <div class="header">
            <h3 class="near-match">≈ Near Match Found</h3>
          </div>
          <div class="company-info">
            <p><strong>Company:</strong> ${currentCompany}</p>
            <p class="best-match"><strong>Best Match:</strong> ${nearExactMatches[0]}</p>
          </div>
          ${collapsibleContent}
        </div>
      `;
    } else if (partialMatches.length > 0) {
      const collapsibleContent = partialMatches.length > 1 ? `
        <div class="collapsible">
          <details>
            <summary class="partial-match">
              Show all ${partialMatches.length} partial matches
            </summary>
            <ul>
              ${partialMatches.map(match => `<li>${match}</li>`).join('')}
            </ul>
          </details>
        </div>
      ` : '';

      content = `
        <div class="company-results">
          <div class="header">
            <h3 class="partial-match">⚠ Partial Matches Found</h3>
          </div>
          <div class="company-info">
            <p><strong>Company:</strong> ${currentCompany}</p>
            <p class="best-match"><strong>Best Guess:</strong> ${partialMatches[0]}</p>
          </div>
          ${collapsibleContent}
        </div>
      `;
    } else {
      content = `
        <div class="company-results">
          <div class="header">
            <h3 class="no-match">❌ No Matches Found</h3>
          </div>
          <div class="company-info">
            <p>Sorry, no matches found for: <strong>${currentCompany}</strong></p>
          </div>
        </div>
      `;
    }

    this.contentElement.innerHTML = content;
  }
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
