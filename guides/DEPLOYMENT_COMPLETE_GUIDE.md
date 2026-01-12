# Complete Deployment Guide - GitHub to AWS (mrdsphub.in)

Complete step-by-step guide to push code to GitHub and deploy to AWS for **mrdsphub.in**.

## 📋 Prerequisites

- ✅ GitHub repository: `git@github.com:DINESHPRASAD935/DSP_STORE.git`
- ✅ AWS Account
- ✅ Domain `mrdsphub.in` registered (can be in Route 53 or external registrar)
- ✅ SSH access to EC2 instance
- ✅ Git configured on your machine

---

## Part 1: Push Code to GitHub

### Step 1: Check Current Status

```bash
cd /home/dinesh/DSP_STORE/DSP_STORE
git status
```

You should see:
- Modified files: `.gitignore`, `README.md`
- Untracked files: `backend/`, `frontend/`, `guides/`, `.vscode/`, `package-lock.json`

### Step 2: Review .gitignore

Make sure `.gitignore` excludes sensitive files:

```bash
cat .gitignore | grep -E "\.env|db\.sqlite3|__pycache__|node_modules"
```

**Important:** Ensure `.env` files are in `.gitignore` (they should be).

### Step 3: Stage All Changes

```bash
# Add all files
git add .

# Or selectively add:
git add backend/
git add frontend/
git add guides/
git add .gitignore
git add README.md
```

### Step 4: Commit Changes

```bash
git commit -m "Add complete multitenant application with admin panel

- Add multitenant support with Tenant model
- Add Site Settings management in admin panel
- Add email configuration in Site Settings
- Add comprehensive guides (AWS, Multitenant, Configuration)
- Update frontend admin panel with Site Settings tab
- Add all backend and frontend code"
```

### Step 5: Push to GitHub

**Option A: Push to current branch (scratch)**
```bash
git push origin scratch
```

**Option B: Push to main/master branch**
```bash
# Switch to main branch (or create it)
git checkout -b main
# Or if main exists:
git checkout main
git merge scratch

# Push to main
git push origin main
```

**Option C: Create new branch for deployment**
```bash
git checkout -b production
git push origin production
```

### Step 6: Verify Push

1. Go to: https://github.com/DINESHPRASAD935/DSP_STORE
2. Verify all files are uploaded
3. Check that `.env` files are NOT in the repository

---

## Part 2: AWS Deployment for mrdsphub.in

### Step 1: Prepare AWS Account

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Select Region**: Choose closest region (e.g., `ap-south-1` for India)
3. **Note your region** - you'll need it for all services

### Step 2: Create RDS PostgreSQL Database

1. **Go to RDS → Create Database**

2. **Configuration:**
   ```
   Engine: PostgreSQL
   Version: 15.x or 16.x
   Template: Free tier (or Production)
   DB Instance Identifier: mrdsphub-db
   Master Username: mrdsphub_admin
   Master Password: [Generate strong password - SAVE IT!]
   DB Instance Class: db.t3.micro (free tier) or db.t3.small
   Storage: 20 GB
   VPC: Default VPC
   Public Access: Yes (for EC2 connection)
   Security Group: Create new
   ```

3. **Click "Create Database"** (takes 5-10 minutes)

4. **Note the Endpoint**: `mrdsphub-db.xxxxx.ap-south-1.rds.amazonaws.com:5432`

### Step 3: Create EC2 Instance

1. **Go to EC2 → Launch Instance**

2. **Configuration:**
   ```
   Name: mrdsphub-backend
   AMI: Ubuntu Server 22.04 LTS
   Instance Type: t3.micro (free tier) or t3.small
   Key Pair: Create new or use existing (download .pem file!)
   Network Settings:
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
     - Allow SSH (port 22) from your IP
   Storage: 20 GB
   ```

3. **Click "Launch Instance"**

4. **Note the Public IP**: `xx.xx.xx.xx`

### Step 4: Configure Security Groups

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

   **🔍 How to Find Your IP Address:**
   
   **Method 1: Use AWS Console "My IP" Button (Easiest)**
   - When adding the SSH rule, click the **"My IP"** button in the Source field
   - AWS will automatically detect and fill in your current public IP address
   - This is the easiest method!
   
   **Method 2: Online Services**
   - Visit: https://whatismyipaddress.com/
   - Or: https://ifconfig.me/
   - Or: https://api.ipify.org
   - Copy the IPv4 address shown (e.g., `203.0.113.45`)
   
   **Method 3: Command Line (Linux/Mac)**
   ```bash
   # Get your public IP
   curl ifconfig.me
   # Or
   curl ipinfo.io/ip
   # Or
   curl api.ipify.org
   ```
   
   **Method 4: Command Line (Windows PowerShell)**
   ```powershell
   (Invoke-WebRequest -Uri "https://api.ipify.org").Content
   ```
   
   **Method 5: Check Router/ISP**
   - Login to your router admin panel
   - Check WAN IP address
   
   **⚠️ Important Notes:**
   - Your IP may change if you have a **dynamic IP** (most home connections)
   - If your IP changes, you'll need to update the security group rule
   - For **static IP** (business connections), the IP won't change
   - If you can't connect via SSH later, check if your IP has changed
   - You can also allow a range: `203.0.113.0/24` (allows 203.0.113.0-255)

### Step 5: Setup EC2 Instance

1. **SSH into EC2:**

   **🔍 What is SSH?**
   
   **SSH (Secure Shell)** is a secure way to remotely access and control your EC2 server from your computer. Think of it like:
   - **Remote Desktop** for Linux servers
   - A **secure terminal/command line** connection to your server
   - Like logging into your computer, but from anywhere in the world
   
   **Why do we need SSH?**
   - To install software (Python, Nginx, etc.)
   - To configure your Django application
   - To run commands on the server
   - To upload files and manage your application
   - To check logs and troubleshoot issues
   
   **📝 Step-by-Step SSH Connection:**
   
   **Step 1: Get Your EC2 Instance Details**
   - Go to AWS Console → EC2 → Instances
   - Find your instance (`mrdsphub-backend`)
   - Note the **Public IPv4 address** (e.g., `54.123.45.67`)
   - Note the **Key Pair name** (e.g., `mrdsphub-backend-key`)
   
   **Step 2: Locate Your Key File**
   - Find the `.pem` file you downloaded when creating the key pair
   - It should be in your Downloads folder or wherever you saved it
   - Example: `mrdsphub-backend-key.pem`
   
   **Step 3: Set Correct Permissions (Linux/Mac Only)**
   ```bash
   # Navigate to where your .pem file is located
   cd ~/Downloads  # or wherever you saved it
   
   # Set permissions (required for security)
   chmod 400 mrdsphub-backend-key.pem
   ```
   
   **Why?** SSH requires the key file to have restricted permissions (only you can read it).
   
   **Step 4: Connect via SSH**
   
   **On Linux/Mac:**
   ```bash
   ssh -i mrdsphub-backend-key.pem ubuntu@54.123.45.67
   ```
   
   **Breakdown of the command:**
   - `ssh` = SSH command
   - `-i` = "identity file" (your key file)
   - `mrdsphub-backend-key.pem` = your key file name
   - `ubuntu` = username (Ubuntu servers use "ubuntu" by default)
   - `@54.123.45.67` = your EC2 instance's public IP address
   
   **On Windows (using PowerShell or WSL):**
   ```powershell
   # Same command works in PowerShell or WSL
   ssh -i mrdsphub-backend-key.pem ubuntu@54.123.45.67
   ```
   
   **On Windows (using PuTTY):**
   1. Download and install PuTTY: https://www.putty.org/
   2. Download PuTTYgen (comes with PuTTY)
   3. Convert `.pem` to `.ppk`:
      - Open PuTTYgen
      - Click "Load" → Select your `.pem` file
      - Click "Save private key" → Save as `.ppk` file
   4. Open PuTTY:
      - Host Name: `ubuntu@54.123.45.67`
      - Connection Type: SSH
      - Go to Connection → SSH → Auth → Credentials
      - Browse and select your `.ppk` file
      - Click "Open"
   
   **Step 5: First Connection - Accept Fingerprint**
   
   When you connect for the first time, you'll see:
   ```
   The authenticity of host '54.123.45.67' can't be established.
   ECDSA key fingerprint is SHA256:xxxxxxxxxxxxx.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```
   
   Type `yes` and press Enter. This is normal for first-time connections.
   
   **Step 6: You're Connected!**
   
   You should now see something like:
   ```
   Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-xxxx-generic x86_64)
   
   * Documentation:  https://help.ubuntu.com
   * Management:     https://landscape.canonical.com
   * Support:        https://ubuntu.com/advantage
   
   ubuntu@ip-172-31-xx-xx:~$
   ```
   
   **🎉 Success!** You're now connected to your EC2 server!
   
   The `ubuntu@ip-172-31-xx-xx:~$` is your command prompt. You can now run commands on the server.
   
   **Common Commands to Verify Connection:**
   ```bash
   # Check current directory
   pwd
   # Output: /home/ubuntu
   
   # Check who you are
   whoami
   # Output: ubuntu
   
   # Check system info
   uname -a
   
   # Check disk space
   df -h
   
   # Check memory
   free -h
   ```
   
   **To Disconnect:**
   - Type `exit` and press Enter
   - Or press `Ctrl + D`
   
   **⚠️ Troubleshooting SSH Connection Issues:**
   
   **Problem: "Permission denied (publickey)"**
   - **Solution**: Check key file permissions: `chmod 400 your-key.pem`
   - **Solution**: Verify you're using the correct key file name
   - **Solution**: Make sure you're using the correct username (`ubuntu` for Ubuntu)
   
   **Problem: "Connection timed out"**
   - **Solution**: Check if security group allows SSH (port 22) from your IP
   - **Solution**: Verify the instance is running (check AWS Console)
   - **Solution**: Check if your IP address has changed (update security group)
   
   **Problem: "Host key verification failed"**
   - **Solution**: Remove old host key: `ssh-keygen -R 54.123.45.67`
   - **Solution**: Or edit `~/.ssh/known_hosts` and remove the line with your IP
   
   **Problem: "Could not resolve hostname"**
   - **Solution**: Use the IP address instead of hostname
   - **Solution**: Check if you copied the IP address correctly
   
   **Problem: "WARNING: UNPROTECTED PRIVATE KEY FILE!"**
   - **Solution**: Set correct permissions: `chmod 400 your-key.pem`
   
   **💡 Pro Tips:**
   - **Save connection details**: Create an alias in your `~/.ssh/config` file for easier connections
   - **Use AWS Systems Manager**: Alternative to SSH (no key file needed, but requires setup)
   - **Keep key file safe**: Never share your `.pem` file or commit it to Git
   - **Multiple connections**: You can open multiple SSH sessions to the same server

2. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install dependencies:**
   ```bash
   sudo apt install -y python3.12 python3.12-venv python3-pip postgresql-client git nginx
   ```

4. **Clone repository:**
   ```bash
   cd /home/ubuntu
   git clone git@github.com:DINESHPRASAD935/DSP_STORE.git
   cd DSP_STORE/backend
   ```

   **If SSH key not configured, use HTTPS:**
   ```bash
   git clone https://github.com/DINESHPRASAD935/DSP_STORE.git
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
   # Generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   
   DEBUG=False
   ALLOWED_HOSTS=api.mrdsphub.in,your-ec2-ip
   
   # ============================================
   # Database Configuration
   # ============================================
   DATABASE_URL=postgresql://mrdsphub_admin:your-password@mrdsphub-db.xxxxx.ap-south-1.rds.amazonaws.com:5432/postgres
   
   # ============================================
   # CORS Configuration
   # ============================================
   CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in,https://*.mrdsphub.in
   
   # ============================================
   # Email Credentials (REQUIRED for email)
   # ============================================
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   
   # Optional: Email server defaults
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

   **Save**: `Ctrl+X`, then `Y`, then `Enter`

7. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   # Follow prompts to create admin user
   python manage.py collectstatic --noinput
   ```

8. **Test Gunicorn:**
   ```bash
   gunicorn dsp_store.wsgi:application --bind 0.0.0.0:8000
   ```

   Press `Ctrl+C` to stop

### Step 6: Setup Gunicorn as Systemd Service

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
   Restart=always

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

### Step 7: Configure Nginx

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

## Part 3: Frontend Deployment

### Step 8: Build Frontend

**On your local machine:**

1. **Navigate to frontend:**
   ```bash
   cd /home/dinesh/DSP_STORE/DSP_STORE/frontend
   ```

2. **Create `.env.production`:**
   ```bash
   nano .env.production
   ```

   Add:
   ```env
   VITE_API_BASE_URL=https://api.mrdsphub.in/api
   ```

3. **Install dependencies (if not done):**
   ```bash
   npm install
   ```

4. **Build:**
   ```bash
   npm run build
   ```

   This creates `dist/` folder

### Step 9: Create S3 Bucket for Frontend

1. **Go to AWS Console → S3 → Create Bucket**

2. **Configuration:**
   ```
   Bucket Name: mrdsphub-frontend (must be globally unique)
   Region: Same as your EC2/RDS (e.g., ap-south-1)
   Block Public Access: Uncheck (we'll make it public)
   Bucket Versioning: Disable
   Default Encryption: Enable
   ```

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

6. **Upload frontend files:**
   ```bash
   # On your local machine
   cd /home/dinesh/DSP_STORE/DSP_STORE/frontend
   aws s3 sync dist/ s3://mrdsphub-frontend/ --delete
   ```

   **Or manually:**
   - Go to S3 bucket → Upload
   - Select all files from `frontend/dist/`
   - Upload

### Step 10: Create CloudFront Distribution

1. **Go to CloudFront → Create Distribution**

2. **Configuration:**
   ```
   Origin Domain: Select your S3 bucket (mrdsphub-frontend.s3.ap-south-1.amazonaws.com)
   Origin Access: Public
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   Cache Policy: CachingDisabled (for React Router)
   Alternate Domain Names (CNAMEs): mrdsphub.in, www.mrdsphub.in
   ```

3. **Click "Create Distribution"** (takes 15-20 minutes)

4. **Note the CloudFront Domain:** `d1234567890abc.cloudfront.net`

---

## Part 4: Domain Configuration (mrdsphub.in)

### Step 11: Configure Domain DNS

**If domain is in Route 53:**

1. **Go to Route 53 → Hosted Zones → mrdsphub.in**

2. **Create A Record for root domain:**
   ```
   Record Name: (leave blank for root domain)
   Record Type: A
   Alias: Yes
   Route traffic to: CloudFront distribution
   Select your CloudFront distribution
   Create
   ```

3. **Create A Record for www:**
   ```
   Record Name: www
   Record Type: A
   Alias: Yes
   Route traffic to: CloudFront distribution
   Select your CloudFront distribution
   Create
   ```

4. **Create A Record for API:**
   ```
   Record Name: api
   Record Type: A
   Alias: Yes
   Route traffic to: EC2 instance
   Select your EC2 instance
   Create
   ```

**If domain is with external registrar:**

1. **Get nameservers from Route 53:**
   - Create Hosted Zone for `mrdsphub.in` in Route 53
   - Note the 4 nameservers

2. **Update nameservers at registrar:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Update nameservers to Route 53 nameservers
   - Wait 24-48 hours for propagation

3. **Create DNS records in Route 53** (as above)

### Step 12: SSL Certificates

1. **Go to Certificate Manager → Request Certificate**

2. **Configuration:**
   ```
   Domain Names:
     - mrdsphub.in
     - www.mrdsphub.in
     - api.mrdsphub.in
     - *.mrdsphub.in (for multitenant subdomains)
   Validation Method: DNS validation
   ```

3. **Validate via DNS:**
   - Go to Route 53 → Hosted Zones → mrdsphub.in
   - Create CNAME records as shown in Certificate Manager
   - Wait for validation (5-30 minutes)

4. **Update CloudFront with SSL:**
   - Go to CloudFront → Your Distribution → Edit
   - Alternate Domain Names: `mrdsphub.in`, `www.mrdsphub.in`, `*.mrdsphub.in`
   - Custom SSL Certificate: Select your validated certificate
   - Save

5. **Update Nginx with SSL:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.mrdsphub.in
   ```

---

## Part 5: Final Configuration

### Step 13: Configure Site Settings in Admin Panel

1. **Access Admin Panel:**
   - Go to: `https://api.mrdsphub.in/mrdspadmin/`
   - Login with superuser credentials

2. **Configure Tenants:**
   - Go to: Products → Tenants
   - Create default tenant:
     - Name: Default Tenant
     - Domain: `mrdsphub.in` (or leave blank)
     - Check `Is Default` and `Is Active`
     - Save

3. **Configure Site Settings:**
   - Go to: Products → Site Settings
   - Select tenant
   - Configure all settings:
     - Branding (Logo, Brand Name, Tagline)
     - Contact Information
     - Email Configuration (optional)
     - Page Size
   - Save

### Step 14: Test Deployment

1. **Test Frontend:**
   - Visit: `https://mrdsphub.in`
   - Should load React app

2. **Test API:**
   - Visit: `https://api.mrdsphub.in/api/site-settings/`
   - Should return JSON

3. **Test Admin:**
   - Visit: `https://api.mrdsphub.in/mrdspadmin/`
   - Should show Django admin

---

## Part 6: Continuous Deployment (Optional)

### Setup Auto-Deploy Script

Create deployment script on EC2:

```bash
# On EC2
nano /home/ubuntu/deploy.sh
```

Add:
```bash
#!/bin/bash
cd /home/ubuntu/DSP_STORE
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart mrdsphub-backend
echo "Deployment complete!"
```

Make executable:
```bash
chmod +x /home/ubuntu/deploy.sh
```

**To deploy:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
./deploy.sh
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] RDS database created and accessible
- [ ] EC2 instance running
- [ ] Backend deployed and running
- [ ] Frontend built and uploaded to S3
- [ ] CloudFront distribution created
- [ ] DNS records configured
- [ ] SSL certificates issued and configured
- [ ] Site accessible at https://mrdsphub.in
- [ ] API accessible at https://api.mrdsphub.in/api
- [ ] Admin panel accessible at https://api.mrdsphub.in/mrdspadmin/
- [ ] Site Settings configured
- [ ] Default tenant created

---

## 🔧 Troubleshooting

### Issue: Cannot push to GitHub

**Solution:**
```bash
# Check remote
git remote -v

# If not set:
git remote add origin git@github.com:DINESHPRASAD935/DSP_STORE.git

# Or use HTTPS:
git remote set-url origin https://github.com/DINESHPRASAD935/DSP_STORE.git
```

### Issue: EC2 cannot connect to RDS

**Solution:**
- Check RDS security group allows EC2 security group
- Verify RDS is in same VPC as EC2
- Check RDS endpoint is correct

### Issue: Frontend not loading

**Solution:**
- Check S3 bucket is public
- Verify CloudFront distribution is deployed
- Check DNS records point to CloudFront
- Clear browser cache

### Issue: API CORS errors

**Solution:**
- Check `.env` has correct `CORS_ALLOWED_ORIGINS`
- Verify frontend URL matches exactly
- Restart backend: `sudo systemctl restart mrdsphub-backend`

---

## 📚 Related Guides

- **[PROJECT_GUIDE.md](./guides/PROJECT_GUIDE.md)** - Complete project setup
- **[AWS_DEPLOYMENT_GUIDE.md](./guides/AWS_DEPLOYMENT_GUIDE.md)** - Detailed AWS deployment
- **[CONFIGURATION_GUIDE.md](./guides/CONFIGURATION_GUIDE.md)** - Configuration details
- **[MULTITENANT_GUIDE.md](./guides/MULTITENANT_GUIDE.md)** - Multitenant setup

---

## 🎉 Success!

Once all steps are complete, your site will be live at:
- **Frontend**: https://mrdsphub.in
- **API**: https://api.mrdsphub.in/api
- **Admin**: https://api.mrdsphub.in/mrdspadmin/

Good luck with your deployment! 🚀
