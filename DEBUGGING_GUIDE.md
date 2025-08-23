# Debugging Guide - AI Financial Agent

## 🔍 **How to Actually Test This Application**

The previous developer made multiple claims that the app was "fixed" but failed to provide working curl tests. Here's how to properly debug this.

---

## **Step 1: Verify Local Environment**

### **Setup**
```bash
# Clone and install
git clone <repo-url>
cd ai-financial-agent
npm install

# Setup environment (create .env.local)
INFERENCE_KEY=your_heroku_inference_api_key_here
FINANCIAL_DATASETS_API_KEY=your_financial_datasets_api_key_here
AUTH_SECRET=local-test-secret-for-development-only
DATABASE_URL=postgres://[heroku-postgres-url]
AUTH_TRUST_HOST=true
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### **Start Local Server**
```bash
npm run dev
# Should start on http://localhost:3000
```

### **Test Basic Functionality**
1. Open browser to `http://localhost:3000`
2. Ask: "What is the current price of Apple?"
3. **Expected:** Should NOT get stuck on "Processing your request"
4. **Current Reality:** Likely gets stuck (needs fixing)

---

## **Step 2: Isolate the Problem**

### **Test AI Integration Directly**
Create `test-ai.js`:
```javascript
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const provider = createOpenAI({
  apiKey: 'your_heroku_inference_api_key_here',
  baseURL: 'https://us.inference.heroku.com/v1',
  compatibility: 'strict'
});

const result = await generateText({
  model: provider.chat('claude-4-sonnet'),
  prompt: 'Say "AI TEST SUCCESS"'
});

console.log(result.text);
```

```bash
node --import tsx/esm test-ai.js
# Should output: "AI TEST SUCCESS"
```

### **Test Financial API Directly**
```bash
curl -X GET "https://api.financialdatasets.ai/prices/snapshot/?ticker=AAPL" \
  -H "X-API-KEY: your_financial_datasets_api_key_here"

# Should return JSON with AAPL price data
```

---

## **Step 3: Debug the Chat Route**

### **Simplify Chat Route for Testing**
Edit `app/(chat)/api/chat/route.ts`:

```typescript
// Temporarily replace the entire streamText call with this minimal version:
const result = streamText({
  model: customModel(model.apiIdentifier, modelApiKey, herokuInferenceApiKey),
  system: "You are a helpful assistant. Just respond with 'TEST SUCCESS' and nothing else.",
  messages: coreMessages,
  maxTokens: 10,
  // Remove: tools, maxSteps, complex onChunk logic
});
```

### **Add Debug Logging**
```typescript
// Add this at the start of the POST function:
console.log('🔍 Chat API called with:', { modelId, messagesCount: messages.length });

// Add this before streamText:
console.log('🔍 About to call streamText with model');

// Add this in onFinish:
console.log('🔍 streamText finished:', response.messages.length, 'messages');
```

---

## **Step 4: Test Without Authentication**

### **Create Test Endpoint**
Create `app/api/test-chat/route.ts`:
```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { message } = await request.json();
  
  const provider = createOpenAI({
    apiKey: process.env.INFERENCE_KEY!,
    baseURL: 'https://us.inference.heroku.com/v1',
    compatibility: 'strict'
  });

  const result = streamText({
    model: provider.chat('claude-4-sonnet'),
    system: "Respond with exactly: TEST SUCCESS",
    messages: [{ role: 'user', content: message }],
    maxTokens: 10
  });

  return result.toDataStreamResponse();
}
```

### **Test This Endpoint**
```bash
curl -X POST http://localhost:3000/api/test-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}' \
  --no-buffer

# Should stream back "TEST SUCCESS" 
# If this fails, the core streaming is broken
# If this works, the issue is in the main chat route
```

---

## **Step 5: Monitor Production Logs**

### **Watch Heroku Logs**
```bash
heroku logs --tail --app ai-financial-agent-demo

# In another terminal, trigger a request through the browser
# Look for errors, timeouts, or hanging requests
```

### **Check for Common Issues**
- Database connection timeouts
- AI API timeouts  
- Memory issues
- Authentication failures

---

## **Step 6: Working Curl Test (The Goal)**

Once fixed, you should be able to do this:

```bash
# Get auth cookies
curl -c cookies.txt -b cookies.txt \
  https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/

# Make authenticated request  
curl -b cookies.txt -X POST \
  https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "messages": [{"role": "user", "content": "What is the current price of Apple?"}],
    "modelId": "claude-4-sonnet"
  }' \
  --no-buffer

# Expected: Should stream back actual stock data, not hang or return "Unauthorized"
```

---

## **Common Issues to Check**

### **1. Streaming Response Format**
- `result.toDataStreamResponse()` vs `result.toTextStreamResponse()`
- Data stream writing format
- Frontend expecting different stream format

### **2. Tool Execution Hanging**
- Financial tools might be timing out
- API rate limits
- Malformed tool responses

### **3. Authentication State**
- Session not being created properly
- User ID resolution issues
- Database user creation failing

### **4. Memory/Performance**
- Large responses timing out
- Heroku dyno running out of memory
- Database connection pool exhaustion

---

## **Success Criteria**

✅ **Local browser test:** User can ask about stock prices and get responses  
✅ **Production browser test:** Same functionality works on Heroku  
✅ **Curl test:** Can make API calls and get streaming responses  
✅ **End-to-end flow:** From user question to financial data display  

**Don't claim it's "fixed" until ALL of these work.**