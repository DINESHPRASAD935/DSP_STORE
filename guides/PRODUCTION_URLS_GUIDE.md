# Production URL Configuration Guide

This guide explains how to handle the admin URLs in production:

- **Frontend Admin**: `http://localhost:5173/adminmrdsp` (development) → Production URL
- **Backend Django Admin**: `http://localhost:8000/mrdspadmin` (development) → Production URL

## 📋 Overview

### Development URLs
- **Frontend**: `http://localhost:5173/adminmrdsp` - React Router route for frontend admin panel
- **Backend API**: `http://localhost:8000/api` - Django REST API endpoints
- **Django Admin**: `http://localhost:8000/mrdspadmin` - Django admin interface

### Production URLs (Example: mrdsphub.com)
- **Frontend**: `https://mrdsphub.com/adminmrdsp` - Same React Router route, served from CDN/S3
- **Backend API**: `https://api.mrdsphub.com/api` - Django REST API endpoints
- **Django Admin**: `https://api.mrdsphub.com/mrdspadmin` - Django admin interface

## 🔧 Configuration

### 1. Frontend Configuration

The frontend admin route (`/adminmrdsp`) is a **client-side route** handled by React Router. It works the same in development and production - no special configuration needed.

#### Environment Variables

Create `frontend/.env.production`:

```env
# Production API Base URL
VITE_API_BASE_URL=https://api.mrdsphub.com/api
```

#### Build for Production

```bash
cd frontend
npm run build
```

The built files in `dist/` will work with any web server that:
1. Serves static files
2. Routes all requests to `index.html` (for React Router)

**Note**: The `/adminmrdsp` route will work automatically once the frontend is deployed.

### 2. Backend Configuration

#### Environment Variables

Update `backend/.env` for production:

```env
# ============================================
# REQUIRED: System-Level Settings
# ============================================
DJANGO_SECRET_KEY=your-very-strong-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.mrdsphub.com,your-ec2-ip

# ============================================
# CORS Configuration
# ============================================
CORS_ALLOWED_ORIGINS=https://mrdsphub.com,https://www.mrdsphub.com,https://*.mrdsphub.com

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/dbname

# ============================================
# Email Configuration
# ============================================
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@mrdsphub.com
```

#### Django Admin URL

The Django admin is configured at `/mrdspadmin/` in `backend/dsp_store/urls.py`:

```python
urlpatterns = [
    path('mrdspadmin/', admin.site.urls),
    path('api/', include('products.urls')),
]
```

**Production URL**: `https://api.mrdsphub.com/mrdspadmin`

**Note**: The frontend admin route is `/adminmrdsp` (not `/admin`) to differentiate it from the Django admin.

### 3. Reverse Proxy Configuration (Nginx)

For the backend, configure Nginx to proxy requests:

```nginx
server {
    listen 80;
    server_name api.mrdsphub.com;

    # Redirect HTTP to HTTPS (if using SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mrdsphub.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.mrdsphub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mrdsphub.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy all requests to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }

    # Serve static files directly
    location /static/ {
        alias /home/ubuntu/DSP_STORE/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve media files directly
    location /media/ {
        alias /home/ubuntu/DSP_STORE/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Important**: The Nginx configuration above will:
- Serve Django admin at: `https://api.mrdsphub.com/mrdspadmin`
- Serve API at: `https://api.mrdsphub.com/api`
- Serve static files at: `https://api.mrdsphub.com/static/`

### 4. Frontend Deployment (S3 + CloudFront)

For the frontend, configure CloudFront to handle React Router:

1. **S3 Bucket Configuration**:
   - Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html` (important for React Router)

2. **CloudFront Configuration**:
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Custom error responses:
     - HTTP 403 → `/index.html` → 200
     - HTTP 404 → `/index.html` → 200

This ensures that `/adminmrdsp` and all other React Router routes work correctly.

## 🔒 Security Considerations

### 1. Frontend Admin Security

The frontend admin at `/adminmrdsp` is a client-side route. If you need to protect it:

1. **Add authentication** in the React app (check for auth token)
2. **Use environment-based routing** (hide admin route in production)
3. **Add server-side authentication** (require login before serving the route)

Example React authentication check:

```typescript
// In AdminPage.tsx or a wrapper component
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = '/login';
  }
}, []);
```

### 2. Django Admin Security

The Django admin at `/mrdspadmin` should be protected:

#### Option A: IP Whitelist (Recommended for Production)

Add to Nginx config:

```nginx
location /mrdspadmin/ {
    # Allow only specific IPs
    allow 1.2.3.4;  # Your IP
    allow 5.6.7.8;  # Another admin IP
    deny all;
    
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Option B: Basic Authentication

Add to Nginx config:

```nginx
location /mrdspadmin/ {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Create password file:
```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

#### Option C: VPN/Private Network

Deploy backend in a private subnet and access Django admin via VPN or bastion host.

### 2. Frontend Admin Security

The frontend admin at `/adminmrdsp` is a client-side route. If you need to protect it:

1. **Add authentication** in the React app (check for auth token)
2. **Use environment-based routing** (hide admin route in production)
3. **Add server-side authentication** (require login before serving the route)

Example React authentication check:

```typescript
// In AdminPage.tsx or a wrapper component
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = '/login';
  }
}, []);
```

## 📝 Deployment Scenarios

### Scenario 1: Single Domain (api.mrdsphub.com)

**Frontend**: `https://mrdsphub.com/adminmrdsp`  
**Backend API**: `https://api.mrdsphub.com/api`  
**Django Admin**: `https://api.mrdsphub.com/mrdspadmin`

**Configuration**:
- Frontend `.env.production`: `VITE_API_BASE_URL=https://api.mrdsphub.com/api`
- Backend `.env`: `ALLOWED_HOSTS=api.mrdsphub.com`
- Backend `.env`: `CORS_ALLOWED_ORIGINS=https://mrdsphub.com,https://www.mrdsphub.com`

### Scenario 2: Same Domain (mrdsphub.com)

**Frontend**: `https://mrdsphub.com/adminmrdsp`  
**Backend API**: `https://mrdsphub.com/api`  
**Django Admin**: `https://mrdsphub.com/mrdspadmin`

**Configuration**:
- Frontend `.env.production`: `VITE_API_BASE_URL=https://mrdsphub.com/api`
- Backend `.env`: `ALLOWED_HOSTS=mrdsphub.com,www.mrdsphub.com`
- Backend `.env`: `CORS_ALLOWED_ORIGINS=https://mrdsphub.com,https://www.mrdsphub.com`

**Nginx Configuration** (serve both frontend and backend):

```nginx
server {
    listen 443 ssl http2;
    server_name mrdsphub.com www.mrdsphub.com;

    # Frontend static files (served from S3/CloudFront or local)
    location / {
        root /var/www/mrdsphub.com;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /mrdspadmin/ {
        # Add security (IP whitelist or basic auth)
        allow 1.2.3.4;  # Your IP
        deny all;
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /home/ubuntu/DSP_STORE/backend/staticfiles/;
    }
}
```

### Scenario 3: Custom Ports

If you need to use custom ports (not recommended for production):

**Frontend**: `https://mrdsphub.com:3000/adminmrdsp`  
**Backend API**: `https://api.mrdsphub.com:8000/api`  
**Django Admin**: `https://api.mrdsphub.com:8000/mrdspadmin`

**Configuration**:
- Frontend `.env.production`: `VITE_API_BASE_URL=https://api.mrdsphub.com:8000/api`
- Backend `.env`: `ALLOWED_HOSTS=api.mrdsphub.com`
- Update Nginx to listen on port 8000 (or use a different port)

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend accessible at production domain
- [ ] Frontend admin route (`/adminmrdsp`) works
- [ ] API endpoints accessible at `/api/`
- [ ] Django admin accessible at `/mrdspadmin`
- [ ] CORS configured correctly (no CORS errors in browser console)
- [ ] SSL certificates valid (green lock in browser)
- [ ] Static files loading correctly
- [ ] Media files loading correctly
- [ ] Security headers configured
- [ ] Django admin protected (if applicable)

## 🧪 Testing Production URLs Locally

You can test production URLs locally by:

1. **Update `/etc/hosts`** (Linux/Mac):
   ```
   127.0.0.1 mrdsphub.com
   127.0.0.1 api.mrdsphub.com
   ```

2. **Run with production settings**:
   ```bash
   # Backend
   cd backend
   DEBUG=False ALLOWED_HOSTS=mrdsphub.com,api.mrdsphub.com python manage.py runserver
   
   # Frontend
   cd frontend
   VITE_API_BASE_URL=http://api.mrdsphub.com:8000/api npm run dev
   ```

3. **Access**:
   - Frontend: `http://mrdsphub.com:5173/adminmrdsp`
   - Backend: `http://api.mrdsphub.com:8000/mrdspadmin`

## 🔄 Changing Admin URLs

### Change Django Admin URL

If you want to change `/mrdspadmin` to something else:

1. **Update `backend/dsp_store/urls.py`**:
   ```python
   urlpatterns = [
       path('admin/', admin.site.urls),  # Changed from 'mrdspadmin/'
       path('api/', include('products.urls')),
   ]
   ```

2. **Update documentation** and any scripts that reference the old URL.

### Change Frontend Admin Route

If you want to change `/adminmrdsp` to something else:

1. **Update `frontend/src/app/App.tsx`**:
   ```typescript
   <Route path="/dashboard" element={<AdminPage />} />  // Changed from "/adminmrdsp"
   ```

2. **Update any links** that reference `/adminmrdsp`.

## 📚 Related Documentation

- [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) - Complete AWS deployment steps
- [Configuration Guide](./CONFIGURATION_GUIDE.md) - Environment variable configuration
- [Project Guide](./PROJECT_GUIDE.md) - General project setup

## 🆘 Troubleshooting

### Frontend Admin Route Not Working

**Problem**: `/adminmrdsp` shows 404 or blank page

**Solutions**:
1. Ensure web server routes all requests to `index.html` (React Router requirement)
2. Check CloudFront custom error responses are configured
3. Verify S3 static website hosting is enabled
4. Clear browser cache
5. Verify the route is `/adminmrdsp` (not `/admin`) in `App.tsx`

### Django Admin Not Accessible

**Problem**: Cannot access `/mrdspadmin` in production

**Solutions**:
1. Check `ALLOWED_HOSTS` includes your domain
2. Verify Nginx is proxying correctly
3. Check Gunicorn is running: `sudo systemctl status mrdsphub-backend`
4. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
5. Verify security rules (IP whitelist, etc.) aren't blocking you

### CORS Errors

**Problem**: Browser shows CORS errors when accessing API

**Solutions**:
1. Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
2. Check protocol matches (http vs https)
3. Ensure no trailing slashes in CORS configuration
4. Verify `CORS_ALLOW_CREDENTIALS` is set correctly

---

**Last Updated**: 2024
