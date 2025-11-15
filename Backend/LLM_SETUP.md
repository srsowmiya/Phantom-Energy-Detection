# Google Gemini API Setup Guide

## Overview

The Analytics Report feature uses Google Gemini API (from Google AI Studio) to generate humanized insights about your energy consumption data. This guide explains how to set it up.

## Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Select or create a Google Cloud project
5. Copy the API key (you can view it again later)

**Note:** Google Gemini API has a free tier with generous limits!

## Step 2: Install Google Generative AI Package

```bash
cd Backend
npm install @google/generative-ai
```

## Step 3: Configure Environment Variables

Create or update `.env` file in the `Backend` folder:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

**Note:** 
- Replace `your_gemini_api_key_here` with your actual API key from Google AI Studio
- `gemini-pro` is the default model (free tier available)
- You can use `gemini-1.5-pro` for better quality (if available)

## Step 4: Restart Backend Server

After adding the API key, restart your backend:

```bash
npm start
```

## How It Works

1. **User visits Analytics Report page** (`/analytics-report`)
2. **Frontend requests insights** from `/api/analytics/insights`
3. **Backend collects analytics data** (phantom events, power consumption, etc.)
4. **Backend sends data to Google Gemini** with a prompt asking for analysis
5. **Gemini generates humanized insights** with recommendations
6. **Backend returns insights** to frontend
7. **Frontend displays** charts and AI insights

## Fallback Mode

If Gemini API key is not configured:
- The system will use a **fallback insights generator**
- Provides basic analysis without AI
- Still shows all charts and data
- No API costs

## Cost Considerations

- **Gemini Pro**: Free tier available with generous limits
- **Rate Limits**: 60 requests per minute (free tier)
- **No credit card required** for free tier
- Very affordable and accessible

## Available Models

- `gemini-pro` - Default, good balance of quality and speed
- `gemini-1.5-pro` - Higher quality (if available in your region)
- `gemini-1.5-flash` - Faster responses (if available)

## Security Notes

- **Never commit** `.env` file to git
- Keep your API key **secret**
- Use environment variables for all sensitive data
- Google AI Studio allows you to regenerate keys if needed

## Troubleshooting

### "Google Generative AI package not installed"
```bash
cd Backend
npm install @google/generative-ai
```

### "Invalid API Key"
- Check if API key is correct in `.env` file
- Verify API key from Google AI Studio
- Ensure no extra spaces in `.env` file
- Make sure you're using the correct key format

### "Rate limit exceeded"
- Google Gemini has rate limits (60 requests/min on free tier)
- Wait a few minutes and try again
- Check your usage in Google AI Studio dashboard

### "No insights generated"
- Check backend console for errors
- Verify API key is set correctly
- System will use fallback insights if API fails
- Check if the model name is correct

### "API Error"
- Verify your Google Cloud project is active
- Check if Gemini API is enabled in your project
- Ensure billing is set up (even for free tier, sometimes required)

## Benefits of Google Gemini

✅ **Free Tier Available** - No credit card required initially
✅ **Generous Limits** - 60 requests per minute
✅ **High Quality** - Excellent for analysis and insights
✅ **Easy Setup** - Simple API key from Google AI Studio
✅ **Cost Effective** - Very affordable pricing

## Next Steps

1. Get your API key from Google AI Studio
2. Add it to `.env` file
3. Restart backend server
4. Test the analytics report page
5. Enjoy AI-powered insights!
