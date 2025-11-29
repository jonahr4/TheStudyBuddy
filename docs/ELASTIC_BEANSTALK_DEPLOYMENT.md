# AWS Elastic Beanstalk Deployment Guide

## Why Elastic Beanstalk is Perfect for The Study Buddy

✅ **Auto-deployment** - Push to GitHub, automatic deploy  
✅ **Handles Node.js** without Docker configuration  
✅ **Simple .env** configuration via AWS Console  
✅ **Auto HTTPS** - SSL certificates handled automatically  
✅ **Logs & Scaling** - Built-in CloudWatch logging and auto-scaling  
✅ **Fast Setup** - Deploy in under 10 minutes  

---

## Step-by-Step Deployment

### 1. Install AWS Elastic Beanstalk CLI

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Verify installation
eb --version
```

### 2. Initialize Your AWS Account

1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Create a new AWS account (or sign in)
3. Navigate to **IAM** → **Users** → **Create User**
4. Give user **AdministratorAccess** (for simplicity)
5. Create **Access Keys** and save them

### 3. Configure AWS Credentials

```bash
# Configure AWS CLI (if not already done)
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region: us-east-1 (or your preferred region)
# - Default output format: json
```

### 4. Convert Azure Functions to Express.js

Your backend needs to be converted from Azure Functions to a standard Express.js app. I've created the conversion files for you.

**Key changes:**
- Replace Azure Functions HTTP triggers with Express routes
- Single entry point: `server.ts`
- Middleware for CORS, body parsing, auth
- Keep all your existing MongoDB/Azure OpenAI logic

### 5. Initialize Elastic Beanstalk in Your Backend

```bash
cd thestudybuddy-backend

# Initialize EB application
eb init

# Answer the prompts:
# - Select a default region: us-east-1 (or your preferred region)
# - Application name: thestudybuddy-backend
# - Platform: Node.js
# - Platform version: Node.js 18 running on 64bit Amazon Linux 2023
# - Do you want to set up SSH? Yes (recommended for debugging)
```

### 6. Create Environment Variables File

Create `.ebextensions/environment.config` (already created for you):

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    MONGODB_URI: your_mongodb_uri_here
    AZURE_OPENAI_ENDPOINT: your_endpoint_here
    AZURE_OPENAI_KEY: your_key_here
    AZURE_OPENAI_DEPLOYMENT: gpt-5-nano
    AZURE_STORAGE_CONNECTION_STRING: your_connection_string_here
    FIREBASE_PROJECT_ID: thestudybuddy-8da15
```

**Important:** Don't commit actual secrets to Git! Set them via AWS Console after deployment.

### 7. Create and Deploy Environment

```bash
# Create environment (first deployment)
eb create studybuddy-production

# This will:
# - Create EC2 instances
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your application
# - Give you a public URL: http://studybuddy-production.us-east-1.elasticbeanstalk.com
```

**Note:** First deployment takes 5-10 minutes.

### 8. Set Environment Variables (Securely)

After deployment, set your secrets via AWS Console:

1. Go to **Elastic Beanstalk** → **Environments** → `studybuddy-production`
2. Click **Configuration** → **Software** → **Edit**
3. Scroll to **Environment properties**
4. Add all your environment variables:
   - `MONGODB_URI`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_KEY`
   - `AZURE_STORAGE_CONNECTION_STRING`
   - etc.
5. Click **Apply**

### 9. Enable HTTPS (Free SSL)

1. In your EB environment → **Configuration** → **Load Balancer**
2. Click **Add Listener**
3. Choose **HTTPS (port 443)**
4. Select **AWS Certificate Manager** certificate (or create new one)
5. Apply changes

Your API will now be accessible via:
- HTTP: `http://studybuddy-production.us-east-1.elasticbeanstalk.com`
- HTTPS: `https://studybuddy-production.us-east-1.elasticbeanstalk.com`

### 10. Update Frontend to Use Production API

In `thestudybuddy-frontend/.env.production`:

```bash
VITE_API_URL=https://studybuddy-production.us-east-1.elasticbeanstalk.com/api
```

### 11. Set Up Auto-Deployment (Optional)

**Option A: EB CLI Deploy**
```bash
# After making changes
npm run build
eb deploy
```

**Option B: GitHub Actions (Recommended)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Elastic Beanstalk

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
        working-directory: thestudybuddy-backend
      
      - name: Build
        run: npm run build
        working-directory: thestudybuddy-backend
      
      - name: Deploy to EB
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: thestudybuddy-backend
          environment_name: studybuddy-production
          region: us-east-1
          version_label: ${{ github.sha }}
          deployment_package: thestudybuddy-backend
```

Add secrets to GitHub:
- Go to your repo → **Settings** → **Secrets and variables** → **Actions**
- Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

---

## Useful Commands

```bash
# Check environment status
eb status

# View logs
eb logs

# SSH into server (for debugging)
eb ssh

# Open application in browser
eb open

# Deploy after changes
eb deploy

# Terminate environment (DELETE EVERYTHING)
eb terminate studybuddy-production
```

---

## Monitoring & Debugging

### View Logs
```bash
# Stream logs in real-time
eb logs --stream

# Download last 100 lines
eb logs
```

### CloudWatch Logs
- Go to **CloudWatch** → **Log groups** → `/aws/elasticbeanstalk/studybuddy-production/`
- View Node.js application logs, nginx logs, and deployment logs

### Health Dashboard
- Go to your EB environment
- Click **Health** tab
- See CPU, memory, request count, response time

---

## Cost Estimate

**Elastic Beanstalk Pricing (US East):**
- **t3.micro** (free tier eligible): $0/month (first 750 hours)
- **t3.small**: ~$15/month (1 instance)
- **Load Balancer**: ~$16/month
- **Data Transfer**: Usually <$1/month for low traffic

**Total for development:** ~$0-5/month (with free tier)  
**Total for production:** ~$20-30/month

---

## Scaling Configuration

By default, EB auto-scales based on:
- CPU > 70% → Add instance
- CPU < 20% → Remove instance
- Min instances: 1
- Max instances: 4

You can configure this in:
**Configuration** → **Capacity** → **Auto Scaling Group**

---

## Troubleshooting

### Issue: Environment creation failed
**Solution:** Check CloudWatch logs for errors. Common issues:
- Missing npm dependencies in `package.json`
- TypeScript not compiling correctly
- Port configuration (must use `process.env.PORT`)

### Issue: 502 Bad Gateway
**Solution:** 
- Check application logs: `eb logs`
- Verify your app starts correctly: `npm start` locally
- Ensure server listens on `process.env.PORT || 8080`

### Issue: CORS errors
**Solution:** Update CORS configuration to include your frontend domain:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

### Issue: Environment variables not loading
**Solution:**
- Verify they're set in EB Console → Configuration → Software
- Restart application: `eb restart`
- Check they're being read: `console.log(process.env.MONGODB_URI)`

---

## Next Steps After Deployment

1. ✅ Test all API endpoints via Postman/Insomnia
2. ✅ Update frontend `.env.production` with new API URL
3. ✅ Deploy frontend to Azure Static Web Apps
4. ✅ Configure custom domain (optional)
5. ✅ Set up CloudWatch alarms for errors
6. ✅ Enable application monitoring
7. ✅ Set up database backups

---

## Resources

- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [EB CLI Reference](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [Node.js on EB](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)
