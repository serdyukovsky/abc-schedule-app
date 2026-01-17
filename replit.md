# ABC — Altai Business Camp

## Overview

ABC is a cross-platform mobile event management application for business camp attendees. Users can browse event schedules, filter by track/theme, and manage their personal agenda with conflict detection. The app follows a brutally minimal, productivity-focused design philosophy with a timeline-based interface.

**Core Features:**
- Timeline-based schedule view with sticky time labels
- Personal schedule management with conflict detection
- Event filtering by track/theme and date
- Swipe actions for quick event management
- "Now" indicator for current events

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture (React Native/Expo)
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation v7 with native stack and bottom tabs
- **State Management**: React Context (EventContext) for event data, TanStack Query for server state
- **Local Persistence**: AsyncStorage for saving user preferences (planned/saved events)
- **Animations**: React Native Reanimated for smooth interactions
- **Styling**: StyleSheet API with a centralized theme system (`client/constants/theme.ts`)

**Directory Structure:**
- `client/` - All frontend code
- `client/screens/` - Main screen components (Schedule, MySchedule, EventDetails)
- `client/components/` - Reusable UI components
- `client/navigation/` - Navigation configuration
- `client/context/` - React Context providers
- `client/hooks/` - Custom hooks (useTheme, useScreenOptions)

### Backend Architecture (Express)
- **Framework**: Express 5 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared types between client and server
- **Current State**: Minimal API setup with in-memory storage; database integration ready but not fully implemented

### Design Patterns
- **MVVM-like structure**: Screens handle presentation, Context handles business logic
- **Path aliases**: `@/` maps to `client/`, `@shared/` maps to `shared/`
- **Theming**: Light/dark mode support with automatic system detection
- **Component composition**: Small, focused components combined for complex UIs

### Key Architectural Decisions

1. **Timeline UX Pattern**: Events grouped by start time with a left time column and right event cards column, allowing clear visualization of parallel events

2. **Offline-First Design**: Event state persisted locally via AsyncStorage; backend integration prepared but currently uses mock data

3. **Conflict Detection**: When adding events, the system checks for time overlaps with existing planned events and presents resolution options

## External Dependencies

### Third-Party Services
- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable)
- **Fonts**: Nunito via `@expo-google-fonts/nunito`

### Key Libraries
- **UI/Animations**: react-native-reanimated, react-native-gesture-handler, expo-haptics
- **Data**: @tanstack/react-query, drizzle-orm, drizzle-zod, zod
- **Platform**: expo-blur, expo-image, expo-splash-screen
- **Storage**: @react-native-async-storage/async-storage

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN` - API server domain for client requests
- `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` - Replit-specific CORS configuration