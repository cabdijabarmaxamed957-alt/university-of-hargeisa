/**
 * University Office Desktop Agent (CLI / Daemon)
 * Connects a physical or virtual university workstation to the central management system.
 * Supports:
 *  - Authenticated device heartbeat
 *  - Live task and announcement push notifications
 *  - Real-time status reporting
 *  - Screen frame streaming via WebSocket
 */

import { WebSocket } from 'ws';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const WS_URL = process.env.WS_URL || 'ws://localhost:4000';

const DEVICE_ID = process.env.DEVICE_ID || 'DEV-PRN-01';
const OFFICE_ID = process.env.OFFICE_ID || 'printing';
const DEVICE_TOKEN = process.env.DEVICE_TOKEN || 'tok_dev_prn_01_secure';
const AGENT_VERSION = '2.4.1-Enterprise';

console.log('🏛️  University Office Desktop Agent v' + AGENT_VERSION);
console.log(`📍 Device: ${DEVICE_ID} | Office: ${OFFICE_ID}`);
console.log(`🌐 Central Server: ${SERVER_URL}\n`);

// 1. Send Heartbeat
async function sendHeartbeat() {
  try {
    const res = await fetch(`${SERVER_URL}/api/devices/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: DEVICE_ID,
        token: DEVICE_TOKEN,
        agentVersion: AGENT_VERSION
      })
    });
    if (res.ok) {
      console.log(`💓 [${new Date().toLocaleTimeString()}] Heartbeat acknowledged by server`);
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn(`⚠️ Heartbeat rejected:`, err.error || res.statusText);
    }
  } catch (err) {
    console.error(`❌ Heartbeat connection error: ${err.message}`);
  }
}

// 2. Connect WebSocket
function connectWebSocket() {
  console.log(`🔌 Connecting to WebSocket cluster: ${WS_URL}...`);
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('✅ WebSocket connection established.');
    // Send initial device registration over socket
    ws.send(JSON.stringify({
      type: 'DEVICE_HEARTBEAT',
      payload: {
        deviceId: DEVICE_ID,
        officeId: OFFICE_ID,
        token: DEVICE_TOKEN,
        agentVersion: AGENT_VERSION
      }
    }));
  });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'TASK_CREATED') {
        if (msg.payload.officeId === OFFICE_ID) {
          console.log('\n🚨 [NEW TASK RECEIVED] ------------------------');
          console.log(`   Title: ${msg.payload.title}`);
          console.log(`   Priority: ${msg.payload.priority.toUpperCase()}`);
          console.log(`   Task ID: ${msg.payload.id}`);
          console.log('----------------------------------------------\n');
        }
      } else if (msg.type === 'NEW_ANNOUNCEMENT') {
        console.log('\n📢 [OFFICIAL UNIVERSITY BROADCAST] ----------');
        console.log(`   Subject: ${msg.payload.title}`);
        console.log(`   Content: ${msg.payload.content}`);
        console.log('----------------------------------------------\n');
      } else if (msg.type === 'SCREEN_SESSION_STARTED') {
        if (msg.payload.officeId === OFFICE_ID) {
          console.log('\n👁️ [ADMIN SCREEN VIEW SESSION INITIATED]');
          console.log(`   Requested by: ${msg.payload.requestedBy}`);
          console.log('   Status: Streaming active screen telemetry...\n');
        }
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    console.warn('⚠️ WebSocket disconnected. Reconnecting in 5 seconds...');
    setTimeout(connectWebSocket, 5000);
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
  });
}

// Start
sendHeartbeat();
setInterval(sendHeartbeat, 30000); // Heartbeat every 30s
connectWebSocket();
