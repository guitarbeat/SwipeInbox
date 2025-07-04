# SwipeEmail - Email Management Application

## Overview

SwipeEmail is a modern email management application built with React and Express.js that allows users to process emails through an intuitive swipe-based interface. The application features a Tinder-like card stack UI for email triaging, with the ability to swipe left to delete emails and right to save them for later.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth animations and transitions
- **Gestures**: @use-gesture/react for swipe interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite integration

### Component Structure
The application uses a component-based architecture with:
- **UI Components**: Reusable shadcn/ui components
- **Feature Components**: Email-specific components (CardStack, EmailCard, etc.)
- **Layout Components**: Header, stats grid, progress indicators
- **Hooks**: Custom hooks for swipe gestures and mobile detection

## Key Components

### Email Processing System
- **CardStack**: Manages the stack of email cards and swipe interactions
- **EmailCard**: Individual email display with sender info, subject, and metadata
- **SwipeOverlay**: Visual feedback during swipe gestures
- **ActionButtons**: Alternative UI for users who prefer clicking over swiping

### Data Management
- **Storage Interface**: Abstracted storage layer supporting both memory and database storage
- **Email Schema**: Drizzle schema defining email and stats tables
- **API Routes**: RESTful endpoints for email operations

### User Interface
- **Responsive Design**: Mobile-first approach with desktop adaptations
- **Progressive Enhancement**: Touch gestures on mobile, mouse interactions on desktop
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

1. **Email Loading**: Application fetches emails from `/api/emails/status/inbox`
2. **Card Display**: CardStack component renders email cards in a stack layout
3. **User Interaction**: Users swipe cards or use action buttons
4. **State Update**: Swipe actions trigger API calls to update email status
5. **UI Refresh**: React Query invalidates cache and refetches updated data
6. **Statistics**: Stats component displays processing metrics

### Email States
- `inbox`: Newly received emails awaiting processing
- `later`: Emails saved for later review
- `archived`: Processed emails moved to archive
- `deleted`: Emails marked for deletion

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query
- **Build Tools**: Vite, TypeScript, ESBuild
- **Database**: Drizzle ORM, Neon PostgreSQL driver
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Animation**: Framer Motion, @use-gesture/react

### Development Dependencies
- **Type Checking**: TypeScript with strict mode
- **Code Quality**: ESLint, Prettier (configured via components.json)
- **Development Tools**: Replit integration, hot reload, error overlay

### Database Schema
The application uses a PostgreSQL database with two main tables:
- **emails**: Stores email data including sender, subject, body, status, and metadata
- **stats**: Tracks daily processing statistics

## Deployment Strategy

### Production Build
- Frontend builds to `dist/public` directory
- Backend builds to `dist/index.js` using ESBuild
- Static assets served by Express in production

### Environment Configuration
- Database URL required via `DATABASE_URL` environment variable
- Development mode uses Vite dev server with HMR
- Production mode serves static files from Express

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon serverless recommended)
- Environment variables for database connection

## Changelog

```
Changelog:
- July 04, 2025. Initial setup with React/TypeScript prototype
- July 04, 2025. Integrated PostgreSQL database for persistent data storage
- July 04, 2025. Fixed swipe movement issues and improved drag responsiveness
- July 04, 2025. Implemented IMAP email integration with support for Gmail, Yahoo, Outlook, and iCloud
- July 04, 2025. Added comprehensive email connection interface with step-by-step provider setup instructions
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```