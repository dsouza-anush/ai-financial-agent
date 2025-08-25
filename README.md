# Heroku AI Finance

AI-powered financial analysis assistant using **Claude 4 Sonnet** and **Heroku Inference API**. Get real-time stock data, technical analysis, and intelligent investment insights.

**[🚀 Live Demo](https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/)**

<img width="1200" alt="Heroku AI Finance Demo" src="https://github.com/user-attachments/assets/7ef1729b-f2e1-477c-99e2-1184c1bfa1cd" />

## Quick Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**Requirements:**
- Heroku account (paid plan required)
- [Heroku Inference API key](https://devcenter.heroku.com/articles/heroku-inference-api)
- [Financial Datasets API key](https://financialdatasets.ai/)
- Optional: [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) for technical indicators

## Features

- **Real-time stock data** - prices, financials, news
- **Technical analysis** - RSI, MACD, moving averages
- **AI-powered insights** with Claude 4 Sonnet
- **Streaming chat interface**
- **8 financial tools** for comprehensive analysis

## Local Development

```bash
git clone https://github.com/dsouza-anush/ai-financial-agent.git
cd ai-financial-agent
npm install
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```bash
INFERENCE_KEY=your-heroku-inference-key
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
AUTH_SECRET=your-auth-secret
DATABASE_URL=your-postgres-url
```

Start development server:
```bash
npm run dev
```

## Example Queries

- "What's Apple's current stock price and RSI?"
- "Compare Tesla and Microsoft financials"
- "Find stocks with revenue over $50 billion"
- "Is Amazon overbought or oversold?"

## Tech Stack

- **AI**: Claude 4 Sonnet via Heroku Inference API
- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: Financial Datasets + Alpha Vantage
- **Deployment**: Heroku

## Architecture

The application uses [heroku-ai-provider](https://github.com/julianduque/heroku-ai-provider) to bridge Vercel AI SDK with Heroku Inference API, enabling tool calling with Claude 4 Sonnet.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system diagrams and [HEROKU_AI_PROVIDER.md](./HEROKU_AI_PROVIDER.md) for integration details.

## Available Tools

1. **getStockPrices** - Current and historical prices
2. **getFinancialMetrics** - P/E ratios, debt metrics, ROE
3. **getIncomeStatements** - Revenue, profit analysis
4. **getBalanceSheets** - Assets, liabilities breakdown
5. **getCashFlowStatements** - Cash flow analysis
6. **searchStocksByFilters** - Screen stocks by criteria
7. **getNews** - Company news and events
8. **getTechnicalIndicators** - RSI, MACD, SMA, EMA

## Disclaimer

This project is for **educational purposes only**. Not intended for real trading decisions. Consult a financial advisor for investment advice.

## License

MIT License - see [LICENSE](./LICENSE) for details.