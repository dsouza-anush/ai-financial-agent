# AI Financial Agent 🤖

🚨 **CURRENT STATUS: BROKEN - See CURRENT_STATUS.md**

This is a proof of concept AI financial agent adapted for Heroku deployment with Claude 4 Sonnet. The goal is to explore AI for investment research. This project is for **educational** purposes only.

⚠️ **Important:** The application is currently not working for end users - chat responses hang on "Processing your request".

<img width="1709" alt="Screenshot 2025-01-06 at 5 53 59 PM" src="https://github.com/user-attachments/assets/7ef1729b-f2e1-477c-99e2-1184c1bfa1cd" />

## Disclaimer

This project is for **educational and research purposes only**.

- Not intended for real trading or investment
- No warranties or guarantees provided
- Past performance does not indicate future results
- Creator assumes no liability for financial losses
- Consult a financial advisor for investment decisions

By using this software, you agree to use it solely for learning purposes.

## 🚨 Read Before Working on This

**The application is currently broken.** Before making any changes:

1. **Read [`CURRENT_STATUS.md`](./CURRENT_STATUS.md)** - Detailed analysis of what's broken
2. **Follow [`DEBUGGING_GUIDE.md`](./DEBUGGING_GUIDE.md)** - How to properly test and fix
3. **Current Deployment:** https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/ (appears to work but doesn't)

## Table of Contents 📖
- [Current Issues](#current-issues)
- [Setup](#setup)
- [Known Problems](#known-problems)
- [Heroku Deployment](#heroku-deployment)

## Current Issues

### ❌ What's Broken
- **Streaming responses hang** on "Processing your request"
- **End-to-end user flow fails** - users cannot get AI responses
- **API testing fails** - cannot successfully test chat endpoints

### ✅ What Works
- Application deploys successfully to Heroku
- UI loads properly with clean interface
- Individual APIs work (AI, Financial Data, Database)
- Authentication system functional

### 🔧 Technical Stack
- **AI Model:** Claude 4 Sonnet via Heroku Inference API
- **Framework:** Next.js 15.0.3-canary.2
- **Database:** PostgreSQL with Drizzle ORM
- **Deployment:** Heroku
- **Financial Data:** Financial Datasets API

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

## Known Problems

⚠️ **Before running locally, understand that this application currently doesn't work.**

```bash
npm run dev
# Visit http://localhost:3000
# Try asking "What is the current price of Apple?"
# Expected: Gets stuck on "Processing your request" (broken)
```

### Issue Root Cause
The streaming response mechanism in `/api/chat/route.ts` is not working properly. Individual components work:
- ✅ Heroku Inference API responds correctly
- ✅ Financial Datasets API returns real data  
- ✅ Database connections work
- ❌ **Streaming integration fails in the web application**

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

**Note:** App deploys successfully but user experience is broken.

## Development Commands

```bash
npm run dev          # Start development (currently broken)
npm run build        # Build for production
npm run lint         # Run linting  
npm run db:studio    # Database management
```

## For Next Developer

**Critical:** Don't assume previous "fixes" worked. The application:
1. ✅ Deploys without errors
2. ✅ Loads the UI properly  
3. ❌ **Doesn't work for actual users**

Read the documentation files created to understand the full scope of the problem before attempting fixes.


