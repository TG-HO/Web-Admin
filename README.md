# Survey Admin Panel

A comprehensive, production-ready admin dashboard for managing a survey platform built with Next.js 15, TypeScript, Supabase, TailwindCSS, and shadcn/ui.

## Features

### ✨ Core Features
- **Authentication & Authorization**: Secure admin login with role-based access control (Super Admin, Admin, Moderator)
- **Dashboard**: Real-time analytics with charts, statistics, and activity feeds
- **User Management**: Complete user management with filtering, pagination, and bulk actions
- **Survey Management**: Create, manage, and monitor surveys with analytics
- **Report & Moderation System**: Advanced reporting system with auto-suspension rules
- **Payment Management**: Transaction tracking, withdrawal requests, and revenue analytics
- **Real-time Alerts**: Supabase Realtime integration for instant notifications
- **Dark/Light Mode**: Theme switching support
- **Responsive Design**: Mobile-friendly admin dashboard
- **Audit Logging**: Complete action tracking for compliance

### 🔒 Security Features
- Row-Level Security (RLS) policies on all database tables
- Secure session management with refresh tokens
- Admin action logging and audit trails
- IP logging and browser tracking
- Automatic suspension rules based on reports

### 📊 Moderation System
- 2 reports trigger admin notification
- 3 reports trigger automatic user suspension
- Admin actions: warning, survey down, suspend, ban, dismiss
- Complete moderation history and analytics

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Framework**: shadcn/ui + TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query (v5)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Notifications**: Sonner
- **Deployment**: Vercel (or Docker)

## Project Structure

```
survey-admin-panel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin dashboard routes
│   │   ├── dashboard/         # Main dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── providers.tsx      # App providers
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   ├── layout/            # Layout components (Sidebar, Navbar)
│   │   ├── dashboard/         # Dashboard components
│   │   ├── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client setup
│   │   ├── auth.ts            # Auth utilities
│   │   └── utils.ts           # General utilities
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── services/              # Business logic services
│   ├── types/                 # TypeScript definitions
│   ├── constants/             # App constants
│   └── utils/                 # Utility functions
├── sql/
│   ├── 001_init_schema.sql    # Database schema
│   ├── 002_rls_policies.sql   # Security policies
│   └── 003_triggers_functions.sql # Database triggers
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- (Optional) Docker and Docker Compose for containerized development

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Database Setup

Run the SQL migrations in your Supabase dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query and paste contents of `sql/001_init_schema.sql`
3. Execute the query
4. Repeat for `sql/002_rls_policies.sql`
5. Repeat for `sql/003_triggers_functions.sql`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 5. Login

Use the following demo credentials (after creating users in Supabase):
- Email: `admin@survey.app`
- Password: `demo123456`

## Database Schema

### Key Tables

- **admin_users**: Admin dashboard users with role-based access
- **users**: Survey platform users (creators and fillers)
- **surveys**: Survey content with status tracking
- **survey_questions**: Individual survey questions
- **survey_responses**: User responses to surveys
- **reports**: User reports on surveys or users
- **moderation_logs**: Audit trail of admin actions
- **transactions**: Financial transactions
- **withdrawals**: Withdrawal requests from users
- **admin_notifications**: Real-time alerts for admins

## Core Functionality

### Dashboard
- Real-time statistics (users, surveys, reports, revenue)
- User growth charts
- Revenue analytics
- Activity feed
- System health status

### User Management
- View all platform users with filtering
- User status management (active, blocked, suspended, banned)
- Wallet balance tracking
- Report history
- Bulk actions

### Survey Management
- View all surveys with detailed analytics
- Survey status tracking (draft, published, downed)
- Response analytics
- Creator information
- Down/restore surveys

### Report & Moderation
- View all reports with filtering by status
- Report details modal with full context
- Admin actions (warning, suspend, ban)
- Automatic suspension at 3 reports
- Moderation history

### Payment Management
- Transaction history
- Revenue analytics
- Withdrawal request management
- Platform fee tracking
- CSV/PDF exports

### Notifications
- Real-time alert center
- Notification priorities
- Read/unread status
- Alert filtering

## Authentication

### Role-Based Access Control

- **Super Admin**: Full system access, can manage other admins
- **Admin**: Full dashboard access, can manage users and surveys
- **Moderator**: Can view data and moderate reports (read-only for settings)

### Session Management
- Automatic token refresh
- Secure cookie storage
- Auto-logout on inactivity
- Browser/device tracking

## Real-time Features

### Supabase Realtime Integration

```typescript
// Realtime alerts subscription
const alerts = supabase
  .from('realtime_alerts')
  .on('INSERT', payload => {
    // Handle new alert
  })
  .subscribe();
```

Supported real-time events:
- Report threshold reached
- User suspension triggered
- Withdrawal requests
- Payment failures
- New creator signups

## Deployment

### Vercel Deployment (Recommended)

1. Push to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on each push

```bash
npm install -g vercel
vercel
```

### Docker Deployment

```bash
# Build Docker image
docker build -t survey-admin-panel .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  survey-admin-panel
```

### Docker Compose (Local Development)

```bash
docker-compose up -d
```

## Performance Optimization

### Implemented Optimizations

- Server-side rendering with Next.js App Router
- Incremental Static Regeneration (ISR)
- Code splitting and lazy loading
- Image optimization
- Database query optimization with indexes
- TanStack React Query for caching
- Debounced search inputs
- Pagination for large datasets

## Security Recommendations

### Implemented
- ✅ Row-Level Security (RLS)
- ✅ Secure authentication
- ✅ Admin action logging
- ✅ IP/Browser tracking
- ✅ Rate limiting on Supabase

### Recommended to Add
- 🔒 Two-factor authentication (2FA)
- 🔒 API rate limiting
- 🔒 DDoS protection (Cloudflare)
- 🔒 WAF (Web Application Firewall)
- 🔒 Regular security audits

## Scaling Recommendations

### Database Scaling
1. Enable Supabase replication for read replicas
2. Implement database connection pooling
3. Archive old data to cold storage
4. Optimize slow queries with indexes

### Application Scaling
1. Deploy to multiple Vercel regions
2. Implement edge caching
3. Use worker processes for background jobs
4. Implement rate limiting

## Support & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## License

MIT License

---

**Built with ❤️ for survey platform management**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
