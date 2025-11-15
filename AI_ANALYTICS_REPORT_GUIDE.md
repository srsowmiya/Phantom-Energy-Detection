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
npm install openai
```

**Frontend:**
Already has recharts installed ✅

### Step 2: Configure OpenAI API Key

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Create/update `Backend/.env` file:
   ```env
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
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
3. **LLM Prompt**: Sends data to OpenAI with expert prompt
4. **AI Analysis**: OpenAI generates humanized insights
5. **Display**: Frontend shows insights in a readable format

## Fallback Mode

If OpenAI API key is not configured:
- System uses built-in fallback insights generator
- Still provides useful analysis
- No API costs
- All charts still work

## Customization

### Change LLM Model

In `Backend/.env`:
```env
OPENAI_MODEL=gpt-4  # For better quality (more expensive)
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
- Check if `OPENAI_API_KEY` is set in `.env`
- Verify API key is valid
- Check backend console for errors
- System will use fallback if API fails

### Charts Not Loading
- Verify analytics data exists
- Check date range selection
- Ensure ports and devices are configured

### API Errors
- Check OpenAI API key validity
- Verify account has credits
- Check rate limits
- Review backend console logs

## Cost Estimation

- **GPT-3.5-turbo**: ~$0.001 per insight generation
- **GPT-4**: ~$0.01 per insight generation
- Very affordable for regular use

## Next Steps

1. Configure OpenAI API key
2. Test the analytics report page
3. Customize AI prompt if needed
4. Monitor API usage and costs
5. Adjust model based on quality needs

