# Converting Azure Functions to Express.js for Elastic Beanstalk

## Quick Start - 3 Options

### Option 1: Keep Azure Functions (Easiest - 5 min)
Just deploy your existing code with minimal changes:

1. Add `package.json` script:
```json
"scripts": {
  "start": "node dist/index.js"
}
```

2. Create `Procfile` (root of backend):
```
web: npm run start
```

3. Deploy with EB CLI:
```bash
eb init
eb create studybuddy-production
```

**Pros:** No code changes needed  
**Cons:** Azure Functions runtime might have compatibility issues with EB

---

### Option 2: Express Wrapper Around Azure Functions (Medium - 30 min)
Keep your Azure Functions but wrap them in Express routes.

**I recommend this approach** - it's the fastest path to deployment while keeping your code.

---

### Option 3: Full Express Conversion (Thorough - 2 hours)
Convert all Azure Functions to pure Express routes. Best for long-term but requires rewriting route handlers.

---

## RECOMMENDED: Option 2 - Express Wrapper

This keeps your existing Azure Functions code but wraps it in Express routes that Elastic Beanstalk can understand.

### Step 1: Install Express Dependencies

```bash
cd thestudybuddy-backend
npm install express cors dotenv
npm install --save-dev @types/express @types/cors
```

### Step 2: Update package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start:dev": "func start",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  }
}
```

### Step 3: Create server.ts (Express wrapper)

Create `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { connectMongo } from './db/connectMongo';

// Import your Azure Functions
import { SubjectsHttp } from './functions/SubjectsHttp';
import { NotesHttp } from './functions/NotesHttp';
import { FlashcardsHttp } from './functions/FlashcardsHttp';
import { ChatWithAI } from './functions/ChatWithAI';
// ... import other functions

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'The Study Buddy API' });
});

// Convert Azure Functions to Express routes
// Example: Wrap your Azure Function handlers
app.get('/api/subjects', async (req, res) => {
  try {
    // Call your Azure Function handler
    const result = await SubjectsHttp.getSubjects(req as any, {} as any);
    res.status(result.status || 200).json(result.jsonBody);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Repeat for all your endpoints...

// Start server
async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
```

### Step 4: Create Elastic Beanstalk Configuration

Create `.ebextensions/nodecommand.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
```

Create `.ebextensions/environment.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    # Add all your env variables here or via AWS Console
```

### Step 5: Create .elasticbeanstalk/config.yml

```yaml
branch-defaults:
  main:
    environment: studybuddy-production
global:
  application_name: thestudybuddy-backend
  default_ec2_keyname: null
  default_platform: Node.js 18 running on 64bit Amazon Linux 2023
  default_region: us-east-1
  include_git_submodules: true
  instance_profile: null
  platform_name: null
  platform_version: null
  profile: null
  sc: git
  workspace_type: Application
```

### Step 6: Create Procfile

Create `Procfile` in backend root:

```
web: npm start
```

### Step 7: Update .gitignore

Add to `.gitignore`:

```
# Elastic Beanstalk Files
.elasticbeanstalk/*
!.elasticbeanstalk/*.cfg.yml
!.elasticbeanstalk/*.global.yml
.ebextensions/environment.config
```

### Step 8: Deploy

```bash
# Initialize EB
eb init -p node.js-18 thestudybuddy-backend

# Create environment and deploy
eb create studybuddy-production

# Set environment variables via console or CLI
eb setenv MONGODB_URI="your_mongodb_uri" \
  AZURE_OPENAI_KEY="your_key" \
  AZURE_OPENAI_ENDPOINT="your_endpoint"

# Deploy updates
eb deploy
```

---

## Environment Variables to Set

Set these in AWS Console → Elastic Beanstalk → Configuration → Software:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-5-nano
AZURE_STORAGE_CONNECTION_STRING=...
FIREBASE_PROJECT_ID=thestudybuddy-8da15
PORT=8080
```

---

## Testing Deployment

```bash
# Check status
eb status

# View logs
eb logs

# Open in browser
eb open

# SSH into instance
eb ssh
```

---

## Advantages Over Azure Functions

| Feature | Azure Functions | Elastic Beanstalk |
|---------|----------------|-------------------|
| Deployment Speed | Slow (10-15 min) | Fast (5-7 min) |
| Cost (low traffic) | $0-10/month | $0-5/month (free tier) |
| HTTPS Setup | Complex | Automatic |
| Environment Variables | Complex portal | Simple UI |
| Logs | Azure Monitor | CloudWatch (simpler) |
| Debugging | Limited | SSH access |
| Node.js Support | Specific runtime | Any Node version |
| Docker Required | No | No |

---

## Cost Comparison

**Azure Functions:**
- Consumption: ~$5-15/month
- App Service Plan: ~$55/month minimum

**Elastic Beanstalk:**
- t3.micro (free tier): $0/month
- t3.small: ~$15/month
- Load Balancer: ~$16/month
- **Total: $20-30/month** (or $0 on free tier)

---

## Next Steps After Deployment

1. ✅ Test all endpoints with Postman
2. ✅ Update frontend `VITE_API_URL`
3. ✅ Set up custom domain (optional)
4. ✅ Enable HTTPS with AWS Certificate Manager
5. ✅ Set up CloudWatch alarms
6. ✅ Configure auto-scaling rules

---

## Troubleshooting Common Issues

### Issue: npm install fails
**Solution:** Make sure all dependencies are in `package.json`, not just `devDependencies`

### Issue: MongoDB connection timeout
**Solution:** 
- Whitelist EB IP in MongoDB Atlas
- Or use `0.0.0.0/0` for all IPs (during testing)

### Issue: Application not starting
**Solution:**
- Check logs: `eb logs`
- Verify `npm start` works locally
- Ensure PORT is `process.env.PORT || 8080`

### Issue: CORS errors
**Solution:** Update CORS to include your frontend domain

---

## Alternative: Keep Azure Functions + Deploy as Docker

If you want to keep Azure Functions runtime:

1. Create `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/azure-functions/node:4-node18

WORKDIR /home/site/wwwroot
COPY . .

RUN npm install
RUN npm run build

EXPOSE 80

CMD [ "func", "start", "--port", "80" ]
```

2. Deploy Docker to EB:
```bash
eb init
eb create --single  # Single instance for simplicity
```

But this defeats the purpose of EB's simplicity. Express wrapper is better.

---

## Summary

**Best approach for you:**
1. Install Express
2. Create `server.ts` that wraps your Azure Functions
3. Deploy to Elastic Beanstalk
4. Set environment variables in AWS Console
5. Update frontend API URL
6. Done! ✅

Total time: **30-45 minutes**
