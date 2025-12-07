# Tutorly

Tutorly is a modern platform connecting students with tutors.

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
