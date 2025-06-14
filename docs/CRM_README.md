# SEAircon CRM System

A comprehensive Customer Relationship Management (CRM) system built with Next.js, TypeScript, and Supabase for managing HVAC consultation requests.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the `.env.local` file and update it with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set Up Supabase Database
Create a new Supabase project and run the following SQL to create the required tables:

```sql
-- Create consultation_requests table
CREATE TABLE consultation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('installation', 'maintenance', 'repair', 'consultation')),
  message TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT,
  estimated_value DECIMAL,
  next_follow_up TIMESTAMPTZ,
  property_type TEXT,
  project_size TEXT,
  budget_range TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  preferred_contact_method TEXT DEFAULT 'phone',
  preferred_contact_time TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_history table
CREATE TABLE contact_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_request_id UUID REFERENCES consultation_requests(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone', 'meeting', 'note')),
  contact_method TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX idx_consultation_requests_priority ON consultation_requests(priority);
CREATE INDEX idx_consultation_requests_urgency ON consultation_requests(urgency);
CREATE INDEX idx_consultation_requests_created_at ON consultation_requests(created_at);
CREATE INDEX idx_contact_history_consultation_request_id ON contact_history(consultation_request_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on consultation_requests" ON consultation_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on contact_history" ON contact_history FOR ALL USING (true);
```

### 4. Start Development Server
```bash
# Method 1: Using npm
npm run dev

# Method 2: Using the provided script
chmod +x start-dev.sh
./start-dev.sh
```

The application will be available at:
- **Main Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main landing page with contact form
│   ├── admin/
│   │   └── page.tsx         # Admin dashboard page
├── components/
│   ├── ContactForm.tsx      # Enhanced contact form with CRM integration
│   ├── AdminDashboard.tsx   # Complete CRM dashboard
│   └── ui/                  # Custom UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── lib/
│   ├── types.ts                        # TypeScript type definitions
│   ├── consultation-requests.service.ts # Consultation request operations
│   ├── contact-history.service.ts      # Contact history operations
│   ├── analytics.service.ts           # Analytics and dashboard data
│   ├── crm-service.ts                 # Main CRM service (aggregates all services)
│   ├── supabase.ts                    # Supabase client configuration
│   └── utils.ts                       # Utility functions
```

## 🎯 Features

### Customer-Facing Features
- **Enhanced Contact Form**: Professional form with validation and multiple service types
- **Real-time Validation**: Client-side form validation with error messaging
- **Service Type Selection**: Installation, maintenance, repair, consultation options
- **Urgency Levels**: Emergency, high, medium, low priority options
- **Property Information**: Type, size, budget range, location details
- **Contact Preferences**: Preferred contact method and timing

### Admin Dashboard Features
- **Dashboard Overview**: Stats and metrics at a glance
- **Request Management**: View, filter, and search consultation requests
- **Status Tracking**: Track requests through the entire pipeline
- **Priority Management**: Urgent, high, medium, low priority system
- **Follow-up Management**: Track and manage upcoming follow-ups
- **Contact History**: Log and view all customer interactions
- **Analytics**: Request breakdown by status, urgency, and service type
- **Advanced Filtering**: Search by name, email, company, phone
- **Real-time Updates**: Refresh data and see latest requests

### Technical Features
- **Modular Architecture**: Clean separation of concerns with service layers
- **Type Safety**: Full TypeScript implementation with proper typing
- **Error Handling**: Comprehensive error handling throughout the application
- **Responsive Design**: Mobile-friendly UI components
- **Professional UI**: Custom component library with consistent styling

## 🛠️ Development

### Code Organization
The codebase follows a modular architecture:

1. **Services Layer** (`src/lib/`):
   - `types.ts`: Central type definitions
   - `consultation-requests.service.ts`: CRUD operations for requests
   - `contact-history.service.ts`: Contact history management
   - `analytics.service.ts`: Dashboard analytics and metrics
   - `crm-service.ts`: Main service that aggregates all functionality

2. **Components** (`src/components/`):
   - `ContactForm.tsx`: Customer-facing form
   - `AdminDashboard.tsx`: Admin interface
   - `ui/`: Reusable UI components

3. **Database Integration**:
   - Supabase for real-time database operations
   - PostgreSQL with Row Level Security
   - Optimized queries with proper indexing

### Adding New Features

#### Adding a New Service Operation
1. Add the function to the appropriate service file
2. Update the CRM service to expose it
3. Update TypeScript types if needed

#### Adding New UI Components
1. Create component in `src/components/ui/`
2. Follow the existing pattern for styling and props
3. Export from the component file

#### Extending the Database Schema
1. Add new columns/tables in Supabase
2. Update TypeScript types in `src/lib/types.ts`
3. Update service methods as needed

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations

### Customization
- **Styling**: Update Tailwind classes in components
- **Business Logic**: Modify service files in `src/lib/`
- **Validation**: Update form validation in `ContactForm.tsx`
- **Dashboard**: Customize metrics and views in `AdminDashboard.tsx`

## 📊 Database Schema

### consultation_requests
- **id**: UUID primary key
- **full_name**: Customer name
- **email**: Customer email
- **phone**: Customer phone
- **company**: Company name (optional)
- **service_type**: Type of service needed
- **message**: Customer message/requirements
- **urgency**: Priority level (low, medium, high, emergency)
- **status**: Request status (new, contacted, in_progress, completed, cancelled)
- **priority**: Business priority (low, medium, high)
- **assigned_to**: Staff member assigned
- **estimated_value**: Potential deal value
- **next_follow_up**: Next follow-up date
- **property_type**: Type of property
- **project_size**: Size of project
- **budget_range**: Customer budget
- **address, city, state, postal_code**: Location details
- **preferred_contact_method**: How customer prefers to be contacted
- **preferred_contact_time**: When to contact
- **source**: Where the request came from
- **created_at, updated_at**: Timestamps

### contact_history
- **id**: UUID primary key
- **consultation_request_id**: Foreign key to consultation_requests
- **contact_type**: Type of contact (email, phone, meeting, note)
- **contact_method**: Specific method used
- **notes**: Contact notes
- **created_by**: Staff member who made contact
- **created_at**: Timestamp

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## 📝 TODO / Future Enhancements

- [ ] Authentication system for admin access
- [ ] Email notifications for new requests
- [ ] SMS notifications for urgent requests
- [ ] Calendar integration for follow-ups
- [ ] File upload for project documents
- [ ] Customer portal for request tracking
- [ ] Integration with accounting software
- [ ] Mobile app for field technicians
- [ ] Advanced reporting and analytics
- [ ] Integration with Google Maps for service areas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary to SEAircon. All rights reserved.

## 📞 Support

For technical support or questions about the CRM system, please contact the development team.

---

**Last Updated**: May 28, 2025
**Version**: 1.0.0
