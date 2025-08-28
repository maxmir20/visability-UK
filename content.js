// Using globally available functions from utils.js and jobSiteHandler.js

class CompanyChecker {
  companies = [];
  currentCompany = null;
  matchStatus = 'none';
  isInitialized = false;

  constructor() {
    this.init();
  }

  async init(){
    // Clear badge immediately to avoid showing red during loading
    this.clearBadge();
    
    await this.loadCompanies();
    this.isInitialized = true;
    this.checkCurrentPage();
    this.setupUrlChangeListener();
    this.setupMessageListener();
  }

  async loadCompanies(){
    this.showLoadingBadge();
    this.companies = await window.loadCompanies();
  }

  async checkCurrentPage(){
    // Show loading spinner while checking
    this.showLoadingBadge();

    const url = window.location.href;
    const companyName = window.jobSiteFactory.extractCompanyName(url);

    if (!companyName) {
      this.currentCompany = null;
      this.matchStatus = 'none';
      // Don't show red badge for no company found, just leave it cleared
      this.clearBadge();
      return;
    }

    this.currentCompany = companyName;
    const results = window.searchCompany(companyName, this.companies);
    
    if (results.exactMatches.length > 0) {
      this.matchStatus = 'exact';
    } else if (results.nearExactMatches.length > 0) {
      this.matchStatus = 'nearExact';
    } else if (results.partialMatches.length > 0) {
      this.matchStatus = 'partial';
    } else {
      this.matchStatus = 'none';
    }

    this.updateExtensionBadge(this.matchStatus);
  }

  clearBadge(){
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      color: '',
      text: ''
    });
  }

  updateExtensionBadge(status) {
    const badgeConfig = this.getBadgeConfig(status);
    
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      color: badgeConfig.color,
      text: badgeConfig.text
    });
  }

  getBadgeConfig(status) {
    switch (status) {
      case 'exact':
        return { color: '#28a745', text: '✓' };
      case 'nearExact':
        return { color: '#007bff', text: '≈' };
      case 'partial':
        return { color: '#ffc107', text: '⚠' };
      case 'none':
        return { color: '#dc3545', text: '✗' };
    }
  }

  showLoadingBadge() {
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      color: '#0073b1', // LinkedIn blue
      text: '⏳' // Hourglass emoji for loading
    });
  }

  setupUrlChangeListener() {
    let lastUrl = location.href;
    
    // Existing MutationObserver for DOM changes
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => this.checkCurrentPage(), 1000);
      }
    }).observe(document, { subtree: true, childList: true });

    // Add popstate listener for browser navigation (back/forward buttons)
    window.addEventListener('popstate', () => {
      setTimeout(() => this.checkCurrentPage(), 1000);
    });

    // Add interval check for query parameter changes (fallback)
    setInterval(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.checkCurrentPage();
      }
    }, 2000);

    // Additional monitoring for job pages
    if (
      window.location.href.startsWith('https://www.linkedin.com/jobs/') || 
      window.location.href.includes('indeed.com/') || 
      window.location.href.startsWith('https://www.charityjob.co.uk/')
    ) {
      setTimeout(() => this.checkCurrentPage(), 3000);
      setTimeout(() => this.checkCurrentPage(), 5000);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getCurrentResults') {
        // Rerun check to ensure fresh results
        this.checkCurrentPage();
        
        // Send current company and results back to popup
        if (this.currentCompany) {
          const results = window.searchCompany(this.currentCompany, this.companies);
          sendResponse({
            currentCompany: this.currentCompany,
            results: results
          });
        } else {
          sendResponse({ currentCompany: null, results: null });
        }
      }
    });
  }
}

// Initialize the extension
new CompanyChecker();
