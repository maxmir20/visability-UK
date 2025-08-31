// Fuzzy search for company matches with weighting
function searchCompany(companyName, companies) {
  const normalizedSearch = companyName.toLowerCase().trim();
  
  let exactMatches = [];
  let nearExactMatches = [];
  let partialMatches = [];
  
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

// Calculate word match score for ranking
function calculateWordMatchScore(searchTerm, companyName) {
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

// Load companies from the text file
async function loadCompanies(){
  try {
    const response = await fetch(chrome.runtime.getURL('companies.txt'));
    const text = await response.text();
    return text.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error('Error loading companies:', error);
    return [];
  }
}

// Make functions globally available
window.searchCompany = searchCompany;
window.loadCompanies = loadCompanies;
