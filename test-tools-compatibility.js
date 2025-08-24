const { z } = require('zod');

// Test what the AI SDK expects vs what we're providing
function testToolSchema() {
  // Our current Zod schema
  const zodSchema = z.object({
    ticker: z.string().describe('The ticker of the company'),
    limit: z.number().optional().default(5).describe('Number of results')
  });

  console.log('=== ZOD SCHEMA DIRECT ===');
  console.log(JSON.stringify(zodSchema, null, 2));

  // What AI SDK needs - JSON Schema format
  console.log('\n=== WHAT AI SDK NEEDS ===');
  const properToolFormat = {
    type: 'object',
    properties: {
      ticker: {
        type: 'string',
        description: 'The ticker of the company'
      },
      limit: {
        type: 'number',
        description: 'Number of results',
        default: 5
      }
    },
    required: ['ticker'],
    additionalProperties: false
  };
  
  console.log(JSON.stringify(properToolFormat, null, 2));

  // Test if Zod has a JSON schema conversion
  try {
    if (zodSchema.openapi) {
      console.log('\n=== ZOD OPENAPI CONVERSION ===');
      console.log(JSON.stringify(zodSchema.openapi('MySchema'), null, 2));
    }
  } catch (e) {
    console.log('\n=== ZOD OPENAPI NOT AVAILABLE ===');
  }
}

testToolSchema();