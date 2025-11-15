# LLM API Setup Guide

## Overview

The Analytics Report feature uses OpenAI's API to generate humanized insights about your energy consumption data. This guide explains how to set it up.

## Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the API key (you'll only see it once!)

## Step 2: Install OpenAI Package

```bash
cd Backend
npm install openai
```

## Step 3: Configure Environment Variables

Create or update `.env` file in the `Backend` folder:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

**Note:** 
- Replace `your_openai_api_key_here` with your actual API key
- `gpt-3.5-turbo` is the default model (cost-effective)
- You can use `gpt-4` for better quality (more expensive)

## Step 4: Restart Backend Server

After adding the API key, restart your backend:

```bash
npm start
```

## How It Works

1. **User visits Analytics Report page** (`/analytics-report`)
2. **Frontend requests insights** from `/api/analytics/insights`
3. **Backend collects analytics data** (phantom events, power consumption, etc.)
4. **Backend sends data to OpenAI** with a prompt asking for analysis
5. **OpenAI generates humanized insights** with recommendations
6. **Backend returns insights** to frontend
7. **Frontend displays** charts and AI insights

## Fallback Mode

If OpenAI API key is not configured:
- The system will use a **fallback insights generator**
- Provides basic analysis without AI
- Still shows all charts and data
- No API costs

## Cost Considerations

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **GPT-4**: ~$0.03 per 1K tokens (higher quality, more expensive)
- Each insight generation uses ~500 tokens
- Estimated cost: $0.001 per insight generation

## Alternative LLM Providers

To use a different LLM provider (e.g., Anthropic Claude, Google Gemini):

1. Install the provider's SDK
2. Update `Backend/src/controllers/insightsController.js`
3. Replace OpenAI initialization with your provider
4. Update the API call format

## Security Notes

- **Never commit** `.env` file to git
- Keep your API key **secret**
- Use environment variables for all sensitive data
- Consider using API key rotation

## Troubleshooting

### "OpenAI package not installed"
```bash
cd Backend
npm install openai
```

### "Invalid API Key"
- Check if API key is correct in `.env` file
- Verify API key hasn't expired
- Ensure no extra spaces in `.env` file

### "Rate limit exceeded"
- OpenAI has rate limits on free tier
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan

### "No insights generated"
- Check backend console for errors
- Verify API key is set correctly
- System will use fallback insights if API fails

