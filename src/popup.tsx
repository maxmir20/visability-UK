import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchResults } from './types';
import { CompanyResults } from './components/CompanyResults';
import './components/CompanyResults.css';

const Popup: React.FC = () => {
  const [currentCompany, setCurrentCompany] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      if (!activeTab.url || !activeTab.url.includes('linkedin.com')) {
        setError('This extension only works on LinkedIn pages.');
        setLoading(false);
        return;
      }

      // Send message to content script to get current company and results
      chrome.tabs.sendMessage(activeTab.id!, { action: 'getCurrentResults' }, (response) => {
        if (chrome.runtime.lastError) {
          setError('Unable to get company data. Please refresh the page and try again.');
          setLoading(false);
          return;
        }

        if (response && response.currentCompany) {
          setCurrentCompany(response.currentCompany);
          setResults(response.results);
        } else {
          setError('No company found on this page. Navigate to a LinkedIn company or job page.');
        }
        setLoading(false);
      });
    });
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (!currentCompany || !results) {
      return (
        <div className="message">
          <p>No company found on this page.</p>
          <p>Navigate to a LinkedIn company or job page to see results.</p>
        </div>
      );
    }

    return (
      <CompanyResults
        currentCompany={currentCompany}
        results={results}
        variant="popup"
      />
    );
  };

  return (
    <div className="popup">
      <div className="header">
        <div className="icon">🔍</div>
        <h1>LinkedIn Company Checker</h1>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

// Render the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
