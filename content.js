// Content script for LinkedIn Company Checker
let companies = [];
let currentCompany = null;
let matchStatus = 'none'; // 'none', 'partial', 'exact'

// Load companies from the text file
async function loadCompanies() {
  try {
    console.log('🔍 Starting to load companies...');
    const response = await fetch(chrome.runtime.getURL('companies.txt'));
    const text = await response.text();
    companies = text.split('\n').filter(line => line.trim() !== '');
    console.log('✅ Loaded', companies.length, 'companies');
    console.log('📝 First 5 companies:', companies.slice(0, 5));
  } catch (error) {
    console.error('❌ Error loading companies:', error);
  }
}

// Format company name from LinkedIn URL
function formatCompanyName(url) {
  console.log('🔗 Formatting company name from URL:', url);
  const match = url.match(/\/company\/([^\/\?]+)/);
  if (match) {
    const formatted = match[1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
    console.log('✅ Formatted company name:', formatted);
    return formatted;
  }
  console.log('❌ No company match found in URL');
  return null;
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

// Fuzzy search for company matches with weighting
function searchCompany(companyName) {
  console.log('🔍 Searching for company:', companyName);
  console.log('📊 Companies loaded:', companies.length);
  
  const normalizedSearch = companyName.toLowerCase().trim();
  console.log('🔤 Normalized search term:', normalizedSearch);
  
  const exactMatches = [];
  const nearExactMatches = [];
  const partialMatches = [];
  
  for (const company of companies) {
    const normalizedCompany = company.toLowerCase().trim();
    
    if (normalizedCompany === normalizedSearch) {
      exactMatches.push(company);
    } else if (normalizedCompany.includes(normalizedSearch)) {
      nearExactMatches.push(company);
    } else {
      const score = calculateWordMatchScore(normalizedSearch, normalizedCompany);
      if (score > 0) {
        partialMatches.push({company: company, score: score});
      }
    }
  }
  
  // Sort partial matches by score
  const rankedPartialMatches = partialMatches.sort((a, b) => b.score - a.score);
  
  console.log('✅ Search results - Exact matches:', exactMatches.length, 'Near exact matches:', nearExactMatches.length, 'Partial matches:', partialMatches.length);
  if (exactMatches.length > 0) console.log('🎯 Exact matches:', exactMatches.slice(0, 3));
  if (nearExactMatches.length > 0) console.log('🔵 Near exact matches:', nearExactMatches.slice(0, 3));
  if (rankedPartialMatches.length > 0) console.log('🔍 Top partial matches:', rankedPartialMatches.slice(0, 3).map(r => `${r.company} (score: ${r.score})`));
  
  return { 
    exactMatches, 
    nearExactMatches, 
    partialMatches: rankedPartialMatches.map(r => r.company),
    rankedPartialMatches 
  };
}

// Update extension icon badge based on match status
function updateExtensionBadge(status) {
  console.log('🎨 Updating extension badge with status:', status);
  
  let color, text;
  
  switch (status) {
    case 'exact':
      color = '#28a745';
      text = '✓';
      console.log('🟢 Setting green badge (exact match)');
      break;
    case 'nearExact':
      color = '#007bff';
      text = '≈';
      console.log('🔵 Setting blue badge (near exact match)');
      break;
    case 'partial':
      color = '#ffc107';
      text = '⚠';
      console.log('🟡 Setting orange badge (partial match)');
      break;
    case 'none':
      color = '#dc3545';
      text = '✗';
      console.log('🔴 Setting red badge (no match)');
      break;
  }
  
  // Update the extension badge
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    color: color,
    text: text
  });
  
  console.log('✅ Extension badge updated');
}

// Show results in a popup
async function showResults() {
  // Remove existing popup
  const existingPopup = document.getElementById('linkedin-company-checker-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'linkedin-company-checker-popup';
  
  // Load the template
  const response = await fetch(chrome.runtime.getURL('results-popup.html'));
  const template = await response.text();
  
  // Create a temporary div to parse the template
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template;
  
  // Get the body content
  const bodyContent = tempDiv.querySelector('body');
  popup.appendChild(bodyContent);
  
  // Update the popup with results
  to(popup);
  
  // Add close functionality
  const closeBtn = popup.querySelector('#close-popup');
  closeBtn.addEventListener('click', () => popup.remove());
  
  // Close on outside click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
  
  document.body.appendChild(popup);
}

// Update popup with results
function updatePopupResults(popup) {
  const results = searchCompany(currentCompany);
  
  // Update company name
  popup.querySelector('#current-company').textContent = currentCompany || 'Unknown';
  
  if (results.exactMatches.length > 0) {
    // Exact match
    popup.querySelector('#match-type').textContent = '✓ Exact Match Found!';
    popup.querySelector('#match-type').className = 'exact-match';
    popup.querySelector('#best-match-label').textContent = 'Match:';
    popup.querySelector('#best-match').textContent = results.exactMatches[0];
    popup.querySelector('#matches-list').style.display = 'none';
  } else if (results.nearExactMatches.length > 0) {
    // Near exact match
    popup.querySelector('#match-type').textContent = '≈ Near Match Found';
    popup.querySelector('#match-type').className = 'near-match';
    popup.querySelector('#best-match-label').textContent = 'Best Match:';
    popup.querySelector('#best-match').textContent = results.nearExactMatches[0];
    
    const allMatches = [...results.nearExactMatches, ...results.partialMatches];
    if (allMatches.length > 1) {
      popup.querySelector('#matches-summary').textContent = 
        `Show all ${allMatches.length} matches (${results.nearExactMatches.length} near exact, ${results.partialMatches.length} partial)`;
      popup.querySelector('#matches-summary').className = 'near-match';
      
      const ul = popup.querySelector('#matches-ul');
      ul.innerHTML = '';
      
      results.nearExactMatches.forEach(match => {
        const li = document.createElement('li');
        li.className = 'near-exact';
        li.textContent = `${match} (near exact)`;
        ul.appendChild(li);
      });
      
      results.partialMatches.forEach(match => {
        const li = document.createElement('li');
        li.textContent = match;
        ul.appendChild(li);
      });
      
      popup.querySelector('#matches-list').style.display = 'block';
    } else {
      popup.querySelector('#matches-list').style.display = 'none';
    }
  } else if (results.partialMatches.length > 0) {
    // Partial match
    popup.querySelector('#match-type').textContent = '⚠ Partial Matches Found';
    popup.querySelector('#match-type').className = 'partial-match';
    popup.querySelector('#best-match-label').textContent = 'Best Guess:';
    popup.querySelector('#best-match').textContent = results.partialMatches[0];
    
    if (results.partialMatches.length > 1) {
      popup.querySelector('#matches-summary').textContent = 
        `Show all ${results.partialMatches.length} partial matches`;
      popup.querySelector('#matches-summary').className = 'partial-match';
      
      const ul = popup.querySelector('#matches-ul');
      ul.innerHTML = '';
      
      results.partialMatches.forEach(match => {
        const li = document.createElement('li');
        li.textContent = match;
        ul.appendChild(li);
      });
      
      popup.querySelector('#matches-list').style.display = 'block';
    } else {
      popup.querySelector('#matches-list').style.display = 'none';
    }
  } else {
    // No match
    popup.querySelector('#match-type').textContent = '❌ No Matches Found';
    popup.querySelector('#match-type').className = 'no-match';
    popup.querySelector('#best-match-label').textContent = 'Status:';
    popup.querySelector('#best-match').textContent = 'No matches found';
    popup.querySelector('#matches-list').style.display = 'none';
  }
}

// Find company link in job details
function findCompanyInJobDetails() {
  console.log('🔍 Searching for company information in job details...');
  const jobDetailsDiv = document.querySelector('.job-view-layout.jobs-details');
  if (!jobDetailsDiv) {
    console.log('❌ Job details div not found');
    return null;
  }
  
  console.log('✅ Found job details div');
  
  // First, try to find the company name div
  const companyNameDiv = jobDetailsDiv.querySelector('.job-details-jobs-unified-top-card__company-name');
  if (companyNameDiv) {
    const companyName = companyNameDiv.textContent.trim();
    console.log('✅ Company name found in div:', companyName);
    return companyName;
  }
  
  console.log('❌ Company name div not found, looking for company links...');
  
  // Fallback: Look for any link containing "linkedin.com/company"
  const companyLinks = jobDetailsDiv.querySelectorAll('a[href*="linkedin.com/company"]');
  console.log('🔗 Found company links:', companyLinks.length);
  
  if (companyLinks.length > 0) {
    const companyUrl = companyLinks[0].href;
    console.log('✅ Company URL found:', companyUrl);
    return companyUrl;
  }
  
  console.log('❌ No company information found');
  return null;
}

// Check current page for company
async function checkCurrentPage() {
  console.log('🚀 checkCurrentPage() called');
  const url = window.location.href;
  console.log('📍 Current URL:', url);
  let companyName = null;

  if (url.includes('linkedin.com/company/')) {
    console.log('🏢 Detected company page');
    // Handle direct company pages
    companyName = formatCompanyName(url);
  } else if (url.startsWith('https://www.linkedin.com/jobs/')){
    console.log('💼 Detected job page');
    const companyInfo = findCompanyInJobDetails();
    if (companyInfo) {
      // Check if it's a URL (contains 'linkedin.com') or a company name
      if (companyInfo.includes('linkedin.com')) {
        companyName = formatCompanyName(companyInfo);
      } else {
        // It's already a company name, use it directly
        companyName = companyInfo;
      }
    }
  } else {
    console.log('❌ Not a company or job page');
  }

  console.log('🏷️ Company name found:', companyName);

  if (!companyName) {
    console.log('❌ No company name found, setting no match');
    currentCompany = null;
    matchStatus = 'none';
    updateExtensionBadge('none');
    return;
  }
    
  console.log('✅ Processing company:', companyName);
  currentCompany = companyName;
  const results = searchCompany(companyName);
  
  if (results.exactMatches.length === 1) {
    console.log('🎯 Setting exact match status (single match)');
    matchStatus = 'exact';
  } else if (results.nearExactMatches.length > 0) {
    console.log('🔵 Setting near exact match status');
    matchStatus = 'nearExact';
  } else if (results.partialMatches.length > 0) {
    console.log('🔍 Setting partial match status');
    matchStatus = 'partial';
  } else {
    console.log('❌ Setting no match status');
    matchStatus = 'none';
  }
  
  console.log('🎨 Updating extension badge with status:', matchStatus);
  updateExtensionBadge(matchStatus);
  return;
}

// Initialize the extension
async function init() {
  console.log('🚀 Extension initializing...');
  await loadCompanies(); // Load companies immediately
  console.log('✅ Companies loaded, checking current page...');
  checkCurrentPage();
  
  // Listen for URL changes (for SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      console.log('🔄 URL changed from', lastUrl, 'to', url);
      lastUrl = url;
      setTimeout(checkCurrentPage, 1000); // Small delay to let page load
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Additional monitoring for job pages to catch dynamically loaded company links
  if (window.location.href.startsWith('https://www.linkedin.com/jobs/')) {
    console.log('⏰ Setting up additional job page monitoring...');
    // Check again after a longer delay to catch dynamically loaded content
    setTimeout(checkCurrentPage, 3000);
    setTimeout(checkCurrentPage, 5000);
  }
  
  console.log('✅ Extension initialization complete');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Received message:', request);
  if (request.action === 'showResults') {
    console.log('🖱️ Extension icon clicked, showing results');
    showResults();
  }
});

// Start the extension
init();
