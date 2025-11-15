# AI-Powered Analytics Report - Complete Guide

## Overview

A comprehensive analytical report page with bar charts, pie charts, line charts, and AI-generated humanized insights about your energy consumption data.

## Features

### 1. **Visual Charts**
- **Bar Chart**: Phantom events over time
- **Line Chart**: Daily power consumption trends
- **Pie Chart**: Power consumption distribution by port
- **Bar Chart**: Savings breakdown by port

### 2. **AI-Powered Insights**
- Humanized feedback about energy consumption
- Specific recommendations for energy savings
- Pattern identification and trend analysis
- Actionable advice in conversational tone

### 3. **User-Specific Data**
- All analytics are filtered by logged-in user
- Shows only data for user1 (or current user)
- Secure and private data access

## Setup Instructions

### Step 1: Install Dependencies

**Backend:**
```bash
cd Backend
npm install @google/generative-ai
```

**Frontend:**
Already has recharts installed ✅

### Step 2: Configure Google Gemini API Key

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create/update `Backend/.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-pro
   ```
3. Restart backend server

### Step 3: Access the Report

1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login to the application
4. Navigate to **"AI Report"** in the sidebar
5. View charts and AI insights!

## Page Structure

### Route: `/analytics-report`

**Components:**
- Summary cards (Phantom Events, Money Saved, Units Saved, Avg Power)
- AI Insights section (with refresh button)
- Bar Chart - Phantom Events Over Time
- Line Chart - Daily Power Consumption
- Pie Chart - Power Consumption by Port
- Bar Chart - Savings by Port

## API Endpoints

### `POST /api/analytics/insights`

**Request:**
```json
{
  "days": 30,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "summary": {
        "totalPhantomEvents": 15,
        "totalSavedMoney": 45.50,
        "totalSavedUnits": 4.55,
        "avgPower": 120.5
      },
      "portBreakdown": [...],
      "topPhantomPorts": [...]
    },
    "insights": "AI-generated humanized feedback...",
    "hasLLM": true
  }
}
```

## How AI Insights Work

1. **Data Collection**: Backend gathers analytics data for the user
2. **Data Summary**: Creates a structured summary of key metrics
3. **LLM Prompt**: Sends data to Google Gemini with expert prompt
4. **AI Analysis**: Gemini generates humanized insights
5. **Display**: Frontend shows insights in a readable format

## Fallback Mode

If Gemini API key is not configured:
- System uses built-in fallback insights generator
- Still provides useful analysis
- No API costs
- All charts still work

## Customization

### Change LLM Model

In `Backend/.env`:
```env
GEMINI_MODEL=gemini-1.5-pro  # For better quality (if available)
```

### Adjust Insight Length

In `Backend/src/controllers/insightsController.js`:
```javascript
max_tokens: 500  // Increase for longer insights
```

### Modify AI Prompt

Edit the prompt in `insightsController.js` to change the analysis style.

## Security

- ✅ User authentication required
- ✅ Data filtered by user ID
- ✅ API key stored in environment variables
- ✅ No sensitive data exposed

## Troubleshooting

### No AI Insights Showing
- Check if `GEMINI_API_KEY` is set in `.env`
- Verify API key is valid from Google AI Studio
- Check backend console for errors
- System will use fallback if API fails

### Charts Not Loading
- Verify analytics data exists
- Check date range selection
- Ensure ports and devices are configured

### API Errors
- Check Gemini API key validity from Google AI Studio
- Verify API is enabled in Google Cloud project
- Check rate limits (60 requests/min on free tier)
- Review backend console logs

## Cost Estimation

- **Gemini Pro**: Free tier available (60 requests/min)
- **No credit card required** for free tier
- Very affordable and accessible

## Next Steps

1. Get Gemini API key from Google AI Studio
2. Configure in `Backend/.env` file
3. Test the analytics report page
4. Customize AI prompt if needed
5. Monitor API usage (free tier available)

