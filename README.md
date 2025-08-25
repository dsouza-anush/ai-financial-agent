# AI Financial Agent 🤖

✅ **CURRENT STATUS: WORKING - See STATUS.md for details**

This is a proof of concept AI financial agent adapted for Heroku deployment with Claude 4 Sonnet. The goal is to explore AI for investment research. This project is for **educational** purposes only.

<img width="1709" alt="Screenshot 2025-01-06 at 5 53 59 PM" src="https://github.com/user-attachments/assets/7ef1729b-f2e1-477c-99e2-1184c1bfa1cd" />

## Disclaimer

This project is for **educational and research purposes only**.

- Not intended for real trading or investment
- No warranties or guarantees provided
- Past performance does not indicate future results
- Creator assumes no liability for financial losses
- Consult a financial advisor for investment decisions

By using this software, you agree to use it solely for learning purposes.

## 📋 Current State

**The application is working!** Before making changes:

1. **Read [`STATUS.md`](./STATUS.md)** - Current working state and known issues
2. **Follow [`DEBUGGING_GUIDE.md`](./DEBUGGING_GUIDE.md)** - Testing and development guide
3. **Live Demo:** https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/

## Table of Contents 📖
- [Features](#features)
- [Setup](#setup)
- [Architecture](#architecture)
- [Heroku Deployment](#heroku-deployment)

## Features

### ✅ What's Working
- **Chat interface** with Claude 4 Sonnet AI
- **Financial data tools** - stock prices, company financials, news
- **Real-time data** from Financial Datasets API
- **Streaming responses** in chat interface
- **Authentication** system (temporarily bypassed for testing)
- **Database** storage for chat history

### ⚠️ Known Limitations
- **API Limits** - Some tickers (e.g., CRM/Salesforce) hit payment limits on Financial Datasets API
- **Authentication** - Currently bypassed for easier testing
- **Free Tier** - Limited to basic financial queries

## Architecture

### 🔧 Technical Stack
- **AI Model:** Claude 4 Sonnet via Heroku Inference API
- **Framework:** Next.js 15.0.3-canary.2
- **Database:** PostgreSQL with Drizzle ORM
- **Deployment:** Heroku
- **Financial Data:** Financial Datasets API
- **AI SDK:** AI SDK v4.0.20 with heroku-ai-provider integration

### 🏗️ Key Components
- `app/(chat)/api/chat/route.ts` - Main chat API with streaming
- `lib/ai/tools/financial-tools.ts` - Financial data integration
- `components/chat.tsx` - Frontend chat interface
- `heroku-ai-provider` - Tool calling compatibility layer

## Setup

```bash
git clone https://github.com/virattt/ai-financial-agent.git
cd ai-financial-agent
```

> If you do not have npm installed, please install it from [here](https://nodejs.org/en/download/).

1. Install pnpm (if not already installed):
```bash
npm install -g pnpm
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up your environment variables:
```bash
# Create .env file for your API keys
cp .env.example .env
```

Set the API keys in the .env.local file (for Heroku deployment):
```bash
# Heroku Inference API (replaces OpenAI)
INFERENCE_KEY=your-heroku-inference-key

# Financial Datasets API
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# Authentication
AUTH_SECRET=your-auth-secret
AUTH_TRUST_HOST=true

# Database (Heroku PostgreSQL)
DATABASE_URL=your-postgres-url

# Development only
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Important**: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

## Development

### 🚀 Running Locally

```bash
npm run dev
# Visit http://localhost:3000
# Try asking "What is the current price of Apple?"
# Expected: Working AI response with real financial data
```

### 📊 Example Queries That Work
- "What is the current price of Apple?" (AAPL)
- "Show me Tesla's financial metrics" (TSLA)
- "Get news for Google" (GOOGL)
- "Compare the balance sheets of Microsoft" (MSFT)

### 🔧 Development Tips
- Financial tools cache duplicate calls to avoid API rate limits
- Some tickers may fail due to API payment requirements
- Check STATUS.md for current API limitations and workarounds

## Heroku Deployment

**Current Deployment:** https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/

### Heroku Setup
```bash
# Connect to existing Heroku app
heroku git:remote -a ai-financial-agent-demo

# Check environment variables
heroku config

# Deploy changes  
git push heroku main

# View logs
heroku logs --tail
```

### Environment Variables Set
- `INFERENCE_KEY`: Heroku Inference API key
- `FINANCIAL_DATASETS_API_KEY`: Financial data access
- `DATABASE_URL`: PostgreSQL connection
- `AUTH_SECRET`: NextAuth.js secret

**Note:** App deploys and works properly for end users.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting  
npm run typecheck    # Run TypeScript checks
npm run db:studio    # Database management
```

## For Developers

**Status:** Application is working with streaming chat and financial tools.

### Recent Fixes Applied
1. ✅ Fixed streaming response hang with heroku-ai-provider integration
2. ✅ Resolved tool calling compatibility issues
3. ✅ Implemented proper frontend streaming display
4. ✅ Added comprehensive error handling
5. ✅ Cleaned up security issues with hardcoded keys

### Next Steps
- Consider integrating alternative free APIs (Alpha Vantage, Yahoo Finance)
- Re-enable authentication for production use
- Add more robust error handling for API failures

For detailed technical information, see [`STATUS.md`](./STATUS.md) and [`HEROKU_VS_OPENAI_API_ANALYSIS.md`](./HEROKU_VS_OPENAI_API_ANALYSIS.md).


