// TypeScript content script implementation
// Uses the existing TypeScript factory from jobSiteHandlers.ts

import { jobSiteFactory } from './jobSiteHandlers';

class LinkedInCompanyChecker {
  private companies: string[] = [];
  private currentCompany: string | null = null;
  private matchStatus: 'exact' | 'nearExact' | 'partial' | 'none' = 'none';
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Clear badge immediately to avoid showing red during loading
    this.clearBadge();
    
    await this.loadCompanies();
    this.isInitialized = true;
    this.checkCurrentPage();
    this.setupUrlChangeListener();
    this.setupMessageListener();
  }

  private async loadCompanies(): Promise<void> {
    this.showLoadingBadge();
    try {
      const response = await fetch(chrome.runtime.getURL('companies.txt'));
      const text = await response.text();
      this.companies = text.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
      console.error('Error loading companies:', error);
      this.companies = [];
    }
  }

  private async checkCurrentPage(): Promise<void> {
    const url = window.location.href;
    const companyName = this.extractCompanyNameFromUrl(url);

    if (!companyName) {
      this.currentCompany = null;
      this.matchStatus = 'none';
      // Don't show red badge for no company found, just leave it cleared
      this.clearBadge();
      return;
    }

    this.currentCompany = companyName;
    const results = this.searchCompany(companyName, this.companies);
    
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

  private clearBadge(): void {
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      color: '',
      text: ''
    });
  }

  private updateExtensionBadge(status: 'exact' | 'nearExact' | 'partial' | 'none'): void {
    const badgeConfig = this.getBadgeConfig(status);
    
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      color: badgeConfig.color,
      text: badgeConfig.text
    });
  }

  private getBadgeConfig(status: 'exact' | 'nearExact' | 'partial' | 'none'): { color: string; text: string } {
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

  private showLoadingBadge(): void {
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      color: '#0073b1', // LinkedIn blue
      text: '⏳' // Hourglass emoji for loading
    });
  }

  private setupUrlChangeListener(): void {
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => this.checkCurrentPage(), 1000);
      }
    }).observe(document, { subtree: true, childList: true });

    // Additional monitoring for job pages
    if (window.location.href.startsWith('https://www.linkedin.com/jobs/')) {
      setTimeout(() => this.checkCurrentPage(), 3000);
      setTimeout(() => this.checkCurrentPage(), 5000);
    }
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getCurrentResults') {
        // Send current company and results back to popup
        if (this.currentCompany) {
          const results = this.searchCompany(this.currentCompany, this.companies);
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

  // Use the TypeScript factory instead of duplicating
  private extractCompanyNameFromUrl(url: string): string | null {
    return jobSiteFactory.extractCompanyName(url);
  }

  private searchCompany(companyName: string, companies: string[]): { exactMatches: string[]; nearExactMatches: string[]; partialMatches: string[] } {
    const normalizedSearch = companyName.toLowerCase().trim();
    
    let exactMatches: string[] = [];
    let nearExactMatches: string[] = [];
    let partialMatches: Array<{ name: string; score: number }> = [];
    
    for (const company of companies) {
      const normalizedCompany = company.toLowerCase().trim();
      
      if (normalizedCompany === normalizedSearch) {
        exactMatches.push(company);
      } else if (normalizedCompany.startsWith(normalizedSearch)) {
        // Near exact match: company name contains the search term
        nearExactMatches.push(company);
      } else {
        const score = this.calculateWordMatchScore(normalizedSearch, normalizedCompany);
        if (score > 0) {
          partialMatches.push({ name: company, score });
        }
      }
    }
    
    // Sort partial matches by score
    const rankedPartialMatches = partialMatches.sort((a, b) => b.score - a.score);
    
    // filter when we only have a couple near exact matches
    if (!exactMatches.length && (nearExactMatches.length > 0 && nearExactMatches.length <= 3)) {
      if ([...new Set(nearExactMatches)].length === 1) {
        exactMatches.push(nearExactMatches[0]);
        nearExactMatches = [];
      }
    }

    return { 
      exactMatches, 
      nearExactMatches, 
      partialMatches: rankedPartialMatches.map(r => r.name)
    };
  }

  private calculateWordMatchScore(searchTerm: string, companyName: string): number {
    const searchWords = searchTerm.toLowerCase().trim().split(' ');
    const companyWords = companyName.toLowerCase().trim().split(' ');
    
    let score = 0;
    let consecutiveMatches = 0;
    
    for (let i = 0; i < Math.min(searchWords.length, companyWords.length); i++) {
      if (searchWords[i] === companyWords[i]) {
        consecutiveMatches++;
        score += (i + 1) * 10; // Weight earlier matches higher
      } else {
        // Check for partial word matches
        if (companyWords[i] && companyWords[i].startsWith(searchWords[i])) {
          score += 5;
        } else if (searchWords[i] && searchWords[i].startsWith(companyWords[i])) {
          score += 3;
        }
        break; // Stop at first non-match
      }
    }
    
    // Bonus for exact consecutive matches
    score += consecutiveMatches * 20;
    
    // Penalty for length difference
    const lengthDiff = Math.abs(searchWords.length - companyWords.length);
    score -= lengthDiff * 5;
    
    return score;
  }
}

// Initialize the extension
new LinkedInCompanyChecker();
