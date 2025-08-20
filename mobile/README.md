# MindSpace AI - React Native App

A comprehensive mental health and productivity companion app built with React Native, Expo, and TypeScript. Features AI-powered task management, mood tracking, crisis support, and more.

## 🚀 Features

### Core Functionality
- **Google OAuth Authentication** - Secure sign-in with Supabase
- **Dashboard** - Quick mood logging, daily stats, and streak tracking
- **Mood Tracker** - CRUD operations for mood entries with scores and notes
- **Tasks & Goals** - Full task management (create, complete, delete)
- **Crisis Support** - Panic-attack optimized page with grounding techniques and breathing exercises
- **AI Chatbot** - Floating Gemini-powered assistant for task suggestions and management

### Technical Features
- **Expo + TypeScript** for cross-platform development
- **React Navigation** with Stack (Auth) + Bottom Tabs (Main app)
- **TanStack Query** for server state management
- **Supabase** for backend (auth, database, real-time)
- **NativeWind** (Tailwind CSS for React Native) for styling
- **AsyncStorage** for auth persistence

## 📱 Screens

1. **Authentication Screen** - Google OAuth sign-in
2. **Dashboard Tab** - Quick mood check, daily stats, streak counter
3. **Tasks Tab** - Task management with add/edit/complete/delete
4. **Mood Tab** - Mood logging and history
5. **Crisis Support Tab** - Emergency resources and grounding techniques
6. **Floating AI Chat** - Gemini-powered task assistance

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account and project
- Google OAuth credentials
- Gemini API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Set up Google OAuth provider in Authentication > Providers
3. Create the following tables:

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Moods Table
```sql
CREATE TABLE moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Set up Row Level Security (RLS) policies for each table
5. Enable real-time subscriptions if needed

### 4. Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - For development: `http://localhost:19006/auth/callback`
   - For production: `your-app-scheme://auth/callback`
4. Configure Supabase with your Google OAuth credentials

### 5. Gemini API Setup
1. Get API key from Google AI Studio
2. Add to your environment variables
3. The app will use this for AI-powered task suggestions

## 🚀 Running the App

### Development
```bash
npx expo start
```

### Build for Production
```bash
# Install EAS CLI
npm install -g @eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for platforms
eas build --platform android
eas build --platform ios
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   └── FloatingChatButton.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # External service configurations
│   └── supabase.ts
├── navigation/        # Navigation components
│   ├── AppNavigator.tsx
│   └── RootNavigator.tsx
└── screens/          # App screens
    ├── AuthScreen.tsx
    ├── DashboardScreen.tsx
    ├── TasksScreen.tsx
    ├── MoodScreen.tsx
    ├── CrisisScreen.tsx
    └── LoadingScreen.tsx
```

## 🔧 Configuration Files

- `app.json` - Expo configuration
- `tailwind.config.js` - NativeWind/Tailwind configuration
- `babel.config.js` - Babel configuration with NativeWind plugin
- `tsconfig.json` - TypeScript configuration

## 🎨 Styling

The app uses NativeWind (Tailwind CSS for React Native) with a custom color palette:
- **Primary**: Blue tones for general UI elements
- **MindSpace**: Purple tones for brand-specific elements
- **Semantic**: Red for crisis/emergency, green for success, etc.

## 🔐 Security Features

- Google OAuth authentication via Supabase
- Row Level Security (RLS) on all database tables
- Environment variable protection for API keys
- Secure token storage with AsyncStorage

## 📊 Data Management

- **React Query** for server state management
- **Real-time updates** via Supabase subscriptions
- **Optimistic UI updates** for better user experience
- **Query invalidation** for data consistency

## 🤖 AI Integration

The floating chatbot uses Google's Gemini API to:
- Suggest relevant tasks based on user input
- Mark tasks as complete by title matching
- Delete tasks by title matching
- Provide general mental health support

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📱 Platform Support

- ✅ iOS (Expo Go + Native builds)
- ✅ Android (Expo Go + Native builds)
- ✅ Web (Expo Web)

## 🚨 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **NativeWind not working**: Ensure babel plugin is configured correctly
3. **Supabase connection errors**: Check environment variables and network
4. **Google OAuth redirect issues**: Verify redirect URIs in Google Console

### Getting Help

- Check Expo documentation: https://docs.expo.dev/
- Supabase documentation: https://supabase.com/docs
- NativeWind documentation: https://www.nativewind.dev/

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Powered by [Supabase](https://supabase.com/)
- AI capabilities via [Google Gemini](https://ai.google.dev/)
- Styling with [NativeWind](https://www.nativewind.dev/)
- State management with [TanStack Query](https://tanstack.com/query)
