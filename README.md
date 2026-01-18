# Tinyful - AI Goal Planning App

A Duolingo-themed goal planning application powered by Google Gemini. Break down your goals into actionable steps with the help of Tino, your friendly AI planning assistant.

## Features

- **AI-Powered Planning**: Chat with Tino to transform your goals into structured, actionable plans
- **Interactive Questions**: Answer clarifying questions to personalize your plans
- **Step Tracking**: Track progress on each step of your plan
- **Cross-Platform**: Works on iOS, Android, and Web
- **Cloud Sync**: All your plans are securely stored in the cloud

## Tech Stack

- **Frontend**: Expo SDK 54 + React Native + TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Backend**: Supabase (Auth + PostgreSQL)
- **AI**: Google Gemini 2.5 Flash

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account
- Google AI API key (Gemini)

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

3. Create `.env.local` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=http://localhost:3002
GEMINI_API_KEY=your-gemini-api-key
```

4. Install server dependencies:

```bash
cd server
npm install
```

5. Start the development server:

```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start Expo
npm start
```

Or run both together:

```bash
npm run dev
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
│   │   ├── chat.tsx       # AI chat interface
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
│   ├── eliza.ts           # AI API client
│   ├── api/               # API helper functions
│   └── stores/            # Zustand stores
├── server/                # Backend server (Gemini proxy)
│   └── index.js
└── theme/                 # Theme tokens
```

## Database Schema

See `supabase/schema.sql` for the complete database schema including:

- `plans` - User goals/plans
- `steps` - Individual steps within plans
- `chat_sessions` - Chat conversation sessions
- `messages` - Chat messages history

## AI Assistant (Tino)

Tino is the AI planning assistant with a Duolingo-inspired personality:

- Friendly and encouraging tone
- Asks clarifying questions one at a time
- Provides multiple choice options for easy interaction
- Generates detailed, actionable plans with specific steps
- Celebrates progress and keeps users motivated

The AI logic is implemented in `server/index.js` using Google Gemini 2.5 Flash.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
