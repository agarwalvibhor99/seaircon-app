# SE Aircon CRM System

A comprehensive customer relationship management (CRM) system built for SE Aircon, managing the complete HVAC project lifecycle from lead intake to post-service follow-up.

## 🚀 Features

### Customer-Facing Website
- Modern landing page with HVAC services showcase
- Interactive contact form with consultation requests
- Service portfolio with detailed offerings
- Mobile-responsive design

### Employee CRM Dashboard
- **Lead Management**: Complete lead intake, qualification, and tracking
- **Site Visit Scheduling**: Technician assignment and visit management  
- **Quotation Builder**: Comprehensive quotation creation with PDF generation
- **Project Management**: Project planning, team assignment, and progress tracking
- **Installation Tracking**: Real-time installation progress with phase management
- **Invoicing & Payments**: Invoice generation, payment tracking, and collections
- **Reports & Analytics**: Business insights, performance metrics, and data visualization
- **User Management**: Employee roles, permissions, and system settings

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security
- **UI Components**: Custom component library with shadcn/ui
- **Icons**: Heroicons, Lucide React

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Employees**: User management with roles (admin, manager, technician, sales)
- **Customers**: Customer information and contact details
- **Consultation Requests**: Lead intake from website forms
- **Site Visits**: Site assessment scheduling and management
- **Quotations**: Detailed quotation creation with line items
- **Projects**: Project planning and execution tracking
- **Installations**: Installation progress and phase management
- **Invoices & Payments**: Billing and payment collection
- **AMC Contracts**: Annual maintenance contract management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd seaircon-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
```bash
# Run the SQL schema
psql -d your_database < supabase-schema.sql
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.
Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

## 📱 Usage

### Customer Website
1. Visit the homepage to explore HVAC services
2. Fill out the contact form for consultation requests
3. Receive confirmation and follow-up from the SE Aircon team

### Admin Dashboard
1. Login with employee credentials at `/admin/login`
2. Access different modules from the sidebar navigation:
   - **Dashboard**: Overview of key metrics and recent activity
   - **Leads**: Manage consultation requests and lead qualification
   - **Site Visits**: Schedule and track customer site assessments
   - **Quotations**: Create detailed quotes with pricing and terms
   - **Projects**: Plan and monitor project execution
   - **Installations**: Track installation progress and phases
   - **Invoicing**: Generate invoices and manage payments
   - **Reports**: View analytics and business insights
   - **Settings**: Configure system and user preferences

## 🔐 Security Features

- **Authentication**: Secure employee login with Supabase Auth
- **Authorization**: Role-based access control (RBAC)
- **Row Level Security**: Database-level security policies
- **Session Management**: Secure session handling and timeout
- **Data Protection**: Encrypted data transmission and storage

## 📈 Key Metrics Tracked

- Lead conversion rates and sales funnel
- Project completion rates and timelines
- Revenue tracking and payment collection
- Installation progress and efficiency
- Customer satisfaction and follow-up
- Team performance and utilization

## 🛡️ Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📚 Documentation

- [CRM Setup Guide](./CRM_README.md)
- [Database Schema](./supabase-schema.sql)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Security Documentation](./SECURITY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for SE Aircon.

## 💬 Support

For support and questions:
- Email: support@seaircon.com
- Phone: +91 9876543210
- Website: [www.seaircon.com](https://www.seaircon.com)

---

Built with ❤️ for SE Aircon by the development team.
