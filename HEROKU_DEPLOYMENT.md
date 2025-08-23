# Heroku Deployment Guide

This guide will help you deploy the AI Financial Agent to Heroku.

## Prerequisites

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create a [Heroku account](https://signup.heroku.com/)
3. Get your API keys (optional - the app defaults to using Heroku's Inference API):
   - OpenAI API key from [OpenAI Platform](https://platform.openai.com/) (only needed if you want to use GPT models)
   - Financial Datasets API key from [Financial Datasets](https://financialdatasets.ai/) (optional)
   - LangSmith API key from [LangSmith](https://smith.langchain.com/) (optional)

## Quick Deploy

### Option 1: Deploy Button
Click the button below to deploy directly to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/virattt/ai-financial-agent)

### Option 2: Manual Deployment

1. **Clone and prepare the repository:**
   ```bash
   git clone https://github.com/virattt/ai-financial-agent.git
   cd ai-financial-agent
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create a Heroku app:**
   ```bash
   heroku create your-app-name
   ```

4. **Add the required addons:**
   ```bash
   # Add PostgreSQL database
   heroku addons:create heroku-postgresql:essential-0
   
   # Add Heroku Inference API for Claude 4 Sonnet
   heroku addons:create heroku-inference:claude-4-sonnet
   ```

5. **Set environment variables (optional):**
   ```bash
   # Required for authentication
   heroku config:set AUTH_SECRET=$(openssl rand -base64 32)
   
   # Optional - only if you want to use OpenAI models instead of Claude
   heroku config:set OPENAI_API_KEY=your-openai-api-key
   
   # Optional - for enhanced financial data access
   heroku config:set FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
   
   # Optional - for LangSmith tracing
   heroku config:set LANGCHAIN_API_KEY=your-langsmith-api-key
   heroku config:set LANGCHAIN_TRACING_V2=true
   heroku config:set LANGCHAIN_PROJECT=ai-financial-agent
   ```

6. **Deploy the app:**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

7. **Open your app:**
   ```bash
   heroku open
   ```

## Environment Variables

The following environment variables are required or optional:

### Required
- `AUTH_SECRET`: Random secret for authentication (auto-generated during deployment)
- `DATABASE_URL`: PostgreSQL database URL (auto-provided by Heroku Postgres addon)
- `HEROKU_INFERENCE_API_KEY`: Heroku Inference API key (auto-provided by heroku-inference addon)

### Optional
- `OPENAI_API_KEY`: Your OpenAI API key (only needed if you want to use GPT models)
- `FINANCIAL_DATASETS_API_KEY`: For enhanced financial data access
- `LANGCHAIN_API_KEY`: For LangSmith tracing
- `LANGCHAIN_TRACING_V2`: Enable LangSmith tracing (set to "true")
- `LANGCHAIN_PROJECT`: LangSmith project name

## Model Selection

The application now defaults to using **Claude 4 Sonnet** via Heroku's Inference API, which provides:
- High-quality AI responses
- Built-in Heroku integration
- No external API key management required

You can still use OpenAI models by providing an `OPENAI_API_KEY` environment variable.

## Troubleshooting

### Build Issues
If you encounter build issues, check the Heroku logs:
```bash
heroku logs --tail
```

### Database Issues
If you have database connection issues, verify the DATABASE_URL:
```bash
heroku config:get DATABASE_URL
```

### App Crashes
Check if all required environment variables are set:
```bash
heroku config
```

## Scaling

To scale your app for better performance:
```bash
# Scale to a hobby dyno (recommended for production)
heroku ps:scale web=1:hobby

# Or scale to a basic dyno
heroku ps:scale web=1:basic
```

## Custom Domain

To add a custom domain:
```bash
heroku domains:add yourdomain.com
```

Then configure your DNS to point to the Heroku app.