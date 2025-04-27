# Line Drawer

This project draws geometric patterns on an HTML canvas based on user input, built with TypeScript and Vite.

## Features

*   Draws lines based on specified angles and lengths.
*   Two angle modes: Fraction Denominator and Angle List (semicolon-separated degrees).
*   Adjustable line count, length, and drawing delay.
*   High-DPI canvas support for sharp rendering.
*   Drawing automatically recenters and scales to fit the canvas with margin.
*   Keyboard shortcuts (Enter to draw, Escape to stop).
*   Download canvas as PNG.

## Setup

1.  Clone the repository (if applicable).
2.  Install dependencies:
    ```bash
    npm install
    ```

## Development

To start the Vite development server:

```bash
npm run dev
```

This will open the application in your browser (usually at `http://localhost:5173/`) with hot module replacement (HMR) enabled.

## Build

To create an optimized production build:

```bash
npm run build
```

This generates static assets in the `dist/` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Linting / Type Checking

To check for TypeScript errors without building:

```bash
npm run tsc:check
```

## Run

Open the `index.html` file in your web browser.

Enter values for Angle (in units of π), Number of lines, and Line length, then click "Draw". 