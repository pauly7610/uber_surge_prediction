import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync } from 'fs';
import path from 'path';

// Load mock data
const mockData = JSON.parse(readFileSync(path.join(process.cwd(), 'db.json'), 'utf8'));

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { query, variables } = req.body;
      
      // Simple query parser
      if (query.includes('GetSurgeData')) {
        res.status(200).json({
          data: {
            surgeData: mockData.surgeData
          }
        });
      } 
      else if (query.includes('GetHistoricalSurgeData')) {
        res.status(200).json({
          data: {
            historicalSurgeData: mockData.historicalSurgeData
          }
        });
      }
      else if (query.includes('TestConnection')) {
        res.status(200).json({
          data: {
            __typename: 'Query'
          }
        });
      }
      else {
        res.status(400).json({
          errors: [{ message: 'Unknown query' }]
        });
      }
    } catch (error) {
      res.status(500).json({
        errors: [{ message: `Internal server error: ${error.message}` }]
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
