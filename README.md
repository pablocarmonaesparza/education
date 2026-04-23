# AI Automation Course Platform

A personalized learning platform that generates custom AI automation courses based on user project ideas. Built with Next.js 16, Supabase, and n8n for intelligent course generation using RAG (Retrieval-Augmented Generation).

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Core Features](#core-features)
- [User Flow](#user-flow)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Components Overview](#components-overview)
- [Deployment](#deployment)

---

## Overview

This platform revolutionizes AI education by creating **100% personalized learning paths**. Users describe their project idea, and the system generates a complete video course curriculum tailored specifically to their needs using AI and a knowledge base of educational content.

### What Makes This Unique?

- **AI-Powered Course Generation**: Uses n8n workflows with RAG to analyze user projects and generate custom learning paths
- **Personalized Content**: Every course is unique, matching the user's specific project and skill level
- **Gamification**: XP, levels, streaks, and achievement badges keep learners motivated
- **Progress Tracking**: Visual progress builder showing course completion and project development
- **Dark Mode Support**: Full dark mode implementation for better user experience

---

## Key Features

### 1. Intelligent Onboarding
- Users describe their AI automation project idea
- Real-time progress tracking during course generation
- AI analyzes the project and maps it to relevant video content

### 2. Personalized Dashboard
- Custom welcome message with project context
- Progress cards tracking videos, phases, and checkpoints
- Gamification stats (XP, level, streak, weekly goals)
- Visual progress builder showing overall completion

### 3. Custom Learning Path
- Multi-phase curriculum organized by learning objectives
- Each phase contains curated videos with:
  - Video title and description
  - Duration and order
  - "Why relevant" explanations specific to user's project
  - Section and subsection organization
- Total estimated hours and video count
- Recommendations and next steps

### 4. Video Player
- Embedded video player supporting Vimeo and YouTube
- Phase and video navigation
- Progress tracking per video
- Related content suggestions

### 5. Authentication
- Google OAuth integration via Supabase
- Email/password authentication
- Secure session management
- Protected routes with automatic redirects

### 6. Landing Page
- Hero section with clear value proposition
- Problem/solution presentation
- Differentiators section
- Course structure overview
- Pricing section
- FAQ section

---

## Technology Stack

### Frontend
- **Next.js 16** (App Router with Turbopack)
- **React 19.2** (with Server Components)
- **TypeScript 5.9**
- **Tailwind CSS 3.4** (with dark mode)

### Backend & Database
- **Supabase** (PostgreSQL database + Auth)
- **n8n** (Workflow automation for course generation)

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side Supabase helpers
- `@supabase/auth-helpers-nextjs` - Next.js auth integration

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## Project Structure

```
Education/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── generate-course/      # Course generation endpoint
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/                # Protected dashboard
│   │   ├── my-path/              # Learning path viewer
│   │   │   └── video/            # Video player pages
│   │   │       └── [phaseId]/    # Dynamic phase routes
│   │   │           └── [videoId]/ # Dynamic video routes
│   │   ├── courses/              # Course management
│   │   ├── progress/             # Progress tracking
│   │   └── layout.tsx            # Dashboard layout
│   ├── onboarding/               # Project intake form
│   ├── demo/                     # Demo pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React Components
│   ├── auth/                     # Authentication components
│   │   └── AuthForm.tsx
│   ├── dashboard/                # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── ProgressCard.tsx
│   │   ├── CourseCard.tsx
│   │   ├── GamificationStats.tsx
│   │   ├── AchievementBadges.tsx
│   │   ├── ProgressBuilder.tsx
│   │   └── DashboardClientLayout.tsx
│   ├── landing/                  # Landing page sections
│   │   ├── NewHeroSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── AvailableCoursesSection.tsx
│   │   ├── CourseStructureSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── AnimatedBackground.tsx
│   │   └── HeroShader.tsx
│   └── shared/                   # Shared components
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── contexts/                     # React Contexts
│   └── ThemeContext.tsx          # Dark mode context
│
├── lib/                          # Utility libraries
│   └── supabase/                 # Supabase clients
│       ├── client.ts             # Client-side
│       └── server.ts             # Server-side
│
├── public/                       # Static assets
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- n8n instance (cloud or self-hosted)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   cd /path/to/Education
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables))

4. **Set up Supabase**
   - Create a new Supabase project
   - Create the `intake_responses` table (see [Database Schema](#database-schema))
   - Enable Google OAuth (optional)
   - Copy your project URL and anon key to `.env.local`

5. **Set up n8n workflow**
   - Create or import the course generation workflow
   - Configure RAG with your video knowledge base
   - Copy the webhook URL to `.env.local`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# n8n Webhook for Course Generation
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Payment Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional: LatAm Payments
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=

# Optional: AI Features
ANTHROPIC_API_KEY=
```

### Environment Variable Details

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | n8n webhook for course generation | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | ✅ Yes |
| Stripe variables | For payment processing | ❌ Optional |
| Mercado Pago variables | For LatAm payments | ❌ Optional |
| `ANTHROPIC_API_KEY` | For Claude AI features | ❌ Optional |

---

## Core Features

### 1. Course Generation Flow

**User Journey:**
1. User completes onboarding form with project idea
2. Frontend calls `/api/generate-course`
3. API triggers n8n webhook with user data
4. n8n workflow:
   - Analyzes project description
   - Searches video knowledge base using RAG
   - Generates personalized course structure
   - Stores result in `intake_responses` table
5. Frontend polls database for completion
6. User redirected to dashboard with custom course

**Course Generation Process (n8n):**
- RAG analyzes user's project against video database
- AI selects relevant videos and organizes into phases
- Generates explanations for why each video is relevant
- Creates learning path summary and recommendations
- Calculates total duration and video count

### 2. Dashboard Features

**Progress Tracking:**
- Videos watched vs total videos
- Phases completed vs total phases
- Checkpoint completion
- Overall course percentage

**Gamification:**
- XP points for completed videos
- Level progression
- Daily learning streaks
- Weekly goals with progress bars
- Achievement badges

**Visual Progress Builder:**
- Animated progress visualization
- Shows current phase and overall completion
- Milestone celebrations

### 3. Learning Path Display

**Phase Organization:**
- Multiple phases (typically 5-10)
- Each phase has:
  - Phase name and description
  - Icon and color coding
  - Duration estimate
  - Video list with details

**Video Details:**
- Order number within phase
- Section and subsection tags
- Video description
- Duration
- "Why relevant" explanation (personalized)
- Direct link to video player

### 4. Video Player

**Features:**
- Embedded Vimeo/YouTube player
- Phase and video navigation
- Breadcrumb navigation
- Related videos sidebar
- Progress saving

---

## User Flow

### New User Flow

1. **Landing Page** (`/`)
   - Views features and benefits
   - Clicks "Get Started" or "Sign Up"

2. **Sign Up** (`/auth/signup`)
   - Creates account (Google OAuth or email/password)
   - Automatically authenticated

3. **Onboarding** (`/onboarding`)
   - Describes their AI automation project
   - Submits project idea
   - Watches progress animation (2-3 minutes)
   - Course generated in background

4. **Dashboard** (`/dashboard`)
   - Sees personalized welcome
   - Views course overview
   - Checks progress stats
   - Clicks "Ver Ruta Completa" (View Full Path)

5. **Learning Path** (`/dashboard/my-path`)
   - Reviews complete curriculum
   - Sees all phases and videos
   - Reads personalized recommendations
   - Clicks on first video to start

6. **Video Player** (`/dashboard/my-path/video/[phaseId]/[videoId]`)
   - Watches video
   - Navigates to next video
   - Tracks progress

### Returning User Flow

1. **Login** (`/auth/login`)
   - Signs in with credentials

2. **Dashboard** (`/dashboard`)
   - Sees updated progress
   - Continues learning where left off

3. **Resume Learning**
   - Navigates to current video
   - Completes more content

---

## Database Schema

### `intake_responses` Table

Main table storing user course data:

```sql
CREATE TABLE intake_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  responses JSONB,
  generated_path JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Reference to Supabase auth user
- `responses`: User's onboarding responses (project description, etc.)
- `generated_path`: Complete course structure (JSON)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### `generated_path` JSON Structure

```json
{
  "user_project": "User's project description",
  "total_videos": 45,
  "estimated_hours": "12 horas",
  "learning_path_summary": [
    "Step 1: Learn fundamentals...",
    "Step 2: Build API integration...",
    "Step 3: Deploy to production..."
  ],
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Introduction to AI Automation",
      "description": "Learn the basics...",
      "phase_duration": "2 horas",
      "videos": [
        {
          "order": 1,
          "section": "Introduction",
          "subsection": "Getting Started",
          "description": "What is AI Automation?",
          "duration": "10:30",
          "why_relevant": "This helps you understand...",
          "video_url": "https://vimeo.com/123456"
        }
      ]
    }
  ],
  "recommendations": [
    "Practice each concept before moving on",
    "Build alongside the videos"
  ],
  "next_steps": [
    "Complete Phase 1",
    "Build your first automation"
  ]
}
```

---

## API Endpoints

### POST `/api/generate-course`

Triggers course generation workflow.

**Request Body:**
```json
{
  "user_id": "uuid",
  "user_email": "user@example.com",
  "user_name": "User Name",
  "project_idea": "Project description...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "status": "processing",
  "job_id": "uuid",
  "message": "Course generation started. This will take ~2-3 minutes.",
  "estimated_time": 150
}
```

**Features:**
- 5-minute timeout (`maxDuration: 300`)
- Async webhook call to n8n
- Immediate response to frontend
- Background processing

---

## Components Overview

### Landing Page Components

**NewHeroSection.tsx**
- Hero reconstruido desde el handoff de Claude Design
- Textarea "describe tu idea" + CTA primary
- Fondo animado con `AnimatedBackground` + `HeroShader`

**HowItWorksSection.tsx**
- Proceso 3 pasos (pendiente decisión visual: Remotion vs screenshots)
- Scroll-driven animations

**AvailableCoursesSection.tsx**
- Carrusel de tipos de curso disponibles
- Modal expandible por curso

**CourseStructureSection.tsx**
- Sample course phases
- Visual course preview
- Module breakdown

**PricingSection.tsx**
- Pricing tiers
- Feature comparison
- CTA buttons

**FAQSection.tsx**
- Common questions
- Expandable answers

### Dashboard Components

**Sidebar.tsx**
- Navigation menu
- Dark mode toggle
- User profile
- Logout button

**ProgressCard.tsx**
- Stat display
- Progress visualization
- Icon + label

**CourseCard.tsx**
- Phase overview card
- Video count
- Duration
- Progress bar

**GamificationStats.tsx**
- XP and level display
- Streak counter
- Weekly goal progress
- Animated stats

**AchievementBadges.tsx**
- Badge collection
- Achievement unlocking
- Progress indicators

**ProgressBuilder.tsx**
- Visual progress builder
- Animated construction
- Milestone markers

**VideoPlayer.tsx**
- Embedded video player
- Vimeo/YouTube support
- Controls and playback

### Authentication Components

**AuthForm.tsx**
- Unified login/signup form
- Google OAuth button
- Email/password fields
- Form validation
- Error handling

### Shared Components

**Navbar.tsx**
- Site navigation
- Dark mode toggle
- Auth buttons
- Mobile responsive

**Footer.tsx**
- Site links
- Social media
- Copyright info

---

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Set environment variables in Vercel**
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

4. **Update Supabase redirect URLs**
   - Add your Vercel domain to allowed redirect URLs
   - Format: `https://your-domain.vercel.app/auth/callback`

### Deploy n8n

**Cloud Option:**
- Use [n8n.cloud](https://n8n.cloud)
- Create workflow
- Get webhook URL
- Add to environment variables

**Self-Hosted Option:**
- Deploy to Digital Ocean, AWS, or other platform
- Configure webhook endpoints
- Secure with authentication

---

## Scripts

Available npm scripts:

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## Development Notes

### Dark Mode Implementation

- Uses Tailwind's `class` strategy
- Context-based theme management (`ThemeContext.tsx`)
- Persisted to localStorage
- Toggle in Navbar and Sidebar
- All components support dark mode with `dark:` prefixes

### Authentication Flow

- Supabase handles auth state
- Server-side auth checks in layouts
- Automatic redirects for protected routes
- Session persistence across refreshes

### Performance Optimizations

- Next.js 16 with Turbopack (faster builds)
- React 19.2 Server Components (reduced bundle size)
- Image optimization with `next/image`
- Lazy loading for video embeds
- Static generation for landing page

### Mobile Responsiveness

- Fully responsive design
- Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach
- Touch-friendly interactions

---

## Troubleshooting

### Common Issues

**Issue: Supabase connection error**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure anon key is not expired

**Issue: Course generation stuck**
- Check n8n webhook is accessible
- Verify n8n workflow is active
- Check Supabase connection in n8n
- Review browser console for errors

**Issue: Videos not loading**
- Confirm video URLs are accessible
- Check iframe permissions
- Verify Next.js image domains are configured

**Issue: Dark mode not working**
- Clear localStorage
- Check Tailwind config has `darkMode: 'class'`
- Verify theme context is wrapping app

**Issue: Port already in use**
- Another Next.js dev server is already running
- Kill the process: `kill <process-id>`
- Or use a different port: `npm run dev -- -p 3001`

---

## Git Status (as of Nov 20, 2024)

### Current Branch: main

### Modified Files:
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/dashboard/my-path/page.tsx` - Learning path viewer
- `app/dashboard/page.tsx` - Dashboard homepage
- `components/auth/AuthForm.tsx` - Authentication form
- `components/dashboard/Sidebar.tsx` - Dashboard navigation
- `components/dashboard/VideoPlayer.tsx` - Video player component

### New Files (Staged):
- `app/dashboard/my-path/video/[phaseId]/[videoId]/VideoPlayerClient.tsx` - Client video player
- `app/dashboard/my-path/video/[phaseId]/[videoId]/page.tsx` - Video page route
- `components/dashboard/AchievementBadges.tsx` - Gamification badges
- `components/dashboard/GamificationStats.tsx` - XP and stats
- `components/dashboard/ProgressBuilder.tsx` - Visual progress builder

### Recent Commits:
- `21fd44c` - Claude V.2
- `2f5d947` - Initial commit

---

## Future Enhancements

### Planned Features

- [ ] Payment integration (Stripe + Mercado Pago)
- [ ] Progress persistence in database
- [ ] Video completion tracking
- [ ] Certificate generation
- [ ] Community features (comments, discussions)
- [ ] Mobile app (React Native)
- [ ] Offline video downloads
- [ ] Advanced analytics dashboard
- [ ] Admin panel for content management
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Social sharing features
- [ ] Referral program

### Potential Improvements

- [ ] Video playback speed controls
- [ ] Keyboard shortcuts for navigation
- [ ] Note-taking functionality
- [ ] Bookmarking system
- [ ] Search functionality across videos
- [ ] Course recommendations
- [ ] Peer learning features
- [ ] Live Q&A sessions
- [ ] Integration with external tools (Notion, Slack, etc.)

---

## Project Timeline

### Version 1 (Initial Setup)
- Basic Next.js setup
- Landing page
- Basic structure

### Version 2 (Current)
- Complete authentication system
- Dashboard with gamification
- Personalized learning paths
- Video player integration
- n8n course generation
- Dark mode
- Full responsive design

---

## Contributing

This is a personal project, but suggestions are welcome! Feel free to:

1. Report bugs via issues
2. Suggest features
3. Submit pull requests

---

## License

Private project - All rights reserved

---

## Contact

**Developer:** Pablo Carmona

**Project:** AI Automation Course Platform

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, n8n, Tailwind CSS

---

## Acknowledgments

- **Supabase** - Backend infrastructure and authentication
- **n8n** - Workflow automation and RAG implementation
- **Vercel** - Hosting and deployment
- **Tailwind CSS** - Styling framework
- **Next.js Team** - Amazing framework
- **Anthropic** - AI capabilities (potential integration)

---

## Project Status

🚀 **Status:** Active Development

**Current Version:** V.2

**Last Updated:** November 20, 2024

**Server Status:** Running on http://localhost:3000

---

## Quick Links

- 🏠 **Landing Page:** [http://localhost:3000](http://localhost:3000)
- 📊 **Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- 🎓 **Onboarding:** [http://localhost:3000/onboarding](http://localhost:3000/onboarding)
- 🎬 **My Path:** [http://localhost:3000/dashboard/my-path](http://localhost:3000/dashboard/my-path)
- 🔐 **Login:** [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- ✍️ **Signup:** [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)

---

## What We've Built

### ✅ Complete Features

1. **Landing Page**
   - Hero section with compelling value proposition
   - Problem/solution framework
   - 3 key differentiators
   - Course structure preview
   - Pricing tiers
   - FAQ section
   - Responsive footer

2. **Authentication System**
   - Google OAuth integration
   - Email/password authentication
   - Secure session management
   - Protected routes
   - Login/signup pages
   - Auth redirects

3. **Onboarding System**
   - Project idea intake form
   - Real-time progress tracking
   - n8n webhook integration
   - Background course generation
   - Polling for completion
   - Loading animations

4. **Dashboard**
   - Personalized welcome
   - Progress cards (videos, phases, checkpoints)
   - Course overview cards
   - Statistics display
   - Dark mode toggle
   - Responsive sidebar navigation

5. **Gamification System**
   - XP tracking
   - Level progression
   - Daily streak counter
   - Weekly goals
   - Achievement badges
   - Progress builder visualization

6. **Learning Path Display**
   - Multi-phase organization
   - Video listing with metadata
   - Duration tracking
   - Personalized "why relevant" explanations
   - Learning path summary
   - Recommendations and next steps
   - Beautiful gradient cards

7. **Video Player**
   - Embedded Vimeo/YouTube support
   - Phase and video navigation
   - Breadcrumb navigation
   - Video metadata display
   - Related content suggestions

8. **Dark Mode**
   - Full theme support
   - Toggle in navbar and sidebar
   - Persistent user preference
   - Smooth transitions
   - All components themed

9. **API Integration**
   - `/api/generate-course` endpoint
   - n8n webhook triggering
   - Async processing
   - Error handling
   - 5-minute timeout support

10. **Database Integration**
    - Supabase PostgreSQL
    - `intake_responses` table
    - User authentication
    - Course data storage
    - Real-time polling

---

Made with ❤️ and AI by Pablo Carmona
