import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { validStockSearchFilters } from '@/lib/api/stock-filters';

export const financialTools = [
  'getStockPrices',
  'getIncomeStatements', 
  'getBalanceSheets',
  'getCashFlowStatements',
  'getFinancialMetrics',
  'searchStocksByFilters',
  'getNews',
] as const;

export type AllowedTools = typeof financialTools[number];

export interface FinancialToolsConfig {
  financialDatasetsApiKey: string;
  dataStream: any;
}

export class FinancialToolsManagerFixed {
  private toolCallCache = new Set<string>();
  private config: FinancialToolsConfig;

  constructor(config: FinancialToolsConfig) {
    this.config = config;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'X-API-KEY': this.config.financialDatasetsApiKey,
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private shouldExecuteToolCall(toolName: string, params: any): boolean {
    const key = JSON.stringify({ toolName, params });
    if (this.toolCallCache.has(key)) {
      return false;
    }
    this.toolCallCache.add(key);
    return true;
  }

  // Convert Zod schema to JSON Schema for Heroku Inference API compatibility
  private convertZodToJsonSchema(zodSchema: z.ZodType): any {
    const jsonSchema = zodToJsonSchema(zodSchema, { 
      name: undefined,
      $refStrategy: 'none',
      strictUnions: true
    });
    
    // Remove $schema property that Heroku API rejects
    const { $schema, ...cleanSchema } = jsonSchema;
    return cleanSchema;
  }

  public getTools() {
    // Define Zod schemas
    const newsSchema = z.object({
      ticker: z.string().describe('The ticker of the company to get news for'),
      limit: z.number().optional().default(5).describe('The number of news articles to return'),
    });

    const stockPricesSchema = z.object({
      ticker: z.string().describe('The ticker of the company to get historical prices for'),
      start_date: z.string().optional().describe('The start date for historical prices (YYYY-MM-DD)').default(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
      }),
      end_date: z.string().optional().describe('The end date for historical prices (YYYY-MM-DD)').default(() => {
        return new Date().toISOString().split('T')[0];
      }),
      interval: z.enum(['second', 'minute', 'day', 'week', 'month', 'year']).default('day').describe('The interval between price points'),
      interval_multiplier: z.number().default(1).describe('The multiplier for the interval'),
    });

    return {
      getNews: {
        description: 'Use this tool to get news and latest events for a company. This tool will return a list of news articles and events for a company. When using this tool, include dates in your output.',
        parameters: this.convertZodToJsonSchema(newsSchema),
        execute: async ({ ticker, limit = 5 }: { ticker: string; limit?: number }) => {
          try {
            const response = await this.fetchWithTimeout(`https://api.financialdatasets.ai/news/?ticker=${ticker}&limit=${limit}`);
            const data = await response.json();
            return data;
          } catch (error) {
            console.error('Error fetching news:', error);
            return { error: 'Failed to fetch news data' };
          }
        },
      },
      getStockPrices: {
        description: 'Use this tool to get stock prices and market cap for a company. This tool will return a snapshot of the current price, market cap, and the historical prices over a given time period.',
        parameters: this.convertZodToJsonSchema(stockPricesSchema),
        execute: async ({ ticker, start_date, end_date, interval = 'day', interval_multiplier = 1 }: {
          ticker: string;
          start_date?: string;
          end_date?: string;
          interval?: 'second' | 'minute' | 'day' | 'week' | 'month' | 'year';
          interval_multiplier?: number;
        }) => {
          if (!this.shouldExecuteToolCall('getStockPrices', { ticker, start_date, end_date, interval, interval_multiplier })) {
            console.log('Skipping duplicate getStockPrices call:', { ticker, start_date, end_date, interval, interval_multiplier });
            return null;
          }

          try {
            // First, get snapshot price
            const snapshotResponse = await this.fetchWithTimeout(`https://api.financialdatasets.ai/prices/snapshot/?ticker=${ticker}`);
            const snapshotData = await snapshotResponse.json();

            // Then, get historical prices
            const urlParams = new URLSearchParams({
              ticker: ticker,
              start_date: start_date || '',
              end_date: end_date || '',
              interval: interval || 'day',
              interval_multiplier: (interval_multiplier || 1).toString(),
            });
            
            const historicalPricesResponse = await this.fetchWithTimeout(`https://api.financialdatasets.ai/prices/?${urlParams}`);
            const historicalPricesData = await historicalPricesResponse.json();

            // Combine snapshot price with historical prices
            const combinedData = {
              ticker: ticker,
              snapshot: snapshotData,
              historical: historicalPricesData
            };
            return combinedData;
          } catch (error) {
            console.error('Error fetching stock prices:', error);
            return { error: 'Failed to fetch stock price data' };
          }
        },
      },
    };
  }
}