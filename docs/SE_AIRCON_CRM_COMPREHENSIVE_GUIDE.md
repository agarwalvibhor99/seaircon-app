# SE Aircon CRM System - Comprehensive Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database Schema](#database-schema)
5. [Frontend Routes](#frontend-routes)
6. [API Endpoints](#api-endpoints)
7. [Admin Modules](#admin-modules)
8. [Components Architecture](#components-architecture)
9. [Business Workflow](#business-workflow)
10. [Security Features](#security-features)
11. [Testing & Development](#testing--development)
12. [Deployment & Configuration](#deployment--configuration)

---

## System Overview

The SE Aircon CRM is a comprehensive Customer Relationship Management system specifically designed for HVAC (Heating, Ventilation, and Air Conditioning) businesses. Built with modern web technologies, it provides a complete solution for managing the entire business lifecycle from lead generation to project completion and ongoing maintenance contracts.

### Key Features
- **Lead Management**: Capture and track consultation requests
- **Employee Management**: Complete HR module with role-based access
- **Project Lifecycle**: From quotations to installations and invoicing
- **AMC Management**: Annual Maintenance Contract tracking
- **Site Visit Scheduling**: Organized technician dispatch
- **Financial Management**: Invoicing and payment tracking
- **Analytics & Reporting**: Business intelligence and insights
- **Multi-role Support**: Admin, Manager, Employee, and Technician roles

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with custom role management
- **Deployment**: Vercel-ready configuration
- **Testing**: Comprehensive test suites included

---

## Architecture

### Application Structure
```
SE Aircon CRM
├── Frontend (Next.js App Router)
│   ├── Public Routes (Landing, Login)
│   ├── Admin Dashboard (Protected)
│   └── Employee Portal (Role-based)
├── API Layer (Next.js API Routes)
│   ├── Authentication Endpoints
│   ├── Admin Management APIs
│   ├── Business Logic APIs
│   └── Dashboard Analytics APIs
├── Database Layer (Supabase/PostgreSQL)
│   ├── User Management Tables
│   ├── Business Data Tables
│   └── System Configuration Tables
└── External Services
    ├── Supabase Auth
    ├── Email Services
    └── File Storage
```

### Design Patterns
- **Server-Side Rendering (SSR)**: For optimal performance and SEO
- **API-First Architecture**: Clean separation between frontend and backend
- **Component-Based Design**: Reusable UI components
- **Service Layer Pattern**: Business logic abstraction
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Authentication and request processing

---

## Authentication & Authorization

### Authentication Flow
1. **User Login**: Email/password authentication via Supabase Auth
2. **Session Management**: JWT tokens with automatic refresh
3. **Role Verification**: Server-side role checking for protected routes
4. **Permission Enforcement**: Route-level and component-level access control

### User Roles & Permissions

#### Admin
- **Full System Access**: All modules and features
- **User Management**: Create, update, delete employees
- **System Configuration**: Settings and preferences
- **Financial Access**: All invoicing and payment data
- **Reporting**: Complete analytics access

#### Manager
- **Operational Management**: Projects, quotations, installations
- **Team Oversight**: View employee performance
- **Client Relations**: Manage leads and site visits
- **Limited Financial**: View-only access to financial data

#### Employee
- **Task Management**: Assigned projects and quotations
- **Client Interaction**: Update project status and notes
- **Time Tracking**: Log work hours and progress
- **Limited Access**: No sensitive financial or HR data

#### Technician
- **Field Operations**: Site visits and installations
- **Work Orders**: View and update assigned tasks
- **Mobile-Friendly**: Optimized for field use
- **Basic Reporting**: Submit completion reports

### Protected Routes
All admin routes are protected by the middleware system:
```typescript
// Middleware protection for /admin/* routes
export const config = {
  matcher: ['/admin/:path*']
}
```

---

## Database Schema

### Core Tables

#### Users & Authentication
```sql
-- employees table (extends Supabase auth.users)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role employee_role NOT NULL DEFAULT 'employee',
  department VARCHAR(100),
  hire_date DATE DEFAULT CURRENT_DATE,
  salary DECIMAL(10,2),
  status employee_status DEFAULT 'active',
  address TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom types
CREATE TYPE employee_role AS ENUM ('admin', 'manager', 'employee', 'technician');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'terminated');
```

#### Business Operations
```sql
-- consultation_requests (Leads)
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  service_type service_type NOT NULL,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  status request_status DEFAULT 'pending',
  assigned_to UUID REFERENCES employees(id),
  estimated_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- quotations
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  consultation_request_id UUID REFERENCES consultation_requests(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  service_address TEXT NOT NULL,
  service_type service_type NOT NULL,
  equipment_details JSONB,
  labor_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  material_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  additional_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (labor_cost + material_cost + additional_costs) STORED,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount + tax_amount) STORED,
  validity_days INTEGER DEFAULT 30,
  notes TEXT,
  status quotation_status DEFAULT 'draft',
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number VARCHAR(50) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES quotations(id),
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_contact JSONB,
  project_address TEXT NOT NULL,
  project_type service_type NOT NULL,
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  project_value DECIMAL(10,2) NOT NULL,
  status project_status DEFAULT 'planning',
  assigned_team JSONB,
  project_manager_id UUID REFERENCES employees(id),
  progress_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Financial Management
```sql
-- invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  client_name VARCHAR(255) NOT NULL,
  client_address TEXT,
  client_contact JSONB,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 18.00,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status invoice_status DEFAULT 'draft',
  payment_terms VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method payment_method NOT NULL,
  transaction_id VARCHAR(255),
  notes TEXT,
  recorded_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Maintenance & Services
```sql
-- amc_contracts (Annual Maintenance Contracts)
CREATE TABLE amc_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_contact JSONB,
  service_address TEXT NOT NULL,
  equipment_details JSONB,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  service_frequency service_frequency NOT NULL,
  annual_value DECIMAL(10,2) NOT NULL,
  payment_schedule payment_schedule DEFAULT 'annual',
  status contract_status DEFAULT 'active',
  terms_conditions TEXT,
  assigned_technician_id UUID REFERENCES employees(id),
  notes TEXT,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- site_visits
CREATE TABLE site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_number VARCHAR(50) UNIQUE NOT NULL,
  consultation_request_id UUID REFERENCES consultation_requests(id),
  amc_contract_id UUID REFERENCES amc_contracts(id),
  project_id UUID REFERENCES projects(id),
  client_name VARCHAR(255) NOT NULL,
  visit_address TEXT NOT NULL,
  visit_type visit_type NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  assigned_technician_id UUID REFERENCES employees(id),
  status visit_status DEFAULT 'scheduled',
  duration_minutes INTEGER,
  findings TEXT,
  recommendations TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  client_signature BOOLEAN DEFAULT FALSE,
  photos JSONB,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enums and Types
```sql
-- Service Types
CREATE TYPE service_type AS ENUM (
  'ac_installation', 'ac_repair', 'ac_maintenance', 
  'hvac_installation', 'hvac_repair', 'hvac_maintenance',
  'duct_cleaning', 'consultation', 'other'
);

-- Status Types
CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'approved', 'rejected', 'expired');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE visit_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated', 'renewal_due');

-- Payment and Frequency Types
CREATE TYPE payment_method AS ENUM ('cash', 'cheque', 'bank_transfer', 'card', 'upi', 'other');
CREATE TYPE service_frequency AS ENUM ('monthly', 'quarterly', 'half_yearly', 'annual');
CREATE TYPE payment_schedule AS ENUM ('monthly', 'quarterly', 'half_yearly', 'annual');
CREATE TYPE visit_type AS ENUM ('consultation', 'installation', 'maintenance', 'repair', 'inspection');
```

---

## Frontend Routes

### Public Routes
```
/                    # Landing page with contact form
/login               # User authentication page
```

### Protected Admin Routes
```
/admin/              # Admin dashboard (redirects to /admin/dashboard)
/admin/dashboard     # Main dashboard with analytics and quick actions
/admin/leads         # Lead management and consultation requests
/admin/leads/new     # Create new lead form
/admin/employees     # Employee management (CRUD operations)
/admin/quotations    # Quotation management
/admin/quotations/create  # Create new quotation
/admin/projects      # Project tracking and management
/admin/installations # Installation management
/admin/site-visits   # Site visit scheduling and tracking
/admin/site-visits/schedule  # Schedule new site visit
/admin/invoicing     # Invoice management
/admin/invoicing/create     # Create new invoice
/admin/amc           # Annual Maintenance Contract management
/admin/amc/create    # Create new AMC contract
/admin/reports       # Analytics and business reports
/admin/settings      # System configuration and preferences
/admin/login         # Admin-specific login (redirects to main login)
```

### Route Protection
All `/admin/*` routes are protected by middleware that:
1. Verifies user authentication
2. Checks user roles and permissions
3. Redirects unauthorized users to login
4. Maintains session state

---

## API Endpoints

### Authentication API
```
POST /api/auth/login              # User authentication
POST /api/auth/logout             # User logout
POST /api/auth/refresh            # Token refresh
GET  /api/auth/user               # Get current user info
POST /api/auth/reset-password     # Password reset
```

### Admin Management API
```
GET    /api/admin/employees       # List all employees
POST   /api/admin/employees       # Create new employee
PUT    /api/admin/employees/:id   # Update employee
DELETE /api/admin/employees/:id   # Delete employee
POST   /api/admin/create-employee # Create employee with auth account
PUT    /api/admin/update-employee # Update employee with role changes
```

### Business Operations API
```
# Consultation Requests (Leads)
GET    /api/consultation-requests         # List consultation requests
POST   /api/consultation-requests         # Create consultation request
PUT    /api/consultation-requests/:id     # Update consultation request
DELETE /api/consultation-requests/:id     # Delete consultation request

# Dashboard Analytics
GET    /api/dashboard/stats               # Get dashboard statistics
GET    /api/dashboard/recent-activity     # Get recent activity
GET    /api/dashboard/charts              # Get chart data

# Quotations
GET    /api/quotations                    # List quotations
POST   /api/quotations                    # Create quotation
PUT    /api/quotations/:id                # Update quotation
DELETE /api/quotations/:id                # Delete quotation
POST   /api/quotations/:id/send           # Send quotation to client

# Projects
GET    /api/projects                      # List projects
POST   /api/projects                      # Create project
PUT    /api/projects/:id                  # Update project
DELETE /api/projects/:id                  # Delete project
POST   /api/projects/:id/status           # Update project status

# Invoices
GET    /api/invoices                      # List invoices
POST   /api/invoices                      # Create invoice
PUT    /api/invoices/:id                  # Update invoice
DELETE /api/invoices/:id                  # Delete invoice
POST   /api/invoices/:id/payment          # Record payment

# Site Visits
GET    /api/site-visits                   # List site visits
POST   /api/site-visits                   # Schedule site visit
PUT    /api/site-visits/:id               # Update site visit
DELETE /api/site-visits/:id               # Cancel site visit

# AMC Contracts
GET    /api/amc                           # List AMC contracts
POST   /api/amc                           # Create AMC contract
PUT    /api/amc/:id                       # Update AMC contract
DELETE /api/amc/:id                       # Delete AMC contract

# Reports
GET    /api/reports/sales                 # Sales reports
GET    /api/reports/employees             # Employee performance
GET    /api/reports/projects              # Project reports
GET    /api/reports/financial            # Financial reports
```

### API Response Format
All API endpoints follow a consistent response format:
```json
{
  "success": true|false,
  "data": {...},
  "message": "Success message or error description",
  "error": "Error details (if any)",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Admin Modules

### 1. Dashboard Module
**Location**: `/admin/dashboard`
**Component**: `AdminDashboard.tsx`

**Features**:
- Real-time statistics (total leads, projects, revenue)
- Recent activity feed
- Quick action buttons
- Performance charts and graphs
- Monthly/quarterly/yearly views

**Key Components**:
- `DashboardStats`: KPI display cards
- `QuickActions`: Shortcut buttons for common tasks
- `RecentActivity`: Latest system activity
- Chart components for data visualization

### 2. Employee Management Module
**Location**: `/admin/employees`
**Component**: `EmployeeManagement.tsx`

**Features**:
- Complete CRUD operations for employees
- Role-based access control assignment
- Employee profile management
- Department and hierarchy management
- Salary and contact information tracking

**Capabilities**:
- Create employees with Supabase Auth integration
- Update employee details and roles
- Deactivate/reactivate employee accounts
- Search and filter employees
- Export employee data

### 3. Lead Management Module
**Location**: `/admin/leads`
**Component**: Lead management components

**Features**:
- Consultation request tracking
- Lead assignment to employees
- Status progression (pending → assigned → completed)
- Client contact management
- Service type categorization

**Workflow**:
1. Capture leads from website contact form
2. Assign to appropriate team member
3. Schedule initial consultation
4. Convert to quotation if interested
5. Track through to project completion

### 4. Quotation Module
**Location**: `/admin/quotations`
**Components**: Quotation management system

**Features**:
- Professional quotation generation
- Equipment and service itemization
- Cost calculation (labor + materials + additional)
- Tax computation
- PDF generation and email sending
- Approval tracking

**Quotation Process**:
1. Create from consultation request
2. Add equipment details and costs
3. Review and approve
4. Send to client
5. Track client response
6. Convert to project if approved

### 5. Project Management Module
**Location**: `/admin/projects`
**Components**: Project tracking system

**Features**:
- Project lifecycle management
- Team assignment and management
- Progress tracking with percentage completion
- Timeline management (start, expected, actual completion)
- Status updates and milestone tracking

**Project Statuses**:
- Planning: Initial project setup
- In Progress: Active work phase
- On Hold: Temporarily paused
- Completed: Successfully finished
- Cancelled: Terminated project

### 6. Installation Module
**Location**: `/admin/installations`
**Components**: Installation management

**Features**:
- Installation scheduling
- Technician assignment
- Equipment tracking
- Installation checklist management
- Quality assurance processes
- Client sign-off procedures

### 7. Site Visit Module
**Location**: `/admin/site-visits`
**Components**: Site visit management

**Features**:
- Visit scheduling and calendar management
- Technician assignment
- Visit type categorization
- Finding and recommendation tracking
- Photo documentation
- Follow-up requirement flagging

**Visit Types**:
- Consultation: Initial client meeting
- Installation: Equipment installation visit
- Maintenance: Regular service visit
- Repair: Problem resolution visit
- Inspection: Quality/safety check

### 8. Invoicing Module
**Location**: `/admin/invoicing`
**Components**: Financial management

**Features**:
- Professional invoice generation
- Multiple payment method support
- Payment tracking and reconciliation
- Overdue payment management
- Tax calculation and compliance
- Financial reporting

**Invoice Workflow**:
1. Generate from completed project
2. Add items and calculate totals
3. Send to client
4. Track payments
5. Manage overdue accounts

### 9. AMC Module
**Location**: `/admin/amc`
**Components**: Annual Maintenance Contract management

**Features**:
- Contract creation and management
- Service scheduling automation
- Renewal tracking and alerts
- Technician assignment
- Service history tracking
- Contract value management

**AMC Process**:
1. Create contract with client
2. Define service frequency and terms
3. Assign dedicated technician
4. Auto-schedule service visits
5. Track service completion
6. Manage renewals

### 10. Reports Module
**Location**: `/admin/reports`
**Components**: Analytics and reporting

**Features**:
- Sales performance reports
- Employee productivity metrics
- Project completion analytics
- Financial reports and projections
- Client satisfaction tracking
- Business intelligence dashboards

**Report Types**:
- Daily/Weekly/Monthly summaries
- Year-over-year comparisons
- Department-wise performance
- Revenue and profit analysis
- Client acquisition metrics

### 11. Settings Module
**Location**: `/admin/settings`
**Components**: System configuration

**Features**:
- Company profile management
- System preferences
- User role and permission configuration
- Email templates customization
- Tax rates and financial settings
- Backup and data management

---

## Components Architecture

### Layout Components
```
AdminLayout          # Main admin layout wrapper
├── AdminHeader      # Navigation header with user menu
├── AdminSidebar     # Navigation sidebar with module links
└── Main Content     # Dynamic content area
```

### UI Components Library
```
/src/components/ui/
├── button.tsx       # Standardized button component
├── card.tsx         # Card container component
├── input.tsx        # Form input component
├── label.tsx        # Form label component
├── select.tsx       # Dropdown select component
├── tabs.tsx         # Tab navigation component
├── textarea.tsx     # Multi-line text input
└── badge.tsx        # Status badge component
```

### Admin Components
```
/src/components/admin/
├── AdminDashboard.tsx     # Main dashboard component
├── AdminHeader.tsx        # Admin navigation header
├── AdminSidebar.tsx       # Navigation sidebar
├── DashboardStats.tsx     # Statistics display
├── EmployeeManagement.tsx # Employee CRUD interface
├── QuickActions.tsx       # Dashboard quick actions
├── RecentActivity.tsx     # Activity feed
└── [module-folders]/     # Module-specific components
    ├── amc/
    ├── installations/
    ├── invoicing/
    ├── leads/
    ├── projects/
    ├── quotations/
    ├── reports/
    ├── settings/
    └── site-visits/
```

### Service Layer
```
/src/lib/
├── auth.service.ts              # Authentication logic
├── crm-service.ts              # Main business logic
├── consultation-requests.service.ts  # Lead management
├── analytics.service.ts        # Reports and analytics
├── contact-history.service.ts  # Client communication tracking
├── database.types.ts           # TypeScript type definitions
├── supabase.ts                 # Database connection
└── utils.ts                    # Utility functions
```

---

## Business Workflow

### Complete Customer Journey

#### 1. Lead Generation
```
Website Contact Form → Consultation Request → Database Storage
↓
Email Notification → Admin Assignment → Initial Contact
```

#### 2. Consultation Process
```
Site Visit Scheduled → Technician Assigned → Assessment Completed
↓
Requirements Gathered → Solution Designed → Quotation Prepared
```

#### 3. Sales Process
```
Quotation Sent → Client Review → Negotiations → Approval/Rejection
↓
If Approved: Project Created → Contract Signed → Work Scheduled
```

#### 4. Project Execution
```
Project Planning → Team Assignment → Material Procurement
↓
Installation/Work → Progress Tracking → Quality Assurance
↓
Completion → Client Sign-off → Documentation
```

#### 5. Financial Process
```
Invoice Generation → Client Billing → Payment Tracking
↓
Payment Received → Account Reconciliation → Financial Reporting
```

#### 6. Maintenance Lifecycle
```
AMC Contract → Service Scheduling → Regular Maintenance
↓
Issue Resolution → Renewal Management → Long-term Relationship
```

### Data Flow Architecture
```
Frontend (React/Next.js)
    ↕
API Layer (Next.js Routes)
    ↕
Service Layer (Business Logic)
    ↕
Database Layer (Supabase/PostgreSQL)
    ↕
External Services (Email, Storage, etc.)
```

---

## Security Features

### Authentication Security
- **JWT Tokens**: Secure session management
- **Password Hashing**: Bcrypt encryption
- **Session Timeout**: Automatic logout after inactivity
- **Multi-factor Authentication**: Available for admin accounts
- **Password Policies**: Strong password requirements

### Authorization Framework
- **Role-Based Access Control (RBAC)**: Four distinct user roles
- **Route Protection**: Middleware-based access control
- **Component-Level Security**: Conditional rendering based on permissions
- **API Endpoint Security**: Server-side permission validation
- **Data Isolation**: Users can only access authorized data

### Data Security
- **Row Level Security (RLS)**: Database-level access control
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: Token-based request validation
- **Data Encryption**: Sensitive data encryption at rest

### Network Security
- **HTTPS Enforcement**: All communications encrypted
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: API abuse prevention
- **IP Whitelisting**: Admin access restrictions
- **Audit Logging**: Comprehensive activity tracking

---

## Testing & Development

### Testing Framework
The system includes comprehensive testing scripts:

#### Database Testing
```bash
# Test database connectivity and operations
node test-database.js

# Test employee management functionality
node test-employee-management.js

# Test all API endpoints
node test-endpoints.js
```

#### Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Start admin testing environment
./start-admin-test.sh

# Setup complete development environment
./setup-complete-admin.sh
```

#### Testing Coverage
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability scanning

### Development Environment Setup
1. **Prerequisites Installation**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   ./setup-supabase.sh
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Configure environment variables
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

---

## Deployment & Configuration

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_url

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Options

#### Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

#### Self-Hosted Deployment
1. Build the application
   ```bash
   npm run build
   ```
2. Configure reverse proxy (Nginx/Apache)
3. Set up SSL certificates
4. Configure environment variables
5. Start the application
   ```bash
   npm start
   ```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring setup completed
- [ ] Security audit performed
- [ ] Performance optimization done
- [ ] Documentation updated

### Monitoring & Maintenance
- **Application Monitoring**: Performance tracking
- **Error Logging**: Comprehensive error reporting
- **Database Monitoring**: Query performance and health
- **Security Monitoring**: Intrusion detection
- **Backup Management**: Automated daily backups
- **Update Management**: Regular security updates

---

## Conclusion

The SE Aircon CRM system provides a comprehensive solution for HVAC businesses, covering the entire customer lifecycle from initial contact to ongoing maintenance relationships. With its modern architecture, robust security features, and extensive functionality, it serves as a complete business management platform.

### Key Strengths
- **Complete Business Coverage**: End-to-end workflow management
- **Modern Technology Stack**: Built with latest web technologies
- **Scalable Architecture**: Designed for business growth
- **Security-First Approach**: Comprehensive security implementation
- **User-Friendly Interface**: Intuitive design for all user types
- **Extensive Testing**: Comprehensive test coverage
- **Documentation**: Detailed guides and documentation

### Future Enhancement Opportunities
- Mobile application development
- Advanced analytics and AI integration
- Third-party service integrations
- Multi-language support
- Advanced reporting and dashboards
- Workflow automation enhancements

This documentation serves as a complete reference for understanding, developing, and maintaining the SE Aircon CRM system.

---

*Last Updated: June 12, 2025*
*Version: 1.0.0*
*Documentation maintained by: SE Aircon Development Team*
