// Prompt-based tool calling implementation for Heroku API compatibility
import { FinancialToolsManager } from '@/lib/ai/tools/financial-tools';

export interface PromptToolCall {
  toolName: string;
  arguments: Record<string, any>;
  fullMatch: string;
}

export class PromptBasedTools {
  private financialToolsManager: FinancialToolsManager;

  constructor(config: { financialDatasetsApiKey: string; dataStream: any }) {
    this.financialToolsManager = new FinancialToolsManager(config);
  }

  // Enhanced system prompt with structured tool calling instructions
  getEnhancedSystemPrompt(basePrompt: string): string {
    return `${basePrompt}

IMPORTANT: You have access to real-time financial data tools. When users ask about financial information, use this exact format:

🔧 CALL_TOOL:getStockPrices:{"ticker":"AAPL"}
🔧 CALL_TOOL:getNews:{"ticker":"AAPL","limit":5}
🔧 CALL_TOOL:getIncomeStatements:{"ticker":"AAPL","period":"ttm","limit":5}
🔧 CALL_TOOL:getBalanceSheets:{"ticker":"AAPL","period":"ttm","limit":5}
🔧 CALL_TOOL:getCashFlowStatements:{"ticker":"AAPL","period":"ttm","limit":5}
🔧 CALL_TOOL:getFinancialMetrics:{"ticker":"AAPL","period":"ttm","limit":5}
🔧 CALL_TOOL:searchStocksByFilters:{"filters":[{"field":"revenue","operator":"gt","value":50000000000}],"limit":10}

RULES:
1. Use the exact format above with 🔧 CALL_TOOL: prefix
2. Provide valid JSON arguments
3. Always explain what tool you're calling and why
4. After calling a tool, I will provide real data and you should incorporate it into your response
5. Use real ticker symbols (AAPL, MSFT, TSLA, AMZN, GOOGL, etc.)

Example usage:
User: "What's Apple's stock price?"
You: "I'll get the current stock price for Apple.

🔧 CALL_TOOL:getStockPrices:{"ticker":"AAPL"}

Let me fetch the latest price data and market information for you..."`;
  }

  // Parse tool calls from AI response
  parseToolCalls(responseText: string): PromptToolCall[] {
    const toolCallPattern = /🔧 CALL_TOOL:(\w+):\{([^}]+)\}/g;
    const toolCalls: PromptToolCall[] = [];
    let match;

    while ((match = toolCallPattern.exec(responseText)) !== null) {
      const [fullMatch, toolName, argsJson] = match;
      
      try {
        const parsedArgs = JSON.parse(`{${argsJson}}`);
        toolCalls.push({
          toolName,
          arguments: parsedArgs,
          fullMatch
        });
      } catch (error) {
        console.error('Failed to parse tool arguments:', argsJson, error);
        // Continue parsing other tool calls
      }
    }

    return toolCalls;
  }

  // Execute a single tool call
  async executeToolCall(toolCall: PromptToolCall): Promise<any> {
    const { toolName, arguments: args } = toolCall;
    
    try {
      const tools = this.financialToolsManager.getTools();
      
      switch (toolName) {
        case 'getStockPrices':
          return await tools.getStockPrices.execute(args as any);
          
        case 'getNews':
          return await tools.getNews.execute(args as any);
          
        case 'getIncomeStatements':
          return await tools.getIncomeStatements.execute(args as any);
          
        case 'getBalanceSheets':
          return await tools.getBalanceSheets.execute(args as any);
          
        case 'getCashFlowStatements':
          return await tools.getCashFlowStatements.execute(args as any);
          
        case 'getFinancialMetrics':
          return await tools.getFinancialMetrics.execute(args as any);
          
        case 'searchStocksByFilters':
          return await tools.searchStocksByFilters.execute(args as any);
          
        default:
          console.error(`Unknown tool: ${toolName}`);
          return { error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return { error: `Failed to execute ${toolName}: ${(error as Error).message}` };
    }
  }

  // Execute all tool calls and return enhanced response
  async processToolCalls(
    originalResponse: string,
    toolCalls: PromptToolCall[],
    generateTextFn: (params: any) => Promise<{ text: string }>
  ): Promise<string> {
    if (toolCalls.length === 0) {
      return originalResponse;
    }

    console.log(`🔧 Processing ${toolCalls.length} tool calls...`);

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await this.executeToolCall(toolCall);
        return {
          toolName: toolCall.toolName,
          arguments: toolCall.arguments,
          result
        };
      })
    );

    // Create enhanced prompt with tool results
    const toolResultsText = toolResults
      .map(({ toolName, arguments: args, result }) => 
        `Tool: ${toolName}(${JSON.stringify(args)})
Result: ${JSON.stringify(result, null, 2)}`
      )
      .join('\n\n');

    console.log('🔧 Tool results obtained, generating enhanced response...');

    // Generate final response incorporating tool results
    const enhancedResponse = await generateTextFn({
      system: `You are a financial assistant. The user asked a question and you called some tools. Here are the real results from those tools:

${toolResultsText}

Now provide a comprehensive response incorporating this real financial data. Be specific with numbers, dates, and analysis. Don't mention the tool calls - just provide the information naturally.`,
      messages: [
        { role: 'user', content: 'Please provide a comprehensive financial analysis using the real data from the tools you just called.' }
      ]
    });

    return enhancedResponse.text;
  }

  // Main entry point - process a response and execute any tool calls
  async enhanceResponse(
    originalResponse: string,
    generateTextFn: (params: any) => Promise<{ text: string }>
  ): Promise<string> {
    const toolCalls = this.parseToolCalls(originalResponse);
    
    if (toolCalls.length > 0) {
      console.log(`🔧 Found ${toolCalls.length} tool calls in response`);
      return await this.processToolCalls(originalResponse, toolCalls, generateTextFn);
    }

    return originalResponse;
  }
}