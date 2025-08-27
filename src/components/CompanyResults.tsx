import React from 'react';
import { SearchResults } from '../types';
import './CompanyResults.css';

interface CompanyResultsProps {
  currentCompany: string | null;
  results: SearchResults;
  variant?: 'popup' | 'overlay';
}

export const CompanyResults: React.FC<CompanyResultsProps> = ({ 
  currentCompany, 
  results, 
  variant = 'popup' 
}) => {
  const { exactMatches, nearExactMatches, partialMatches } = results;

  const renderContent = () => {
    if (exactMatches.length > 0) {
      return (
        <>
          <div className="header">
            <h3 className="exact-match">✓ Exact Match Found!</h3>
          </div>
          <div className="company-info">
            <p><strong>Company:</strong> {currentCompany}</p>
            <p className="best-match"><strong>Match:</strong> {exactMatches[0]}</p>
          </div>
        </>
      );
    } else if (nearExactMatches.length > 0) {
      const allMatches = [...nearExactMatches, ...partialMatches];
      return (
        <>
          <div className="header">
            <h3 className="near-match">≈ Near Match Found</h3>
          </div>
          <div className="company-info">
            <p><strong>Company:</strong> {currentCompany}</p>
            <p className="best-match"><strong>Best Match:</strong> {nearExactMatches[0]}</p>
          </div>
          {allMatches.length > 1 && (
            <div className="collapsible">
              <details>
                <summary className="near-match">
                  Show all {allMatches.length} matches ({nearExactMatches.length} near exact, {partialMatches.length} partial)
                </summary>
                <ul>
                  {nearExactMatches.map((match, index) => (
                    <li key={`near-${index}`} className="near-exact">
                      {match} (near exact)
                    </li>
                  ))}
                  {partialMatches.map((match, index) => (
                    <li key={`partial-${index}`}>{match}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </>
      );
    } else if (partialMatches.length > 0) {
      return (
        <>
          <div className="header">
            <h3 className="partial-match">⚠ Partial Matches Found</h3>
          </div>
          <div className="company-info">
            <p><strong>Company:</strong> {currentCompany}</p>
            <p className="best-match"><strong>Best Guess:</strong> {partialMatches[0]}</p>
          </div>
          {partialMatches.length > 1 && (
            <div className="collapsible">
              <details>
                <summary className="partial-match">
                  Show all {partialMatches.length} partial matches
                </summary>
                <ul>
                  {partialMatches.map((match, index) => (
                    <li key={index}>{match}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          <div className="header">
            <h3 className="no-match">❌ No Matches Found</h3>
          </div>
          <div className="company-info">
            <p>Sorry, no matches found for: <strong>{currentCompany}</strong></p>
          </div>
        </>
      );
    }
  };

  return (
    <div className={`company-results company-results--${variant}`}>
      {renderContent()}
    </div>
  );
};
