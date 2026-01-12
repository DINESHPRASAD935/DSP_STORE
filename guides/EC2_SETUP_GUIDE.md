# EC2 Instance Setup Guide for Django Backend

Complete guide to create and configure an EC2 instance for your Django backend application using the latest AWS Console (2024).

## 📋 Overview

This guide covers:
- EC2 instance creation with latest AWS Console
- Instance type recommendations for Django
- Security group configuration
- Storage and networking setup
- Automated setup with user data script
- Post-deployment configuration

## 🎯 Instance Type Recommendations

### For Development/Testing (Low Traffic)
- **t3.micro** (Free Tier eligible)
  - 2 vCPU, 1 GB RAM
  - Burstable performance
  - Cost: ~$8-10/month
  - **Suitable for**: Testing, low traffic (< 1000 requests/day)

### For Production (Recommended)
- **t3.small**
  - 2 vCPU, 2 GB RAM
  - Burstable performance
  - Cost: ~$15-18/month
  - **Suitable for**: Small to medium traffic (< 10,000 requests/day)

- **t3.medium**
  - 2 vCPU, 4 GB RAM
  - Burstable performance
  - Cost: ~$30-35/month
  - **Suitable for**: Medium traffic (< 50,000 requests/day)

### For High Traffic
- **t3.large** or **t3.xlarge**
  - More vCPU and RAM
  - Cost: ~$60-120/month
  - **Suitable for**: High traffic (> 50,000 requests/day)

**Recommendation**: Start with **t3.small** for production, scale up as needed.

## 🚀 Step-by-Step EC2 Creation (Latest AWS Console)

### Step 1: Access EC2 Console

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Navigate to EC2**:
   - Search "EC2" in the top search bar
   - Click "EC2" service
   - Or go directly: https://console.aws.amazon.com/ec2/

### Step 2: Launch Instance

1. **Click "Launch Instance"** button (top right or in the dashboard)

2. **Name and Tags**:
   - **Name**: `mrdsphub-backend` (or your preferred name)
   - **Tags** (optional but recommended):
     - `Environment`: `production`
     - `Project`: `mrdsphub`
     - `ManagedBy`: `manual`

### Step 3: Application and OS Images (AMI)

1. **Quick Start** tab:
   - Select **"Ubuntu"**
   - Choose **"Ubuntu Server 22.04 LTS"** (or latest LTS)
   - **Architecture**: `64-bit (x86)`

2. **Why Ubuntu 22.04 LTS?**
   - Long-term support until 2027
   - Python 3.10+ pre-installed
   - Stable and well-documented
   - Good community support

### Step 4: Instance Type

1. **Select Instance Type**:
   - For production: **t3.small** (recommended)
   - For testing: **t3.micro** (free tier)
   
2. **Instance Details**:
   - **Number of instances**: `1`
   - **Network**: Select your VPC (default VPC is fine)
   - **Subnet**: Select a public subnet (for internet access)
   - **Auto-assign Public IP**: **Enable** (if using default VPC)
   - **Placement group**: None (unless using multiple instances)
   - **Capacity Reservation**: None

### Step 5: Key Pair (Login Credentials)

1. **Key Pair Settings**:
   - **Key pair name**: Create new or select existing
   - **Key pair type**: `RSA`
   - **Private key file format**: `.pem` (for Linux/Mac) or `.ppk` (for Windows PuTTY)

2. **Create New Key Pair**:
   - Click "Create new key pair"
   - **Name**: `mrdsphub-backend-key`
   - **Key pair type**: `RSA`
   - **Private key file format**: `.pem`
   - Click "Create key pair"
   - **IMPORTANT**: Download the `.pem` file immediately (you can't download it again!)

3. **Store Key Securely**:
   ```bash
   # On Linux/Mac, set proper permissions
   chmod 400 mrdsphub-backend-key.pem
   ```

### Step 6: Network Settings

1. **Configure Security Group**:
   - **Security group name**: `mrdsphub-backend-sg`
   - **Description**: `Security group for Django backend`

2. **Inbound Security Group Rules** (Add these rules):

   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | My IP | SSH access from your IP |
   | HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
   | Custom TCP | TCP | 8000 | 127.0.0.1/32 | Gunicorn (localhost only) |

   **To add rules**:
   - Click "Add security group rule" for each rule
   - Select Type, Protocol, Port Range
   - For Source:
     - **SSH (22)**: Click **"My IP"** button to auto-fill your IP (easiest method!), or manually enter your IP address
     - **HTTP/HTTPS**: Select "Anywhere-IPv4" (0.0.0.0/0)
     - **Port 8000**: Select "Custom" and enter `127.0.0.1/32` (localhost only)
   
   **🔍 How to Find Your IP Address (if "My IP" doesn't work):**
   
   **Easiest Method**: Use AWS Console's **"My IP"** button - it automatically detects your IP!
   
   **Alternative Methods**:
   - **Online**: Visit https://whatismyipaddress.com/ or https://ifconfig.me/
   - **Command Line (Linux/Mac)**: `curl ifconfig.me`
   - **Command Line (Windows)**: `(Invoke-WebRequest -Uri "https://api.ipify.org").Content`
   
   **⚠️ Note**: If you have a dynamic IP (most home connections), your IP may change. If SSH stops working, check if your IP changed and update the security group rule.

3. **Outbound Rules**:
   - Default (Allow all) is fine

4. **VPC**: Select your VPC (default is fine)

### Step 7: Configure Storage

1. **Storage Configuration**:
   - **Volume 1 (Root volume)**:
     - **Size (GiB)**: `20` (minimum) or `30` (recommended)
     - **Volume type**: `gp3` (latest, cheaper than gp2)
     - **IOPS**: `3000` (default for gp3)
     - **Throughput (MB/s)**: `125` (default)
     - **Delete on termination**: ✅ **Checked** (removes volume when instance terminates)
     - **Encryption**: ✅ **Enable** (recommended for production)
     - **Snapshot ID**: Leave blank

2. **Why gp3?**
   - Latest generation SSD
   - Better price/performance than gp2
   - Configurable IOPS and throughput

3. **Additional Volumes**: None needed for basic setup

### Step 8: Advanced Details (Optional but Recommended)

1. **IAM Instance Profile** (Optional):
   - Create IAM role for EC2 if you need AWS service access
   - For basic setup, leave as "None"

2. **User Data** (Automated Setup Script):

   Copy and paste this script to automatically install dependencies:

   ```bash
   #!/bin/bash
   # Update system
   apt-get update -y
   apt-get upgrade -y
   
   # Install Python 3.12 and dependencies
   apt-get install -y python3.12 python3.12-venv python3-pip python3.12-dev
   apt-get install -y postgresql-client git nginx curl
   apt-get install -y build-essential libpq-dev
   
   # Install Node.js (if needed for any build tools)
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   
   # Create application directory
   mkdir -p /home/ubuntu/DSP_STORE
   chown ubuntu:ubuntu /home/ubuntu/DSP_STORE
   
   # Set up log directory
   mkdir -p /home/ubuntu/DSP_STORE/backend/logs
   chown ubuntu:ubuntu /home/ubuntu/DSP_STORE/backend/logs
   
   # Install CloudWatch agent (optional, for monitoring)
   # wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
   # dpkg -i -E ./amazon-cloudwatch-agent.deb
   
   # Reboot to ensure all updates are applied
   reboot
   ```

   **Note**: User data script runs on first boot. The instance will reboot after initial setup.

3. **Metadata accessible**: ✅ Enabled (default)

4. **Metadata version**: `v1.0 and v2.0` (default)

5. **Metadata token**: `Required` (recommended for security)

6. **Metadata token response hop limit**: `1` (default)

### Step 9: Summary and Launch

1. **Review Summary**:
   - Check all settings
   - Verify instance type, storage, security groups
   - Ensure key pair is downloaded

2. **Number of instances**: `1`

3. **Click "Launch Instance"**

4. **Wait for Launch**:
   - You'll see "Your instances are now launching"
   - Click "View all instances" or the instance ID

5. **Instance Status**:
   - Wait for "Status checks" to show "2/2 checks passed"
   - This may take 2-5 minutes

## 🔧 Post-Launch Configuration

### Step 1: Get Instance Details

1. **Note the following**:
   - **Public IPv4 address**: `xx.xx.xx.xx` (for SSH access)
   - **Instance ID**: `i-xxxxxxxxxxxxx`
   - **Security Group ID**: `sg-xxxxxxxxxxxxx`

### Step 2: Connect to Instance (SSH)

**🔍 What is SSH?**
**SSH (Secure Shell)** is a secure way to remotely access your EC2 server. It's like a secure command-line connection that lets you:
- Run commands on your server
- Install software and configure your application
- Manage files and check logs
- Troubleshoot issues

**Think of it as**: A secure remote terminal to control your server from your computer.

**📝 Step-by-Step Connection:**

**1. Get Your EC2 Details:**
   - Go to AWS Console → EC2 → Instances
   - Find your instance → Note the **Public IPv4 address** (e.g., `54.123.45.67`)

**2. Set Key Permissions (Linux/Mac):**
```bash
# Navigate to where your .pem file is
cd ~/Downloads  # or wherever you saved it

# Set permissions (required for security)
chmod 400 mrdsphub-backend-key.pem
```

**3. Connect via SSH:**

**On Linux/Mac:**
```bash
# Replace <PUBLIC_IP> with your actual EC2 IP address
ssh -i mrdsphub-backend-key.pem ubuntu@<PUBLIC_IP>

# Example:
ssh -i mrdsphub-backend-key.pem ubuntu@54.123.45.67
```

**Command Breakdown:**
- `ssh` = SSH command
- `-i` = identity file (your key)
- `mrdsphub-backend-key.pem` = your key file
- `ubuntu` = username (Ubuntu default)
- `@54.123.45.67` = your EC2 IP address

**On Windows (PowerShell or WSL):**
```powershell
# Same command works
ssh -i mrdsphub-backend-key.pem ubuntu@<PUBLIC_IP>
```

**On Windows (PuTTY):**
1. Download PuTTY: https://www.putty.org/
2. Convert `.pem` to `.ppk`:
   - Open PuTTYgen
   - Load your `.pem` file
   - Save as `.ppk` file
3. Open PuTTY:
   - Host: `ubuntu@<PUBLIC_IP>`
   - Connection → SSH → Auth → Browse for `.ppk` file
   - Click "Open"

**4. First Connection:**
You'll see a message asking to accept the fingerprint. Type `yes`.

**5. Success!**
You should see:
```
Welcome to Ubuntu 22.04.3 LTS
ubuntu@ip-172-31-xx-xx:~$
```

**✅ Verify Connection:**
```bash
# Check where you are
pwd
# Output: /home/ubuntu

# Check who you are
whoami
# Output: ubuntu
```

**To Disconnect:** Type `exit` or press `Ctrl + D`

**⚠️ Troubleshooting:**
- **"Permission denied"**: Run `chmod 400 your-key.pem`
- **"Connection timed out"**: Check security group allows SSH from your IP
- **"Host key verification failed"**: Run `ssh-keygen -R <IP_ADDRESS>`

### Step 3: Verify System Setup

```bash
# Check Python version
python3.12 --version  # Should show Python 3.12.x

# Check installed packages
which python3.12
which pip3
which nginx
which git
```

### Step 4: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/DINESHPRASAD935/DSP_STORE.git
cd DSP_STORE/backend
```

### Step 5: Setup Python Environment

```bash
# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### Step 6: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add your configuration (see [Configuration Guide](./CONFIGURATION_GUIDE.md)):

```env
# ============================================
# REQUIRED: System-Level Settings
# ============================================
DJANGO_SECRET_KEY=your-very-strong-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.mrdsphub.in,your-ec2-public-ip

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/dbname

# ============================================
# CORS Configuration
# ============================================
CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in,https://*.mrdsphub.in

# ============================================
# Email Configuration
# ============================================
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
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

### Step 7: Run Migrations

```bash
# Activate virtual environment
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### Step 8: Test Gunicorn

```bash
# Test Gunicorn manually
gunicorn dsp_store.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Press Ctrl+C to stop
```

### Step 9: Setup Gunicorn as Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/mrdsphub-backend.service
```

Add:

```ini
[Unit]
Description=MrDSP Hub Django Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/DSP_STORE/backend
Environment="PATH=/home/ubuntu/DSP_STORE/backend/venv/bin"
ExecStart=/home/ubuntu/DSP_STORE/backend/venv/bin/gunicorn dsp_store.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 120 --access-logfile /home/ubuntu/DSP_STORE/backend/logs/access.log --error-logfile /home/ubuntu/DSP_STORE/backend/logs/error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mrdsphub-backend
sudo systemctl start mrdsphub-backend
sudo systemctl status mrdsphub-backend
```

### Step 10: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/mrdsphub-backend
```

Add:

```nginx
server {
    listen 80;
    server_name api.mrdsphub.in;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }

    # Serve static files
    location /static/ {
        alias /home/ubuntu/DSP_STORE/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve media files
    location /media/ {
        alias /home/ubuntu/DSP_STORE/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to .env and other sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/mrdsphub-backend /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Security Best Practices

### 1. Update Security Group

**Restrict SSH Access**:
- Change SSH source from `0.0.0.0/0` to your specific IP
- Or use AWS Systems Manager Session Manager (no SSH needed)

### 2. Setup Firewall (UFW)

```bash
# Install UFW
sudo apt install ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 3. Setup SSL/TLS

Use Let's Encrypt (Certbot):

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.mrdsphub.in

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

### 4. Regular Updates

```bash
# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring and Logging

### 1. View Application Logs

```bash
# Gunicorn logs
tail -f /home/ubuntu/DSP_STORE/backend/logs/error.log
tail -f /home/ubuntu/DSP_STORE/backend/logs/access.log

# Systemd service logs
sudo journalctl -u mrdsphub-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 2. Setup CloudWatch (Optional)

Install CloudWatch agent for advanced monitoring:

```bash
# Download agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure (interactive)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

## 💰 Cost Optimization

### 1. Use Reserved Instances (for long-term)
- Save up to 72% compared to On-Demand
- 1-year or 3-year terms

### 2. Use Spot Instances (for non-critical)
- Save up to 90% compared to On-Demand
- Can be interrupted (not recommended for production)

### 3. Right-Size Your Instance
- Monitor CPU and memory usage
- Downsize if consistently underutilized
- Upsize if consistently hitting limits

### 4. Enable Auto-Stop (for development)
- Stop instance when not in use
- Resume when needed
- Saves compute costs

## 🔄 Scaling Considerations

### Vertical Scaling (Scale Up)
- Increase instance size (t3.small → t3.medium)
- Simple but has limits
- Requires downtime

### Horizontal Scaling (Scale Out)
- Add more instances behind Load Balancer
- No downtime
- Better for high availability
- Requires Application Load Balancer setup

## ✅ Verification Checklist

After setup, verify:

- [ ] Instance is running and healthy
- [ ] SSH access works
- [ ] Python 3.12 installed
- [ ] Repository cloned
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Gunicorn service running
- [ ] Nginx configured and running
- [ ] Static files collected
- [ ] API accessible at `http://<PUBLIC_IP>/api/`
- [ ] Django admin accessible at `http://<PUBLIC_IP>/mrdspadmin`
- [ ] Security group rules correct
- [ ] SSL certificate installed (if using domain)

## 🆘 Troubleshooting

### Instance Won't Start
- Check security group allows SSH
- Verify key pair permissions
- Check instance status in console

### Can't Connect via SSH
- Verify security group allows port 22 from your IP
- Check key pair file permissions: `chmod 400 key.pem`
- Verify you're using correct user: `ubuntu` (not `root`)

### Gunicorn Not Starting
- Check logs: `sudo journalctl -u mrdsphub-backend -f`
- Verify virtual environment is activated
- Check `.env` file exists and has correct values
- Verify database connection

### Nginx 502 Bad Gateway
- Check Gunicorn is running: `sudo systemctl status mrdsphub-backend`
- Verify Gunicorn is listening on `127.0.0.1:8000`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### High Memory Usage
- Monitor with: `htop` or `free -h`
- Consider upgrading instance type
- Optimize Gunicorn workers (reduce if needed)

## 📚 Related Documentation

- [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) - Complete deployment steps
- [Configuration Guide](./CONFIGURATION_GUIDE.md) - Environment variables
- [Production URLs Guide](./PRODUCTION_URLS_GUIDE.md) - URL configuration

---

**Last Updated**: 2024
