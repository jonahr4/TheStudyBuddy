# 🔗 Connecting Frontend (DigitalOcean) to Backend (AWS)

## ✅ What We Just Did

### Backend Changes (AWS Elastic Beanstalk)
- ✅ Updated CORS to allow `https://thestudybuddy.app`
- ✅ Rebuilding and redeploying now...

### Frontend Changes Needed (DigitalOcean App Platform)
You need to add the backend URL to your frontend environment variables.

## 📋 Steps to Connect

### 1. Add Backend URL to DigitalOcean

Go to your DigitalOcean App Platform dashboard:
- Click on **"Environment Variables"** section
- Click **"Edit"**
- Add this new variable:

```
VITE_API_URL = http://thestudybuddy-production.eba-ukitft4b.us-east-1.elasticbeanstalk.com
```

- Click **"Save"**
- DigitalOcean will automatically redeploy your frontend

### 2. Wait for Both Deployments to Complete

- ⏳ Backend deploying on AWS (currently in progress)
- ⏳ Frontend will redeploy on DigitalOcean after you save the env var

### 3. Test Your App

Once both deployments complete:

1. **Open your app**: https://thestudybuddy.app
2. **Try to sign up/log in**
3. **Check if API calls work** (create a subject, view dashboard, etc.)

## 🔍 Checking Deployment Status

### Backend (AWS)
Run this to check status:
```bash
cd thestudybuddy-backend
eb status
```

Look for:
- Status: **Ready**
- Health: **Green** (not Red)

### Frontend (DigitalOcean)
Check your DigitalOcean dashboard - it should show:
- Status: **Live**
- Deployment: **Successful**

## 🚨 Troubleshooting

### If Health is Still Red on Backend

Check logs:
```bash
eb logs | grep -i error
```

Common issues:
- MongoDB connection failed (check MongoDB Atlas whitelist - add `0.0.0.0/0`)
- Environment variables missing
- Server didn't start

### If Frontend Can't Connect to Backend

1. **Check browser console** (F12 → Console tab)
2. Look for CORS errors or network errors
3. Make sure `VITE_API_URL` is set correctly
4. Try accessing backend directly: http://thestudybuddy-production.eba-ukitft4b.us-east-1.elasticbeanstalk.com/health

## ✨ What Should Work Now

Once connected, these features will work in production:
- ✅ User authentication (Firebase)
- ✅ Create/edit/delete subjects
- ✅ View notes (if uploaded locally)
- ✅ Delete notes
- ✅ View flashcards (if generated locally)
- ✅ User profile sync

### Still Local-Only (Not Yet in Express)
- ⏳ Upload notes (PDFs/images)
- ⏳ AI flashcard generation
- ⏳ Chat with AI
- ⏳ YouTube recommendations

## 📊 Your Production Stack

```
User Browser
    ↓
https://thestudybuddy.app (DigitalOcean)
    ↓
http://thestudybuddy-production....elasticbeanstalk.com (AWS)
    ↓
MongoDB Atlas (Cloud Database)
    ↓
Azure OpenAI + Azure Blob Storage (AI & Storage)
```

## 💰 Monthly Costs

- **DigitalOcean App Platform**: $0-5/month (static site)
- **AWS Elastic Beanstalk**: $0/month (free tier for 12 months)
- **MongoDB Atlas**: $0/month (free tier)
- **Azure OpenAI**: Pay-per-use (~$1-10/month)
- **Azure Blob Storage**: ~$0-2/month
- **Total**: ~$1-17/month (possibly less with free tiers)

## 🎯 Next Steps After Connection Works

1. **Set up custom domain SSL** (DigitalOcean handles this automatically)
2. **Add remaining routes** to Express server (uploads, AI chat, etc.)
3. **Set up MongoDB Atlas IP whitelist** for AWS IP
4. **Configure HTTPS** for backend (AWS Certificate Manager)
5. **Set up monitoring** (AWS CloudWatch, DigitalOcean insights)

---

**Status**: Backend redeploying with updated CORS... 🚀

Once deployment completes, add the VITE_API_URL to DigitalOcean and test!
