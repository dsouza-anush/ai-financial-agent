# Heroku AI Provider Integration

## Overview

This application uses the [`heroku-ai-provider`](https://github.com/julianduque/heroku-ai-provider) package to bridge the gap between **Heroku Inference API** and **Vercel AI SDK**. This integration is essential for enabling tool calling (function calling) with Claude 4 Sonnet on Heroku.

## Why This Package is Critical

### The Problem
The Vercel AI SDK was designed primarily for OpenAI's API format, but Heroku Inference API has some differences in:
- Request/response formats
- Tool calling structure
- Streaming implementation
- Error handling

### The Solution
The `heroku-ai-provider` package acts as a compatibility layer that:
- **Translates AI SDK tool calls** to Heroku API format
- **Handles streaming responses** properly with Heroku endpoints
- **Manages tool execution** and response parsing
- **Provides type safety** for Claude model integration

## Integration Implementation

### Installation
```bash
npm install heroku-ai-provider
```

### Core Integration
```typescript
// app/(chat)/api/chat/route.ts
import { createHerokuProvider } from 'heroku-ai-provider';

const heroku = createHerokuProvider({
  chatApiKey: herokuInferenceApiKey,
  chatBaseUrl: 'https://us.inference.heroku.com/v1/chat/completions'
});

const result = streamText({
  model: heroku.chat(model.apiIdentifier), // Claude 4 Sonnet
  system: systemPrompt,
  messages: coreMessages,
  tools: financialToolsManager.getTools(), // Financial analysis tools
  maxSteps: 10,
});
```

## What This Enables

### 1. Tool Calling with Claude
Without this package, Claude on Heroku cannot use tools/functions. With it:
- **Financial data queries** work seamlessly
- **Technical analysis** (RSI, MACD) integrates properly
- **Multi-step reasoning** chains multiple tool calls

### 2. Streaming Compatibility
- **Real-time responses** appear as Claude thinks
- **Tool execution feedback** shows in the UI
- **Error recovery** handles API timeouts gracefully

### 3. AI SDK Benefits
- **useChat hook** works out of the box
- **Streaming UI components** render properly
- **Type safety** throughout the application

## Technical Details

### Request Flow
```
User Query → AI SDK → heroku-ai-provider → Heroku Inference API → Claude 4 Sonnet
                ↓
Financial Tools ← AI SDK ← heroku-ai-provider ← Tool Call Response ← Claude
```

### Key Features Used
- **Provider abstraction**: `heroku.chat(model)`
- **Tool integration**: Passes tools to Heroku API correctly
- **Response streaming**: `result.toDataStreamResponse()`
- **Error handling**: Graceful API failure management

## Configuration

### Environment Variables
```bash
INFERENCE_KEY=your-heroku-inference-api-key
```

### Provider Setup
```typescript
const heroku = createHerokuProvider({
  chatApiKey: process.env.INFERENCE_KEY,
  chatBaseUrl: 'https://us.inference.heroku.com/v1/chat/completions'
});
```

## Benefits for This Application

### 1. Cost Efficiency
- **Heroku Inference API** is more cost-effective than OpenAI direct
- **Free tier available** for testing and development
- **No vendor lock-in** - can switch providers easily

### 2. Performance
- **Optimized for Heroku** infrastructure
- **Reduced latency** for Heroku-deployed apps
- **Better reliability** with proper error handling

### 3. Developer Experience
- **Familiar AI SDK patterns** work unchanged
- **Tool calling** works exactly like OpenAI
- **Streaming responses** render properly in UI

## Alternative Without This Package

Without `heroku-ai-provider`, you would need to:
1. **Manual API calls** to Heroku Inference API
2. **Custom tool parsing** and execution logic
3. **Manual streaming** implementation
4. **Response format conversion** between APIs
5. **Error handling** for Heroku-specific issues

This would require **hundreds of lines** of custom integration code.

## Credit

This integration is made possible by [Julian Duque's](https://github.com/julianduque) `heroku-ai-provider` package, which bridges the compatibility gap between Heroku Inference API and the Vercel AI SDK ecosystem.

## Related Files

- `app/(chat)/api/chat/route.ts` - Main integration point
- `lib/ai/tools/financial-tools.ts` - Tools that work through this provider
- `package.json` - Package dependency
- `components/chat.tsx` - Frontend that benefits from streaming