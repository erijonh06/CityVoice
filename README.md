# CityVoice

CityVoice is a civic engagement app that helps residents report local issues, follow community updates, and participate in improving their city.

## Features

- Interactive map for creating and browsing civic reports
- Report status tracking and image attachments
- Community points, leaderboards, and profile progress
- City news, polls, notifications, and weather
- Optional AI-assisted report analysis and civic chat
- English and Albanian translations

## Requirements

- Node.js 18 or newer
- A Gemini API key for AI-assisted features

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env.local` instead.

3. Add your API key to `.env.local`:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open the local URL shown by Vite in your browser.

## Available Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.

## Security

Never commit `.env.local` or any API key. The included `.env.example` is safe to copy and contains only a placeholder value. Rotate any key that may have been exposed before publishing this repository.

## License

No license has been selected for this project yet. Add a license before accepting external contributions or allowing reuse.
