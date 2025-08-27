/// <reference types="chrome"/>

import { Company, SearchResults } from './types';
import { jobSiteFactory } from './jobSiteHandlers';

// Calculate word match score for ranking
export function calculateWordMatchScore(searchTerm: string, companyName: string): number {
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

// Fuzzy search for company matches with weighting
export function searchCompany(companyName: string, companies: string[]): SearchResults {
  const normalizedSearch = companyName.toLowerCase().trim();
  
  let exactMatches: string[] = [];
  let nearExactMatches: string[] = [];
  let partialMatches: Company[] = [];
  
  for (const company of companies) {
    const normalizedCompany = company.toLowerCase().trim();
    
    if (normalizedCompany === normalizedSearch) {
      exactMatches.push(company);
    } else if (normalizedCompany.startsWith(normalizedSearch)) {
      // Near exact match: company name contains the search term
      nearExactMatches.push(company);
    } else {
      const score = calculateWordMatchScore(normalizedSearch, normalizedCompany);
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

// Load companies from the text file
export async function loadCompanies(): Promise<string[]> {
  try {
    const response = await fetch(chrome.runtime.getURL('companies.txt'));
    const text = await response.text();
    return text.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error('Error loading companies:', error);
    return [];
  }
}

// Export the factory function for use in content script
export function extractCompanyNameFromUrl(url: string): string | null {
  return jobSiteFactory.extractCompanyName(url);
}
