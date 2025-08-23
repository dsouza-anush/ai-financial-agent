import { NextResponse } from 'next/server';

export async function GET() {
  // Return available API keys from environment variables
  // This allows the client to know which keys are already configured on the server
  return NextResponse.json({
    hasInferenceKey: !!process.env.INFERENCE_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasFinancialKey: !!process.env.FINANCIAL_DATASETS_API_KEY,
    // Don't send the actual keys for security
    inferenceKey: process.env.INFERENCE_KEY ? '***configured***' : null,
    openaiKey: process.env.OPENAI_API_KEY ? '***configured***' : null,
    financialKey: process.env.FINANCIAL_DATASETS_API_KEY ? '***configured***' : null,
  });
}