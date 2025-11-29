# Modavista Showcase

A pared-back, front-end–only landing page ready for presenting your brand, collections, or announcements. All backend, admin, and data-handling code has been removed so you can deploy the site anywhere static hosting is supported.

## What's inside
- Single-page React + Vite app focused on content presentation.
- Minimal styling with handcrafted CSS—no Tailwind or third-party widgets.
- Easy to customize sections for highlights, spotlights, and contact links.

## Getting started
1. Install dependencies
   ```bash
   npm run install:all
   ```
2. Start the local dev server
   ```bash
   npm run dev
   ```
3. Build for production
   ```bash
   npm run build
   ```

## Customization tips
- Update text and links in `frontend/src/App.tsx`.
- Adjust colors and layout in `frontend/src/index.css`.
- Replace metadata or fonts in `frontend/index.html`.

## Deployment
The project builds to static assets via Vite. Host the `frontend/dist` output on any static provider (Netlify, Vercel, GitHub Pages, etc.).
