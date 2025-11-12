#!/usr/bin/env node

/**
 * Battle Monitor Cron Job
 *
 * This script runs the battle monitoring system to check for new commits
 * from event participants and update the battle log.
 *
 * Usage:
 *   node scripts/battle-cron.js
 *
 * Recommended cron schedule:
 *   */3 * * * * - Every 3 minutes
 *   */5 * * * * - Every 5 minutes (safer for rate limits)
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3002';
const ENDPOINT = '/api/monitor-battle';

function makeRequest() {
  const url = `${API_URL}${ENDPOINT}`;
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;

  console.log(`[${new Date().toISOString()}] Starting battle monitoring...`);
  console.log(`Calling: ${url}`);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 300000 // 5 minutes timeout
  };

  const req = client.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (response.success) {
          console.log(`[${new Date().toISOString()}] ✅ Battle monitoring completed successfully`);
          console.log(`Response: ${response.message}`);
        } else {
          console.error(`[${new Date().toISOString()}] ❌ Battle monitoring failed:`, response.error);
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error parsing response:`, error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] ❌ Request error:`, error.message);
  });

  req.on('timeout', () => {
    console.error(`[${new Date().toISOString()}] ❌ Request timeout`);
    req.destroy();
  });

  req.end();
}

// Run immediately
makeRequest();

// If running in continuous mode (for testing)
if (process.argv.includes('--continuous')) {
  console.log('Running in continuous mode (every 3 minutes)...');
  setInterval(makeRequest, 3 * 60 * 1000); // 3 minutes
}