# Quick Deploy Guide - GitHub to AWS (mrdsphub.in)

## 🚀 Step-by-Step Commands

### Step 1: Push to GitHub (Run These Commands)

```bash
cd /home/dinesh/DSP_STORE/DSP_STORE

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Complete multitenant application with admin panel and deployment guides"

# Push to GitHub
git push origin scratch

# Or push to main branch
git checkout -b main
git push origin main
```

**Verify**: Go to https://github.com/DINESHPRASAD935/DSP_STORE and check files are uploaded.

---

### Step 2: AWS Deployment Checklist

Follow **[DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md)** for detailed steps.

**Quick Summary:**

1. ✅ **Create RDS Database** (PostgreSQL)
2. ✅ **Create EC2 Instance** (Ubuntu)
3. ✅ **SSH to EC2** and clone repository
4. ✅ **Setup Backend** (Python, Django, Gunicorn, Nginx)
5. ✅ **Build Frontend** and upload to S3
6. ✅ **Create CloudFront** distribution
7. ✅ **Configure DNS** for mrdsphub.in
8. ✅ **Setup SSL** certificates
9. ✅ **Configure Site Settings** in admin panel

---

## 📝 Important URLs After Deployment

- **Frontend**: https://mrdsphub.in
- **Frontend Admin**: https://mrdsphub.in/admin
- **API**: https://api.mrdsphub.in/api
- **Django Admin**: https://api.mrdsphub.in/mrdspadmin

---

## 🔑 Key Configuration Values

### Backend .env (on EC2)
```env
DJANGO_SECRET_KEY=[generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"]
DEBUG=False
ALLOWED_HOSTS=api.mrdsphub.in,your-ec2-ip
DATABASE_URL=postgresql://mrdsphub_admin:password@mrdsphub-db.xxxxx.ap-south-1.rds.amazonaws.com:5432/postgres
CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
REQUIRE_AUTH_FOR_WRITES=true
```

### Frontend .env.production
```env
VITE_API_BASE_URL=https://api.mrdsphub.in/api
```

---

## ⚡ Quick Commands Reference

### On Your Local Machine

```bash
# Push code
cd /home/dinesh/DSP_STORE/DSP_STORE
git add .
git commit -m "Your commit message"
git push origin main

# Build frontend
cd frontend
npm run build
aws s3 sync dist/ s3://mrdsphub-frontend/ --delete
```

### On EC2 (via SSH)

```bash
# Pull latest code
cd /home/ubuntu/DSP_STORE
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart mrdsphub-backend
```

---

## 🆘 Need Help?

- **GitHub Issues**: See [GITHUB_PUSH_GUIDE.md](./GITHUB_PUSH_GUIDE.md)
- **AWS Deployment**: See [DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md)
- **Configuration**: See [guides/CONFIGURATION_GUIDE.md](./guides/CONFIGURATION_GUIDE.md)

---

**Ready to deploy? Start with Step 1 above!** 🚀
