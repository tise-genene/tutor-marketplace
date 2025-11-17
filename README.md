# Tutorly - Ethiopian Tutor Marketplace

Tutorly is a modern platform connecting students with qualified tutors in Ethiopia. It's designed to make quality education accessible while providing opportunities for educators to share their knowledge.

## Features

- **User Authentication**
  - Secure login and registration with email verification
  - Role-based access (Student/Tutor/Admin)
  - Profile management

- **Tutor Features**
  - Detailed tutor profiles with ratings and reviews
  - Subject specialization with hourly rates
  - Availability management
  - Session booking and calendar management
  - Earnings tracking

- **Student Features**
  - Advanced search and filter tutors
  - Book tutoring sessions
  - Real-time messaging with tutors
  - Rate and review tutors
  - Track booking history

- **Platform Features**
  - Real-time messaging via Supabase Realtime
  - Secure payments with Stripe
  - Session scheduling and calendar integration
  - Review and rating system
  - Notification system

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Better Auth
- **Real-time**: Supabase Realtime
- **Payments**: Stripe
- **Email**: Resend
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account (free tier works)
- Stripe account (for payments)
- Resend account (for emails, optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tise-genene/tutorly.git
   cd tutorly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory. See `SETUP.md` for detailed instructions.
   
   Required variables:
   ```env
   # Database (Supabase)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

   # Authentication
   BETTER_AUTH_SECRET="your-generated-secret"
   BETTER_AUTH_URL="http://localhost:3000"

   # Stripe (optional)
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

   # Email (optional)
   RESEND_API_KEY="re_..."
   ```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
   - Configure Row Level Security (RLS) policies as needed

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (Supabase)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── search/            # Search functionality
│   ├── tutor/             # Tutor-related pages
│   └── messages/          # Messaging pages
├── components/            # Reusable React components
│   ├── ui/                # UI primitives (Radix UI)
│   └── layout/            # Layout components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Better Auth config
│   ├── env.ts            # Environment validation
│   └── utils/            # Helper utilities
├── hooks/                 # Custom React hooks
├── providers/            # Context providers
└── types/                # TypeScript types
```

## Deployment

See `DEPLOY.md` for detailed deployment instructions.

Quick deploy to Vercel:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier (recommended) for formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tutorly.et or open an issue on GitHub.

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Better Auth for authentication
- Vercel for deployment platform
