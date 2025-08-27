# LinkedIn Company Checker

A Chrome extension that checks LinkedIn company pages against a list of approved companies from your CSV data.

## Project Structure

This repository contains two versions of the LinkedIn Company Checker extension:

### 📁 **Main Directory (Vanilla JavaScript)**
- **`content.js`** - Main content script for LinkedIn page detection
- **`background.js`** - Background service worker for badge management
- **`popup.html`** - Default extension popup
- **`results-popup.html`** - Results display template
- **`companies.txt`** - Company data (136,144 companies)
- **`2025-08-19_-_Worker_and_Temporary_Worker.csv`** - Original CSV data

### 📁 **`linkedin-company-checker-react/` (React/TypeScript)**
- **Modern React/TypeScript implementation**
- **Component-based architecture**
- **Type-safe development**
- **Webpack bundling**

## Features

- **🔍 Company Detection**: Automatically detects companies on LinkedIn pages
- **🎯 Smart Matching**: Fuzzy search with weighted scoring
- **🎨 Visual Indicators**: Extension badge changes color based on match status
- **📊 Results Display**: Interactive popup with detailed match information
- **🔄 Real-time Updates**: Works with LinkedIn's SPA navigation

## Badge Colors

- **🟢 Green (✓)**: Exact match found
- **🔵 Blue (≈)**: Near exact matches found
- **🟡 Orange (⚠)**: Partial matches found
- **🔴 Red (✗)**: No matches found

## Installation

### Vanilla JavaScript Version
1. Load the extension directly from the main directory
2. No build process required

### React/TypeScript Version
1. Navigate to `linkedin-company-checker-react/`
2. Run `npm install`
3. Run `npm run build`
4. Load the `dist` folder as an extension

## Usage

1. **Navigate to LinkedIn**: Visit any LinkedIn company or job page
2. **Check Extension Badge**: Look for the colored indicator in your browser toolbar
3. **Click for Details**: Click the extension icon to see detailed match results
4. **View Results**: See exact matches, near matches, or partial matches with rankings

## Development

Choose your preferred version:
- **Vanilla JS**: Simple, lightweight, no build process
- **React/TypeScript**: Modern, type-safe, component-based

Both versions provide the same functionality with different architectural approaches.
