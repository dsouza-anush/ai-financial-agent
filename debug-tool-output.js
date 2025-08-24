const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

// Test the exact same conversion our fixed tools use
function testToolConversion() {
  const newsSchema = z.object({
    ticker: z.string().describe('The ticker of the company to get news for'),
    limit: z.number().optional().default(5).describe('The number of news articles to return'),
  });

  console.log('=== ORIGINAL ZOD SCHEMA ===');
  console.log(JSON.stringify(newsSchema, null, 2));

  const jsonSchema = zodToJsonSchema(newsSchema, { 
    name: undefined,
    $refStrategy: 'none',
    strictUnions: true
  });
  
  console.log('\n=== CONVERTED JSON SCHEMA ===');
  console.log(JSON.stringify(jsonSchema, null, 2));

  // Remove $schema property that Heroku API rejects
  const { $schema, ...cleanSchema } = jsonSchema;
  
  console.log('\n=== CLEAN SCHEMA (FINAL) ===');
  console.log(JSON.stringify(cleanSchema, null, 2));

  // Test the complete tool structure
  const completeTool = {
    description: 'Get news for a company',
    parameters: cleanSchema,
    execute: async ({ ticker, limit = 5 }) => {
      return { ticker, limit, result: 'test' };
    }
  };

  console.log('\n=== COMPLETE TOOL STRUCTURE ===');
  console.log(JSON.stringify(completeTool, (key, value) => {
    if (typeof value === 'function') return '[Function]';
    return value;
  }, 2));
}

testToolConversion();