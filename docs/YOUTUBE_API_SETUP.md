# YouTube API Setup Instructions

This guide will help you set up the YouTube Data API v3 for Study Buddy's video recommendations feature.

## Prerequisites
- Google Account
- Google Cloud Console access

## Step-by-Step Setup

### 1. Go to Google Cloud Console
Navigate to: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Create or Select a Project
- If you don't have a project, click **"Create Project"**
  - Enter a project name (e.g., "Study Buddy")
  - Click **"Create"**
- If you already have a project, select it from the dropdown at the top

### 3. Enable YouTube Data API v3
1. In the left sidebar, click **"APIs & Services"** > **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click on **"YouTube Data API v3"**
4. Click the **"Enable"** button

### 4. Create API Credentials
1. After enabling the API, click **"Create Credentials"** (or go to APIs & Services > Credentials)
2. On the "Create Credentials" page:
   - Select **"API key"**
3. Your API key will be generated and displayed
4. **IMPORTANT:** Click the **"Restrict Key"** button to secure your API key

### 5. Restrict Your API Key (Recommended)
1. Under **"API restrictions"**, select **"Restrict key"**
2. From the dropdown, select **"YouTube Data API v3"**
3. Under **"Application restrictions"** (optional but recommended):
   - For development: Select **"HTTP referrers"**
   - Add `http://localhost:7071/*` and `http://localhost:5176/*`
4. Click **"Save"**

### 6. Copy Your API Key
Copy the API key that was generated. It will look something like:
```
AIzaSyB1234567890ABCDEFGHIJKLMNOPQRS
```

### 7. Add API Key to Study Buddy Backend

1. Open the file: `thestudybuddy-backend/local.settings.json`
2. Find the line with `"YOUTUBE_API_KEY": "YOUR_YOUTUBE_API_KEY_HERE"`
3. Replace `YOUR_YOUTUBE_API_KEY_HERE` with your actual API key:

```json
{
  "IsEncrypted": false,
  "Values": {
    ...
    "YOUTUBE_API_KEY": "AIzaSyB1234567890ABCDEFGHIJKLMNOPQRS"
  }
}
```

4. Save the file

### 8. Restart the Backend Server
After adding the API key, restart your backend server:

```bash
cd thestudybuddy-backend
npm run start
```

## Testing the Integration

1. Make sure both frontend and backend are running
2. Navigate to any subject page
3. Scroll down to see YouTube video recommendations
4. The recommendations should appear below the notes section

## API Quota Limits

The YouTube Data API v3 has free usage limits:
- **Default quota:** 10,000 units per day
- **Search request:** 100 units per call
- With default settings, you can make approximately **100 searches per day**

### Tips to Manage Quota:
- Implement caching (future enhancement)
- Limit the number of recommendations per page
- Monitor usage in Google Cloud Console under "APIs & Services" > "Dashboard"

## Troubleshooting

### "YouTube API not configured" Error
- Verify the API key is correctly added to `local.settings.json`
- Ensure you restarted the backend server after adding the key
- Check that there are no extra spaces or quotes around the API key

### "Failed to fetch recommendations" Error
- Verify the API key is valid
- Check that YouTube Data API v3 is enabled in Google Cloud Console
- Ensure you haven't exceeded the daily quota (10,000 units)
- Check the backend console logs for detailed error messages

### Videos Not Loading
- Open browser developer console (F12) and check for errors
- Verify your network connection
- Check if the API key restrictions are too strict (try removing restrictions temporarily for testing)

## Where Video Recommendations Appear

Video recommendations are integrated into:
1. **Subject Detail Pages** - Shows videos related to the subject name
2. **Dashboard** - Shows general study tips and learning technique videos

## Future Enhancements (Optional)

Consider implementing:
- **Caching:** Store video results in MongoDB to reduce API calls
- **User Preferences:** Let users save favorite videos
- **Watch History:** Track which videos users have watched
- **Embedded Player:** Show videos in-app without leaving the page
- **Custom Search:** Let users search for specific topics

## Security Notes

⚠️ **IMPORTANT:**
- Never commit your API key to version control
- `local.settings.json` should be in `.gitignore`
- For production, use environment variables or Azure Key Vault
- Set up API key restrictions to prevent unauthorized use

## Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)

