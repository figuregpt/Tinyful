# Tinyful - AI Goal Planning App

A Duolingo-themed goal planning application powered by ElizaOS and Claude API. Break down your goals into actionable steps with the help of Tino, your friendly AI planning assistant.

## Features

- **AI-Powered Planning**: Chat with Tino to transform your goals into structured, actionable plans
- **Interactive Questions**: Answer clarifying questions to personalize your plans
- **Step Tracking**: Track progress on each step of your plan
- **Cross-Platform**: Works on iOS, Android, and Web
- **Cloud Sync**: All your plans are securely stored in the cloud

## Tech Stack

- **Frontend**: Expo SDK 52 + React Native + TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand + React Query
- **Backend**: Supabase (Auth + PostgreSQL + Edge Functions)
- **AI**: ElizaOS on Eliza Cloud

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- Supabase account
- Eliza Cloud account
- Railway account (for backend)

### Installation

1. Clone the repository and install dependencies:

```bash
cd tinyful
npm install
```

2. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor
   - Enable Email Auth in Authentication settings
   - Copy your project URL and anon key

3. Set up Eliza Cloud:
   - Go to https://elizacloud.ai and create an account
   - Create a new agent using Agent Creator
   - Copy your Agent ID from the URL (e.g., `b959d549-73b6-4853-8e3c-8e323b54048c`)
   - Get your API key from Dashboard → API Keys

4. Deploy Backend to Railway:

```bash
cd server
npm install
```

   - Go to https://railway.app and create new project
   - Connect your GitHub repo or deploy from local
   - Set environment variables in Railway:
     - `ELIZA_API_URL=https://elizacloud.ai/api/v1`
     - `ELIZA_API_KEY=ek_live_xxxxxxxxxxxx`
     - `ELIZA_AGENT_ID=your-agent-id`
   - Railway will give you a URL like: `https://tinyful-api-production.up.railway.app`

5. Create `.env.local` for Expo app:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=https://tinyful-api-production.up.railway.app
```

6. Start the development server:

```bash
npm start
```

### Running on Different Platforms

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## Project Structure

```
tinyful/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens (login, register)
│   ├── (tabs)/            # Main tab navigation
│   │   ├── chat.tsx       # ElizaOS chat interface
│   │   ├── plans.tsx      # Plans list
│   │   └── profile.tsx    # User profile
│   ├── plan/[id].tsx      # Plan detail view
│   └── _layout.tsx        # Root layout
├── components/
│   ├── chat/              # Chat UI components
│   ├── plan/              # Plan UI components
│   └── ui/                # Base UI components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── eliza.ts           # ElizaOS API client
│   ├── api/               # API helper functions
│   └── stores/            # Zustand stores
├── eliza/                 # ElizaOS character config
│   └── character.ts
└── theme/                 # Theme tokens
```

## Database Schema

See `supabase/schema.sql` for the complete database schema including:

- `plans` - User goals/plans
- `steps` - Individual steps within plans
- `chat_sessions` - Chat conversation sessions
- `messages` - Chat messages history

## ElizaOS Character

The AI assistant "Tino" is configured in `eliza/character.ts`. Key features:

- Duolingo-inspired personality (encouraging, supportive)
- Structured question/answer flow for gathering goal details
- Generates plans in JSON format for easy parsing
- Uses Claude 3.5 Sonnet for intelligent responses

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
