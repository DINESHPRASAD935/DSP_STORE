# AWS Deployment Guide for mrdsphub.in

Complete step-by-step guide to deploy MrDSP Hub to AWS with your domain `mrdsphub.in`.

## 📋 Prerequisites

- AWS Account
- Domain `mrdsphub.in` registered (can be in Route 53 or external registrar)
- AWS CLI configured (optional but recommended)
- Basic knowledge of AWS services

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   CloudFront    │  ← CDN for frontend (mrdsphub.in, *.mrdsphub.in)
└────────┬────────┘
         │
    ┌────┴────┐
    │   S3    │  ← Frontend static files (shared for all tenants)
    └─────────┘

┌─────────────────┐
│  Application    │  ← Backend API (api.mrdsphub.in)
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │   EC2   │  ← Django backend (multitenant)
    └─────────┘
         │
    ┌────┴────┐
    │   RDS   │  ← PostgreSQL database (shared, tenant-isolated)
    └─────────┘
```

### Multitenant Support

This deployment supports **multitenant architecture**:
- **Subdomain routing**: `tenant1.mrdsphub.in`, `tenant2.mrdsphub.in`
- **Custom domains**: `client1.com`, `client2.com`
- **Shared infrastructure**: Single EC2, single RDS, single S3 bucket
- **Data isolation**: Automatic tenant-based filtering

See **[MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md)** for detailed multitenant setup.

## 📝 Step-by-Step Deployment

### Part 1: Backend Deployment (Django)

#### Step 1: Create RDS PostgreSQL Database

1. **Go to AWS Console → RDS → Create Database**

2. **Configuration:**
   - Engine: PostgreSQL
   - Version: 15.x or 16.x
   - Template: Free tier (or Production)
   - DB Instance Identifier: `mrdsphub-db`
   - Master Username: `mrdsphub_admin`
   - Master Password: (Generate strong password, save it!)
   - DB Instance Class: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB (free tier) or as needed
   - VPC: Default VPC (or create new)
   - Public Access: **Yes** (for EC2 connection)
   - Security Group: Create new (we'll configure later)

3. **Click "Create Database"** (takes 5-10 minutes)

4. **Note the Endpoint:** `mrdsphub-db.xxxxx.us-east-1.rds.amazonaws.com:5432`

#### Step 2: Create EC2 Instance for Backend

1. **Go to AWS Console → EC2 → Launch Instance**

2. **Configuration:**
   - Name: `mrdsphub-backend`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: `t3.micro` (free tier) or `t3.small`
   - Key Pair: Create new or use existing (download .pem file!)
   - Network Settings:
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
     - Allow SSH (port 22) from your IP
   - Storage: 20 GB

3. **Click "Launch Instance"**

4. **Note the Public IP:** `xx.xx.xx.xx`

#### Step 3: Configure Security Groups

1. **RDS Security Group:**
   - Go to RDS → Your Database → Connectivity & Security
   - Click on Security Group
   - Inbound Rules → Edit
   - Add rule:
     - Type: PostgreSQL
     - Source: EC2 Security Group (select your EC2 instance's security group)

2. **EC2 Security Group:**
   - Go to EC2 → Security Groups → Select your EC2 security group
   - Inbound Rules → Edit
   - Add rules:
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0
     - SSH (22) from Your IP

#### Step 4: Connect to EC2 and Setup Backend

1. **SSH into EC2:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install Python and dependencies:**
   ```bash
   sudo apt install -y python3.12 python3.12-venv python3-pip postgresql-client git nginx
   ```

4. **Clone your repository:**
   ```bash
   cd /home/ubuntu
   git clone https://github.com/DINESHPRASAD935/DSP_STORE.git
   # Or if SSH is configured:
   # git clone git@github.com:DINESHPRASAD935/DSP_STORE.git
   cd DSP_STORE/backend
   ```

5. **Create virtual environment:**
   ```bash
   python3.12 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install gunicorn
   ```

6. **Create `.env` file:**
   ```bash
   nano .env
   ```

   Add:
   ```env
   # ============================================
   # REQUIRED: System-Level Settings
   # ============================================
   DJANGO_SECRET_KEY=your-very-strong-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=api.mrdsphub.com,your-ec2-ip
   
   # ============================================
   # Database Configuration
   # ============================================
   DATABASE_URL=postgresql://mrdsphub_admin:your-password@mrdsphub-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres
   
   # ============================================
   # CORS Configuration
   # ============================================
   CORS_ALLOWED_ORIGINS=https://mrdsphub.com,https://www.mrdsphub.com,https://*.mrdsphub.com
   
   # ============================================
   # Email Credentials (REQUIRED for email)
   # Note: Email server settings can be configured per-tenant in Site Settings
   # But credentials must be in .env for security
   # ============================================
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password  # Gmail App Password
   
   # Optional: Email server defaults (can be overridden per-tenant in Site Settings)
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   DEFAULT_FROM_EMAIL=noreply@mrdsphub.in
   
   # ============================================
   # Security
   # ============================================
   REQUIRE_AUTH_FOR_WRITES=true
   ```

7. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py collectstatic --noinput
   ```

8. **Test Gunicorn:**
   ```bash
   gunicorn dsp_store.wsgi:application --bind 0.0.0.0:8000
   ```

   Press `Ctrl+C` to stop

#### Step 5: Setup Gunicorn as Systemd Service

1. **Create service file:**
   ```bash
   sudo nano /etc/systemd/system/mrdsphub-backend.service
   ```

2. **Add:**
   ```ini
   [Unit]
   Description=MrDSP Hub Django Backend
   After=network.target

   [Service]
   User=ubuntu
   Group=www-data
   WorkingDirectory=/home/ubuntu/DSP_STORE/backend
   Environment="PATH=/home/ubuntu/DSP_STORE/backend/venv/bin"
   ExecStart=/home/ubuntu/DSP_STORE/backend/venv/bin/gunicorn dsp_store.wsgi:application --bind 127.0.0.1:8000 --workers 3

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start mrdsphub-backend
   sudo systemctl enable mrdsphub-backend
   sudo systemctl status mrdsphub-backend
   ```

#### Step 6: Configure Nginx

1. **Create Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/mrdsphub-backend
   ```

2. **Add:**
   ```nginx
   server {
       listen 80;
       server_name api.mrdsphub.in;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /static/ {
           alias /home/ubuntu/DSP_STORE/backend/staticfiles/;
       }
   }
   ```

3. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/mrdsphub-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Part 2: Frontend Deployment (React)

#### Step 7: Build Frontend

1. **On your local machine:**
   ```bash
   cd frontend
   ```

2. **Create `.env.production`:**
   ```env
   VITE_API_BASE_URL=https://api.mrdsphub.in/api
   ```

3. **Build:**
   ```bash
   npm run build
   ```

   This creates `dist/` folder

#### Step 8: Create S3 Bucket for Frontend

1. **Go to AWS Console → S3 → Create Bucket**

2. **Configuration:**
   - Bucket Name: `mrdsphub-frontend` (must be globally unique)
   - Region: Same as your EC2/RDS (e.g., us-east-1)
   - Block Public Access: **Uncheck** (we'll make it public)
   - Bucket Versioning: Disable
   - Default Encryption: Enable

3. **Click "Create Bucket"**

4. **Enable Static Website Hosting:**
   - Go to bucket → Properties
   - Scroll to "Static website hosting"
   - Enable
   - Index document: `index.html`
   - Error document: `index.html` (for React Router)
   - Save

5. **Set Bucket Policy:**
   - Go to Permissions → Bucket Policy
   - Add:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::mrdsphub-frontend/*"
       }
     ]
   }
   ```

6. **Upload build files:**
   ```bash
   # Install AWS CLI if not installed
   aws s3 sync frontend/dist/ s3://mrdsphub-frontend --delete
   ```

   Or use AWS Console:
   - Go to bucket → Upload
   - Upload all files from `frontend/dist/`
   - Make sure to upload files, not the `dist` folder itself

#### Step 9: Create CloudFront Distribution

1. **Go to AWS Console → CloudFront → Create Distribution**

2. **Configuration:**
   - Origin Domain: Select your S3 bucket (`mrdsphub-frontend.s3.amazonaws.com`)
   - Origin Access: Legacy access identities (or OAC)
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache Policy: CachingOptimized
   - Alternate Domain Names (CNAMEs): `mrdsphub.in`, `www.mrdsphub.in`
   - SSL Certificate: Request or Import (see Step 10)
   - Default Root Object: `index.html`
   - Custom Error Response:
     - HTTP Error Code: 403
     - Response Page Path: `/index.html`
     - HTTP Response Code: 200

3. **Click "Create Distribution"** (takes 15-20 minutes)

4. **Note the CloudFront Domain:** `d1234567890abc.cloudfront.net`

---

### Part 3: SSL Certificates & Domain Configuration

#### Step 10: Request SSL Certificate

1. **Go to AWS Console → Certificate Manager → Request Certificate**

2. **Configuration:**
   - Domain Names:
     - `mrdsphub.in`
     - `www.mrdsphub.in`
     - `api.mrdsphub.in`
     - `*.mrdsphub.in` (for multitenant subdomains)
   - Validation Method: DNS validation
   - Click "Request"

3. **Validate Certificate:**
   - You'll see CNAME records to add
   - Go to Route 53 → Hosted Zones → mrdsphub.in
   - Create CNAME records as shown in Certificate Manager
   - Wait for validation (5-10 minutes)

#### Step 11: Configure Route 53 DNS Records

1. **Go to Route 53 → Hosted Zones → mrdsphub.com**

2. **Create Records:**

   **For Frontend (CloudFront):**
   - Record Name: (leave blank for root domain)
   - Record Type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your CloudFront distribution
   - Create

   **For www subdomain:**
   - Record Name: www
   - Record Type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your CloudFront distribution
   - Create

   **For API subdomain:**
   - Record Name: api
   - Record Type: A
   - Alias: Yes
   - Route traffic to: EC2 instance
   - Select your EC2 instance
   - Create

   **Or use CNAME (if Alias not available):**
   - Record Name: api
   - Record Type: CNAME
   - Value: `api.mrdsphub.com` (or your EC2 public IP)
   - TTL: 300

#### Step 11.5: Configure Multitenant DNS (Optional)

If you want to support multiple tenants with subdomains:

1. **Wildcard Subdomain for Tenants:**
   - Go to Route 53 → Hosted Zones → mrdsphub.in
   - Create Record:
     - Record Name: `*` (wildcard)
     - Record Type: A
     - Alias: Yes
     - Route traffic to: CloudFront distribution
     - Select your CloudFront distribution
     - Create
   
   This allows `tenant1.mrdsphub.com`, `tenant2.mrdsphub.com`, etc.

2. **Update SSL Certificate:**
   - Go to Certificate Manager
   - Request new certificate or update existing
   - Add domain: `*.mrdsphub.in` (wildcard)
   - Validate via DNS
   - Update CloudFront to use this certificate

3. **For Custom Domains:**
   - Create new Hosted Zone for each custom domain (e.g., `client1.com`)
   - Create A record pointing to CloudFront
   - Update nameservers at domain registrar
   - Add domain to SSL certificate

See **[MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md)** for detailed multitenant setup.

#### Step 12: Update CloudFront with SSL Certificate

1. **Go to CloudFront → Your Distribution → Edit**

2. **Update:**
   - Alternate Domain Names: `mrdsphub.in`, `www.mrdsphub.in`, `*.mrdsphub.in` (if using multitenant)
   - Custom SSL Certificate: Select your validated certificate (must include all domains)
   - Save

3. **Wait for deployment** (15-20 minutes)

#### Step 13: Update Nginx with SSL (Optional but Recommended)

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d api.mrdsphub.in
   ```

3. **Follow prompts** and Certbot will configure Nginx automatically

---

### Part 4: Final Configuration

#### Step 14: Update Backend Environment Variables

1. **SSH into EC2:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Update `.env`:**
   ```bash
   nano /home/ubuntu/DSP_STORE/backend/.env
   ```

   Update:
   ```env
   ALLOWED_HOSTS=api.mrdsphub.in,your-ec2-ip
   CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in
   ```

3. **Restart backend:**
   ```bash
   sudo systemctl restart mrdsphub-backend
   ```

#### Step 15: Configure Site Settings in Admin Panel

1. **Access Admin Panel:**
   - Go to: `https://api.mrdsphub.in/mrdspadmin`
   - Login with superuser credentials

2. **Configure Tenants (Multitenant):**
   - Go to: Products → Tenants
   - Create default tenant:
     - Name: Default Tenant
     - Subdomain: `mrdsphub` (or leave blank)
     - Domain: `mrdsphub.in` (or leave blank)
     - Check `Is Default` and `Is Active`
     - Save
   - Create additional tenants as needed

3. **Configure Site Settings:**
   - Go to: Products → Site Settings
   - Select tenant from dropdown (or create Site Settings for tenant)
   - Configure:
     - **Branding**: Brand Name, Tagline, Description, Logo URLs
     - **Contact Information**: Contact Email, Contact Phone, WhatsApp URL
     - **Email Configuration** (Optional):
       - Email From Address: `noreply@mrdsphub.in` (or leave blank to use .env)
       - Email Backend, Host, Port, TLS/SSL (optional overrides)
       - **Note**: Email credentials (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`) must be in `.env`
     - **Site Configuration**: Page Size (e.g., 30)
   - Save

---

## ✅ Verification Checklist

- [ ] Frontend accessible at `https://mrdsphub.in`
- [ ] Frontend admin accessible at `https://mrdsphub.in/admin`
- [ ] API accessible at `https://api.mrdsphub.in/api`
- [ ] Django admin accessible at `https://api.mrdsphub.in/mrdspadmin`
- [ ] Products loading correctly
- [ ] Contact form sending emails
- [ ] SSL certificates valid (green lock in browser)
- [ ] All images loading
- [ ] Social media links working
- [ ] WhatsApp button working

---

## 🔧 Maintenance

### Updating Backend

1. **SSH into EC2:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Pull latest code:**
   ```bash
   cd /home/ubuntu/DSP_STORE
   git pull
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   sudo systemctl restart mrdsphub-backend
   ```

### Updating Frontend

1. **Build locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://mrdsphub-frontend --delete
   ```

3. **Invalidate CloudFront cache:**
   - Go to CloudFront → Your Distribution → Invalidations
   - Create invalidation: `/*`
   - Wait for completion

---

## 💰 Estimated Costs (Monthly)

- **EC2 t3.micro**: ~$8-10/month
- **RDS db.t3.micro**: ~$15/month (or free tier)
- **S3 Storage**: ~$0.023/GB (minimal for static files)
- **CloudFront**: ~$0.085/GB (first 10TB)
- **Route 53**: ~$0.50/hosted zone
- **Data Transfer**: Varies

**Total (with free tier):** ~$25-30/month
**Total (without free tier):** ~$40-50/month

---

## 🆘 Troubleshooting

### Backend not accessible
- Check EC2 security group allows HTTP/HTTPS
- Check Nginx is running: `sudo systemctl status nginx`
- Check Gunicorn is running: `sudo systemctl status mrdsphub-backend`
- Check logs: `sudo journalctl -u mrdsphub-backend -f`

### Frontend not loading
- Check S3 bucket is public
- Check CloudFront distribution is deployed
- Check Route 53 DNS records
- Clear browser cache

### Database connection errors
- Check RDS security group allows EC2 security group
- Verify DATABASE_URL in `.env`
- Check RDS is publicly accessible

### SSL certificate issues
- Ensure DNS validation records are correct
- Wait for certificate validation (can take 30+ minutes)
- Check certificate is attached to CloudFront

---

## 📞 Support

For deployment issues:
1. Check AWS CloudWatch logs
2. Check EC2 system logs
3. Verify all environment variables
4. Ensure security groups are configured correctly

---

**Congratulations! Your application should now be live at https://mrdsphub.in** 🎉
