# Salty

Custom JavaScript modules for the Salty website, featuring interactive maps, product sliders, and UI components.

## Overview

This repository contains the frontend JavaScript modules for the Salty website, a beach and outdoor products company. The codebase includes:

- Interactive Mapbox-powered map for beach locations
- Product sliders for different categories (Kiddos, Sun Protection, Transport)
- Custom SVG path animations for UI elements
- Development utilities

## Setup

### Prerequisites

- Node.js (v14 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/stormfors-webmaster/salty-testing.git
   cd salty-testing
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn
   ```

3. Install live-server globally (if not already installed):
   ```bash
   npm install -g live-server
   # or
   pnpm add -g live-server
   # or
   yarn global add live-server
   ```

## Development

### Running the development server

```bash
npm run dev
# or
pnpm run dev
# or
yarn dev
```

This will:

- Start a development server on port 3000
- Open the application in your default browser
- Enable live reloading for changes

### Development Mode

The application includes a development mode that can be toggled in the browser:

```javascript
// In browser console
toggleDevMode(); // Toggles dev mode on/off
```

When dev mode is active, additional debugging features and console logs are available.

### Project Structure

- `src/index.js` - Main entry point
- `src/modules/` - Core components:
  - `map.js` - Mapbox map implementation
  - `slider.js` - Product slider component
  - `notch.js` - SVG path animations
- `src/utils/` - Utility functions
  - `devmode.js` - Development utilities

## Building for Production

```bash
npm run build
# or
pnpm run build
# or
yarn build
```

This will create a minified bundle in the `dist/` directory.

## Deployment

### Development Deployment

The project is deployed using Vercel for development. The source files are served directly from:
`https://salty-gamma.vercel.app/src/index.js`

Features:

- Direct access to source files (no build step needed)
- Instant updates on new deployments
- No caching issues during development
- Automatic deployments from main branch
- ES modules support

To use in development:

1. Push changes to main branch
2. Changes are immediately available at the deployment URL
3. No build step required

### Production Deployment

For production, the files will be built and hosted in Webflow.

## Mapbox Configuration

The map component uses Mapbox GL JS. To modify the map:

1. Update the token in `src/modules/map.js` if needed
2. Adjust the default zoom, position, and style URL as required
3. Modify marker data for beach locations

## Adding New Features

### New Product Category

To add a new product category slider:

1. Add the HTML structure in the appropriate page
2. Initialize a new Slider instance in `src/index.js`:

```javascript
const newSlider = new Slider({
  containerId: "slider-new-category",
  prevBtnId: "prev-button-new-category",
  nextBtnId: "next-button-new-category",
  itemWidth: "22rem",
  stepSize: 1,
  maxItems: 10,
  categoryUrl: "/product-categories/new-category",
});
```

## License

ISC
