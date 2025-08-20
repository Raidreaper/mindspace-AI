# MindSpace Calm Hub

A React + Vite + TypeScript app for mental wellness and productivity. Features Supabase authentication, moods and tasks persistence, and an AI chatbot powered by Google Gemini.

## Tech Stack
- React 18 + TypeScript
- Vite
- shadcn-ui + Tailwind CSS
- Supabase (Auth + Postgres)
- TanStack Query
- Google Gemini API (`@google/generative-ai`)

## Development
```sh
npm i
npm run dev
```

Create a `.env` in the project root:
```
VITE_SUPABASE_URL=...your supabase url...
VITE_SUPABASE_ANON_KEY=...your supabase anon key...
VITE_GEMINI_API_KEY=...your gemini api key...
```

## Build
```sh
npm run build
npm run preview
```

## Notes
- Environment variables are read from `.env` only.
- No Lovable dependencies or branding remain.
