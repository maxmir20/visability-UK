# Visa-bility - React/TypeScript Version

A modern Chrome extension built with React and TypeScript that checks Job Posting sites against a list of companies with UK Sponsor Licenses.

## Features

- **Modern Architecture**: Built with React 18, TypeScript, and Webpack
- **Type Safety**: Full TypeScript support with strict type checking
- **Component-Based**: Modular React components for maintainability
- **Enhanced Matching**: Intelligent fuzzy search with weighted scoring
- **Visual Indicators**: Extension badge changes color based on match status
- **Interactive Popup**: Modern React-based results display

## Tech Stack

- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Webpack 5** - Module bundler
- **Chrome Extension APIs** - Browser extension functionality

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Development mode** (with hot reload):
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Type checking**:
   ```bash
   npm run type-check
   ```

### Loading the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder (after building)

## Project Structure

```
src/
├── components/
│   ├── ResultsPopup.tsx    # Results display component
│   └── ResultsPopup.css    # Component styles
├── types.ts                # TypeScript type definitions
├── utils.ts                # Utility functions
├── content.tsx             # Main content script
├── background.ts           # Background service worker
├── popup.tsx               # Extension popup component
├── popup.html              # Popup HTML template
└── popup.css               # Popup styles
```

## Key Improvements Over Vanilla JS Version

### 1. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- Better IDE support and autocomplete

### 2. **Component Architecture**
- Reusable React components
- Clean separation of concerns
- Easier testing and maintenance

### 3. **Modern Development Experience**
- Hot reloading during development
- Webpack bundling and optimization
- Better debugging tools

### 4. **Enhanced Maintainability**
- Modular code structure
- Clear interfaces and types
- Consistent coding patterns

## Building and Deployment

The extension is built using Webpack, which:
- Bundles all TypeScript/React code
- Optimizes for production
- Generates the `dist` folder with all necessary files

## Comparison with Vanilla JS Version

| Feature | Vanilla JS | React/TypeScript |
|---------|------------|------------------|
| Type Safety | ❌ | ✅ |
| Component Reusability | ❌ | ✅ |
| Development Experience | Basic | Modern |
| Bundle Size | Smaller | Larger (but optimized) |
| Maintainability | Moderate | High |
| Testing | Difficult | Easy |

## License

This project is part of the LinkedIn Company Checker extension suite.
