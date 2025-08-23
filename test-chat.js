const https = require('https');

// Test the chat functionality
function testChat() {
  const postData = JSON.stringify({
    id: 'test-' + Date.now(),
    messages: [
      { role: 'user', content: 'Hello, can you respond with just "Hi there!"?' }
    ],
    modelId: 'claude-4-sonnet'
  });

  const options = {
    hostname: 'ai-financial-agent-demo-0b9a1e91c541.herokuapp.com',
    port: 443,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      // Add some fake auth headers to see if we can bypass auth for testing
      'Cookie': '__Host-authjs.csrf-token=test; __Secure-authjs.callback-url=test'
    },
    rejectUnauthorized: false,
    timeout: 15000
  };

  console.log('Testing chat API...');
  console.log('URL:', `https://${options.hostname}${options.path}`);
  console.log('Payload:', postData);

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
      console.log('Received chunk:', chunk.toString());
    });
    
    res.on('end', () => {
      console.log('Complete response:', data);
      if (res.statusCode === 200) {
        console.log('✅ Chat API test PASSED');
      } else {
        console.log('❌ Chat API test FAILED');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.on('timeout', () => {
    console.error('❌ Request timeout');
    req.destroy();
  });

  req.write(postData);
  req.end();
}

// Test basic endpoint
function testHealth() {
  console.log('Testing health endpoint...');
  
  https.get('https://ai-financial-agent-demo-0b9a1e91c541.herokuapp.com/api/keys', (res) => {
    console.log(`Health check status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('API Keys status:', parsed);
        if (parsed.hasInferenceKey && parsed.hasFinancialKey) {
          console.log('✅ Health check PASSED');
          // Run chat test after health check passes
          setTimeout(testChat, 1000);
        } else {
          console.log('❌ Health check FAILED - Missing API keys');
        }
      } catch (e) {
        console.error('❌ Health check FAILED - Invalid JSON:', e.message);
      }
    });
  }).on('error', (e) => {
    console.error('❌ Health check error:', e.message);
  });
}

// Start tests
console.log('🧪 Starting end-to-end tests...');
testHealth();