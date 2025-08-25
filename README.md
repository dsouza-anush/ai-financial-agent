# Heroku AI Finance

**Deploy-Ready Heroku Reference App**

A complete AI-powered financial analysis assistant built with **Claude 4 Sonnet** and **Heroku Inference API**. Features real-time stock data, technical analysis, and intelligent financial insights. Perfect reference implementation for deploying AI applications on Heroku.

**[Live Demo](https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/)**

<img width="1709" alt="Screenshot 2025-01-06 at 5 53 59 PM" src="https://github.com/user-attachments/assets/7ef1729b-f2e1-477c-99e2-1184c1bfa1cd" />

## Disclaimer

This project is for **educational and research purposes only**.

- Not intended for real trading or investment
- No warranties or guarantees provided
- Past performance does not indicate future results
- Creator assumes no liability for financial losses
- Consult a financial advisor for investment decisions

By using this software, you agree to use it solely for learning purposes.

## Quick Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**One-click deployment ready!** All you need:
1. **Heroku Account** (requires paid plan for deployment)
2. **Heroku Inference API Key** ([Get it here](https://devcenter.heroku.com/articles/heroku-inference-api))
3. **Financial Datasets API Key** ([Get it here](https://financialdatasets.ai/) - required for stock data)
4. **Optional**: Alpha Vantage API key for technical analysis ([Free tier: 25 calls/day](https://www.alphavantage.co/support/#api-key))

## Table of Contents
- [Quick Deploy](#quick-deploy-to-heroku)
- [Features](#features)  
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [AI Tools](#ai-tools-available)
- [Example Queries](#example-queries)
- [Technical Documentation](#technical-documentation)

## Features

### What's Working
- **Chat interface** with Claude 4 Sonnet AI
- **Financial data tools** - stock prices, company financials, news
- **Technical analysis** - RSI, MACD, SMA, EMA indicators via Alpha Vantage
- **Real-time data** from multiple financial APIs
- **Streaming responses** in chat interface
- **Authentication** system with NextAuth.js
- **Database** storage for chat history

### Known Limitations
- **API Costs** - Requires paid Financial Datasets API key for stock data
- **Rate Limiting** - Alpha Vantage free tier: 25 calls/day for technical indicators
- **Heroku Deployment** - Requires paid Heroku plan (no free tier available)

## Architecture

### Technical Stack
- **AI Model:** Claude 4 Sonnet via Heroku Inference API
- **Framework:** Next.js 15.0.3-canary.2
- **Database:** PostgreSQL with Drizzle ORM
- **Deployment:** Heroku
- **Financial Data:** Financial Datasets API + Alpha Vantage
- **AI SDK:** AI SDK v4.0.20 with heroku-ai-provider integration

### Key Components
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

## Environment Variables

Set these in your Heroku app or `.env.local` file:

```bash
# Required - Heroku Inference API
INFERENCE_KEY=your-heroku-inference-api-key

# Required - Financial data access  
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# Optional - Technical analysis (25 calls/day free)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# Required - Authentication
AUTH_SECRET=your-auth-secret

# Required - Database
DATABASE_URL=your-postgresql-connection-string
```

## Local Development

```bash
git clone https://github.com/your-repo/heroku-ai-finance.git
cd heroku-ai-finance
npm install
npm run dev
# Visit http://localhost:3000
```

## AI Tools Available

### Financial Data Tools
- **getStockPrices** - Current and historical stock prices
- **getIncomeStatements** - Company income statements
- **getBalanceSheets** - Company balance sheets  
- **getCashFlowStatements** - Cash flow statements
- **getFinancialMetrics** - P/E ratio, debt ratios, ROE
- **searchStocksByFilters** - Find stocks by financial criteria
- **getNews** - Recent company news and events

### Technical Analysis Tools (Alpha Vantage)
- **getTechnicalIndicators** - RSI, MACD, SMA, EMA indicators
- **Smart interpretation** - Overbought/oversold signals
- **Historical data** - 10-day indicator history

## Example Queries

### Basic Queries
- "What is the current price of Apple?"
- "Show me Tesla's financial metrics"
- "Get news for Google"
- "Compare the balance sheets of Microsoft and Apple"

### Technical Analysis
- "What's the RSI for Apple stock?"
- "Is Tesla overbought or oversold?"
- "Show me MACD indicators for Microsoft"
- "Get the 20-day moving average for Google"

### Advanced Analysis
- "Analyze Apple stock comprehensively"
- "Find stocks with revenue over 50 billion"
- "Compare the financial health of tech companies"

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

## Technical Documentation

### System Architecture
Comprehensive system architecture with component diagrams and data flow:
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture documentation with Mermaid diagrams

### Heroku Integration
Deep dive into the heroku-ai-provider integration:
- **[HEROKU_AI_PROVIDER.md](./HEROKU_AI_PROVIDER.md)** - Why heroku-ai-provider is critical for tool calling with Claude

### Additional Resources
- [`STATUS.md`](./STATUS.md) - Development status and fixes applied
- [`HEROKU_VS_OPENAI_API_ANALYSIS.md`](./HEROKU_VS_OPENAI_API_ANALYSIS.md) - API comparison analysis


