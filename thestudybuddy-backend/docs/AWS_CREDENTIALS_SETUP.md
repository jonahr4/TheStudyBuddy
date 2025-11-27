# 🔑 AWS Credentials Setup Guide

## Step 1: Get Your AWS Credentials

You need to create an IAM user with appropriate permissions to use Elastic Beanstalk.

### Option A: If You Already Have an AWS Account

1. **Go to AWS IAM Console:**
   - Visit: https://console.aws.amazon.com/iam/
   - Sign in with your AWS account

2. **Create a New IAM User:**
   - Click "Users" in the left sidebar
   - Click "Create user" button
   - User name: `eb-deployer` (or any name you prefer)
   - Click "Next"

3. **Set Permissions:**
   - Select "Attach policies directly"
   - Search for and select these policies (type them in the search box):
     - ✅ `AdministratorAccess-AWSElasticBeanstalk` ← Use this one!
     - ✅ OR search for "elastic beanstalk" and select any policy with "WebTier" or "WorkerTier"
     - ✅ `IAMFullAccess` OR `IAMUserChangePassword` (for creating service roles)
   
   **Alternative (Easier):** Just attach `AdministratorAccess` (gives full access to everything)
   - This is fine for personal projects/development
   - Search for: `AdministratorAccess`
   - ⚠️ Don't use this for production teams
   
   - Click "Next"
   - Click "Create user"

4. **Create Access Keys:**
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Scroll down to "Access keys"
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check "I understand the above recommendation..."
   - Click "Next"
   - (Optional) Add a description tag
   - Click "Create access key"
   
5. **IMPORTANT: Save Your Credentials!**
   - ⚠️ **Access Key ID**: `AKIA...` (copy this)
   - ⚠️ **Secret Access Key**: (shown only once - copy this!)
   - Click "Download .csv file" to save them
   - ⚠️ You won't be able to see the secret key again!

### Option B: If You DON'T Have an AWS Account

1. **Create AWS Account:**
   - Go to: https://aws.amazon.com/
   - Click "Create an AWS Account"
   - Follow the signup process (requires credit card, but free tier is available)

2. **After Account Creation:**
   - You'll automatically have an admin user
   - Follow "Option A" above to create an IAM user for EB CLI

## Step 2: Configure AWS CLI

Now that you have your credentials, run:

```bash
aws configure
```

Enter the following when prompted:

```
AWS Access Key ID [None]: AKIA................  # ← Paste your Access Key ID
AWS Secret Access Key [None]: .................  # ← Paste your Secret Access Key
Default region name [None]: us-east-1           # ← Or your preferred region
Default output format [None]: json              # ← Keep as json
```

## Step 3: Verify Configuration

Test that your credentials work:

```bash
aws sts get-caller-identity
```

You should see something like:
```json
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/eb-deployer"
}
```

## Step 4: Initialize Elastic Beanstalk

Now you can initialize EB in your project:

```bash
cd /Users/jonahrothman/Desktop/Workspace/TheStudyBuddy/thestudybuddy-backend
eb init
```

Follow the prompts:
- **Region**: Select your region (e.g., `us-east-1`)
- **Application name**: Use default (`thestudybuddy-api`) or enter new name
- **Platform**: Select `Node.js`
- **Platform version**: Select `Node.js 18 running on 64bit Amazon Linux 2023`
- **SSH**: Type `n` (you don't need SSH access for now)

## Common Issues & Solutions

### ❌ "Credentials are expired or invalid"
- Make sure you copied the credentials correctly
- Check that your IAM user has the right permissions
- Try running `aws configure` again

### ❌ "Region is not set"
- Run `aws configure` and make sure you enter a region (e.g., `us-east-1`)

### ❌ "Access Denied" errors
- Your IAM user needs additional permissions
- Go back to IAM Console and add the required policies

### ❌ "Cannot find application"
- Run `eb init` first before running other EB commands

## Security Best Practices

✅ **DO:**
- Store credentials securely (they're in `~/.aws/credentials`)
- Use IAM users instead of root account
- Rotate access keys periodically
- Use MFA (Multi-Factor Authentication) on your AWS account

❌ **DON'T:**
- Commit credentials to git
- Share credentials with others
- Use root account credentials

## What These Credentials Allow

With these credentials, the EB CLI can:
- ✅ Create EC2 instances
- ✅ Configure security groups
- ✅ Set up load balancers
- ✅ Deploy your application
- ✅ View logs and monitor health
- ✅ Update environment variables

## AWS Free Tier

You get **750 hours/month** of EC2 t3.micro instances FREE for the first 12 months!

That's enough to run your backend 24/7 at no cost for a year. 🎉

---

## Next Steps

Once you've configured AWS CLI:

1. ✅ Run `aws configure` ← **YOU'RE HERE**
2. Run `eb init`
3. Run `eb create thestudybuddy-production --single`
4. Set environment variables with `eb setenv`
5. Deploy with `eb deploy`

**Questions?** Check the main deployment guide: `DEPLOYMENT_COMPLETE.md`
