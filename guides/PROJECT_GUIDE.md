# MrDSP Hub - Complete Project Guide

A premium dark-themed affiliate product listing web application for content creators.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Configuration](#configuration)
6. [Multitenant Support](#multitenant-support)
7. [Development](#development)
8. [Admin Panel](#admin-panel)
9. [API Endpoints](#api-endpoints)
10. [Deployment](#deployment)

**See also:**
- **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Detailed configuration guide (.env vs Site Settings)
- **[MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md)** - Complete multitenant setup guide
- **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)** - AWS deployment guide

---

## Project Overview

MrDSP Hub is a full-stack web application that allows content creators to showcase and manage affiliate products. All branding, contact information, and site settings are configurable through the Django Admin Panel without requiring code changes.

### Key Features

- ✅ **Multitenant Architecture** - Host multiple independent sites from single codebase
- ✅ Product listing with categories and search
- ✅ Product detail pages with affiliate links
- ✅ Admin panel for product management
- ✅ Contact form with email notifications
- ✅ Social media integration
- ✅ Fully configurable branding via admin panel
- ✅ Responsive dark-themed UI
- ✅ WhatsApp integration
- ✅ Scroll-to-top functionality

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API client
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API
- **PostgreSQL** (Production) / SQLite (Development)
- **Django CORS Headers** - Cross-origin requests
- **Django Rate Limit** - API protection

---

## Project Structure

```
DSP_STORE/
├── backend/                 # Django backend
│   ├── products/           # Main app
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # API serializers
│   │   ├── views.py        # API views
│   │   ├── admin.py        # Admin panel config
│   │   └── urls.py         # URL routing
│   ├── dsp_store/          # Django settings
│   └── manage.py           # Django CLI
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # React components
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # API services
│   │   │   ├── hooks/      # Custom hooks
│   │   │   └── constants/  # Constants
│   │   └── styles/         # CSS files
│   ├── package.json
│   └── vite.config.ts
│
└── guides/                 # Documentation
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (for production)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   ```bash
   cp .env.example .env  # Or create manually
   ```

5. **Configure environment variables** (see [Configuration](#configuration))

6. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start development server:**
   ```bash
   python manage.py runserver
   ```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

---

## Configuration

### Configuration Strategy

This application uses a **two-tier configuration system**:

1. **`.env` file** - System-level settings (security, infrastructure)
2. **Django Admin → Site Settings** - Tenant-specific, user-configurable settings

### Backend Environment Variables (.env)

Create `backend/.env` for system-level configuration:

```env
# ============================================
# REQUIRED: System-Level Settings
# ============================================

# Django Security (REQUIRED in production)
DJANGO_SECRET_KEY=your-secret-key-here
# Generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Debug Mode
DEBUG=True  # Set to False in production

# Allowed Hosts (comma-separated)
ALLOWED_HOSTS=localhost,127.0.0.1,api.mrdsphub.com

# ============================================
# Database Configuration
# ============================================

# Development - SQLite (default, no config needed)
# Production - PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# ============================================
# Email Server Credentials (REQUIRED for email)
# ============================================
# Note: Email server settings can be overridden per-tenant in Site Settings
# But credentials (USER/PASSWORD) must be in .env for security

EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Gmail App Password, not regular password

# Optional: Email server defaults (can be overridden in Site Settings)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=noreply@mrdsphub.com

# ============================================
# CORS Configuration
# ============================================
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# ============================================
# Optional: Cache (Production)
# ============================================
REDIS_URL=redis://127.0.0.1:6379/1

# ============================================
# Security (Production)
# ============================================
REQUIRE_AUTH_FOR_WRITES=false  # Set to true in production to require authentication for API writes
```

### What Goes in .env vs Site Settings?

**`.env` file (System-Level):**
- ✅ `DJANGO_SECRET_KEY` - Security critical
- ✅ `DEBUG` - System-level
- ✅ `ALLOWED_HOSTS` - System-level
- ✅ `DATABASE_URL` - Infrastructure
- ✅ `EMAIL_HOST_USER` - Credentials (security)
- ✅ `EMAIL_HOST_PASSWORD` - Credentials (security)
- ✅ `CORS_ALLOWED_ORIGINS` - System-level
- ✅ `REDIS_URL` - Infrastructure

**Site Settings (Admin Panel - Tenant-Specific):**
- ✅ Branding (name, logo, tagline, description)
- ✅ Contact information (email, phone, WhatsApp)
- ✅ Email configuration (optional, falls back to .env)
  - Email from address
  - Email backend (optional override)
  - Email host (optional override)
  - Email port (optional override)
  - Email TLS/SSL settings
- ✅ Site configuration (page size)
- ✅ Social media profiles
- ✅ Products, categories, badges

**Note:** Email credentials (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`) must always be in `.env` for security. Other email settings can be configured per-tenant in Site Settings.

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Optional: Logo URLs
VITE_LOGO_URL=https://your-cdn.com/logo.png
VITE_FOOTER_LOGO_URL=https://your-cdn.com/footer-logo.png
```

---

## Multitenant Support

This application supports **multitenant architecture**, allowing you to host multiple independent sites from a single codebase.

### Quick Start

1. **Run migrations:**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Create default tenant:**
   - Go to Django Admin → Tenants
   - Create a tenant with `is_default=True`
   - Or use Django shell (see [MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md))

3. **How it works:**
   - **Subdomain routing**: `tenant1.mrdsphub.com` → Tenant 1
   - **Domain routing**: `customdomain.com` → Tenant with custom domain
   - **Automatic filtering**: All data is automatically filtered by tenant
   - **Shared infrastructure**: Single codebase, single database

### Documentation

For complete multitenant setup and configuration, see **[MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md)**.

### Key Features

- ✅ Subdomain-based routing (e.g., `client1.mrdsphub.com`)
- ✅ Custom domain support (e.g., `client1.com`)
- ✅ Automatic data isolation per tenant
- ✅ Independent site settings per tenant
- ✅ Shared infrastructure, isolated data

---

## Development

### Running the Application

1. **Start backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Frontend Admin: http://localhost:5173/adminmrdsp
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/mrdspadmin

### Database Migrations

After modifying models:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

---

## Admin Panel

### Accessing Admin Panels

**Frontend Admin Panel:**
1. Go to: `http://localhost:5173/adminmrdsp`
2. No login required (add authentication as needed)

**Django Admin Panel:**
1. Go to: `http://localhost:8000/mrdspadmin`
2. Login with superuser credentials

### Configuring Site Settings

1. Navigate to: **Products → Site Settings**
2. Select tenant (for multitenant installations)
3. Configure:
   - **Branding**: Brand name, tagline, description, logo URLs
   - **Footer & Credits**: Copyright text, developer credit
   - **Contact Information**: Email, phone, operating hours, WhatsApp URL
   - **Email Configuration** (Optional): Email from address, SMTP settings
     - Falls back to `.env` if not set
     - **Note**: Email credentials (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`) must be in `.env` for security
   - **Site Configuration**: Page size (products per page)

### Managing Tenants (Multitenant)

1. Navigate to: **Products → Tenants**
2. Create/Edit tenants:
   - **Name**: Display name
   - **Subdomain**: For subdomain routing (e.g., `client1` for `client1.mrdsphub.com`)
   - **Domain**: For custom domain (e.g., `client1.com`)
   - **Is Active**: Enable/disable tenant
   - **Is Default**: Mark one tenant as default (fallback)
3. Each tenant has its own Site Settings, Products, Categories, etc.

### Managing Products

1. Navigate to: **Products → Products**
2. Add/Edit products with:
   - Name, tagline, description
   - Image URL
   - Category
   - Affiliate link
   - Badge (optional)
   - Rating

### Managing Categories

1. Navigate to: **Products → Categories**
2. Add categories (slug auto-generated)

### Managing Social Media

1. Navigate to: **Products → Social Media**
2. Add social media profiles with:
   - Platform name
   - Icon URL
   - Profile URL
   - Display order

---

## API Endpoints

**Note:** All endpoints automatically filter by tenant based on subdomain/domain. No tenant parameter needed in requests.

### Products
- `GET /api/products/` - List products (tenant-filtered, with pagination, search, filtering)
- `GET /api/products/{id}/` - Product details (tenant-filtered)
- `GET /api/products/archived/` - Archived products (tenant-filtered)
- Query parameters:
  - `?category={id}` - Filter by category
  - `?search={query}` - Search products
  - `?page={n}` - Pagination
  - `?exclude_id={id}` - Exclude product from results

### Categories
- `GET /api/categories/` - List categories (tenant-filtered)

### Site Settings
- `GET /api/site-settings/` - Get site settings for current tenant

### Social Media
- `GET /api/social-media/` - List social media profiles (tenant-filtered, active only)

### Contact
- `POST /api/contact/` - Submit contact form
  - Body: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
  - Uses tenant-specific email configuration from Site Settings

---

## Deployment

See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for complete AWS deployment instructions.

### Quick Production Checklist

- [ ] Set `DEBUG=False` in backend `.env`
- [ ] Set strong `DJANGO_SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up PostgreSQL database
- [ ] Configure email settings
- [ ] Set `REQUIRE_AUTH_FOR_WRITES=true` for security
- [ ] Build frontend: `npm run build`
- [ ] Deploy backend (EC2, Elastic Beanstalk, etc.)
- [ ] Deploy frontend (S3 + CloudFront)
- [ ] Configure SSL certificates
- [ ] Set up domain DNS records

---

## Troubleshooting

### Backend Issues

**Import errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**Database errors:**
- Run `python manage.py migrate`
- Check database connection in `.env`

**CORS errors:**
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`

### Frontend Issues

**API connection errors:**
- Check `VITE_API_BASE_URL` in `.env`
- Ensure backend is running
- Check CORS configuration

**Build errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Support

For issues or questions:
- Check the [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)
- Review error logs in browser console and Django logs
- Ensure all environment variables are set correctly

---

## License

This project is proprietary software.
