// server/test-system.js
// Automated End-to-End Verification Test Suite for University Operations Management System

import http from 'http';
import https from 'https';

const API_BASE = 'http://localhost:4000';

// Simple fetch-like HTTP request helper using native Node.js
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    let postData = null;
    if (body) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        postData = body;
      } else {
        postData = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
      }
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

// Multipart form-data helper for file upload test
function uploadFile(token, filename, content) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const url = new URL('/api/upload', API_BASE);

    const crlf = '\r\n';
    let postDataStart = `--${boundary}${crlf}`;
    postDataStart += `Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}`;
    postDataStart += `Content-Type: text/plain${crlf}${crlf}`;

    const postDataEnd = `${crlf}--${boundary}--${crlf}`;

    const payload = Buffer.concat([
      Buffer.from(postDataStart, 'utf-8'),
      Buffer.from(content, 'utf-8'),
      Buffer.from(postDataEnd, 'utf-8')
    ]);

    const req = http.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

let testResults = [];
function record(testName, passed, details = '') {
  testResults.push({ testName, passed, details });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusIcon}: ${testName}${details ? ` -> ${details}` : ''}`);
}

async function runTests() {
  console.log('\n============================================================');
  console.log('🏛️ UNIVERSITY CONTROL CENTER - SYSTEM VERIFICATION SUITE');
  console.log('============================================================\n');

  try {
    // 1. Health Check (Public and Authenticated)
    const health = await request('GET', '/api/health');
    record('System Health Check', health.status === 200 && (health.data.status === 'ok' || health.data.status === 'healthy'), `Status: ${health.status}, Uptime: ${health.data.uptime}s`);

    // 2. Authentication - Valid Logins
    const directorLogin = await request('POST', '/api/auth/login', {
      email: 'director@university.edu',
      password: 'UniversityDirector@2026!'
    });
    record('Authentication: Director Login', directorLogin.status === 200 && !!directorLogin.data.token, `Role: ${directorLogin.data.user?.role}`);
    const directorToken = directorLogin.data.token;

    const printingLogin = await request('POST', '/api/auth/login', {
      email: 'ahmed@university.edu',
      password: 'AhmedPrinting@2026!'
    });
    record('Authentication: Printing Manager Login', printingLogin.status === 200 && printingLogin.data.user?.officeId === 'printing', `Office: ${printingLogin.data.user?.officeId}`);
    const printingToken = printingLogin.data.token;

    const libraryLogin = await request('POST', '/api/auth/login', {
      email: 'hassan@university.edu',
      password: 'HassanLibrary@2026!'
    });
    record('Authentication: Library Manager Login', libraryLogin.status === 200 && libraryLogin.data.user?.officeId === 'medical_library', `Office: ${libraryLogin.data.user?.officeId}`);
    const libraryToken = libraryLogin.data.token;

    const nocLogin = await request('POST', '/api/auth/login', {
      email: 'noc@university.edu',
      password: 'NOCAdmin@2026!'
    });
    record('Authentication: IT NOC Admin Login', nocLogin.status === 200 && nocLogin.data.user?.role === 'it_admin', `Role: ${nocLogin.data.user?.role}`);
    const nocToken = nocLogin.data.token;

    // 3. Authentication - Invalid Login Rejection
    const badLogin = await request('POST', '/api/auth/login', {
      email: 'director@university.edu',
      password: 'WrongPassword123!'
    });
    record('Authentication: Reject Invalid Password', badLogin.status === 401, `Status: ${badLogin.status}`);

    // 4. Session Validation (GET /api/auth/me)
    const meCheck = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${directorToken}` });
    record('Session Token Validation (/api/auth/me)', meCheck.status === 200 && meCheck.data.email === 'director@university.edu', `Email: ${meCheck.data.email}`);

    // 5. Office Data Access & Isolation
    const offices = await request('GET', '/api/offices', null, { Authorization: `Bearer ${directorToken}` });
    record('Offices Directory Query', offices.status === 200 && Array.isArray(offices.data), `Total Offices: ${offices.data.length}`);

    // 6. Messaging & Office Isolation (Printing vs Library)
    // Director posts message to Printing
    const postMsg = await request('POST', '/api/messages', {
      officeId: 'printing',
      content: 'Official instruction: Prepare exam booklet batches.'
    }, { Authorization: `Bearer ${directorToken}` });
    record('Direct Messaging: Director -> Printing Office', postMsg.status === 201, `Msg ID: ${postMsg.data.id}`);

    // Printing manager reads messages
    const printingMsgs = await request('GET', '/api/messages/printing', null, { Authorization: `Bearer ${printingToken}` });
    record('Office Isolation: Printing Manager Reads Printing Messages', printingMsgs.status === 200 && printingMsgs.data.length > 0, `Count: ${printingMsgs.data.length}`);

    // Library manager attempts to read Printing messages -> Must be blocked (403)
    const illegalMsgs = await request('GET', '/api/messages/printing', null, { Authorization: `Bearer ${libraryToken}` });
    record('Office Isolation: Library Manager Blocked from Reading Printing Messages (403)', illegalMsgs.status === 403, `Status: ${illegalMsgs.status}`);

    // 7. Role-Based Permissions (RBAC) - Announcements
    // Office Manager attempts to create announcement -> Must be blocked (403)
    const illegalAnnouncement = await request('POST', '/api/announcements', {
      title: 'Unauthorized announcement',
      message: 'This should fail',
      priority: 'high'
    }, { Authorization: `Bearer ${printingToken}` });
    record('RBAC: Office Manager Blocked from Creating Global Announcement (403)', illegalAnnouncement.status === 403, `Status: ${illegalAnnouncement.status}`);

    // Director creates Targeted Announcement
    const targetedAnn = await request('POST', '/api/announcements', {
      title: 'Targeted Notice: Exam Schedule Revision',
      message: 'Please review updated examination schedule timeline.',
      priority: 'urgent',
      targetAudience: 'targeted',
      targetOffices: ['printing', 'medical_library']
    }, { Authorization: `Bearer ${directorToken}` });
    record('RBAC: Director Creates Targeted Announcement', targetedAnn.status === 201 && !!targetedAnn.data.id, `Announcement ID: ${targetedAnn.data.id}`);

    // 8. Task Workflow & Timeline Tracking
    const createTask = await request('POST', '/api/tasks', {
      title: 'Print Grade Sheets - Fall Semester',
      description: 'Expedite printing and stamping for registrar clearance.',
      officeId: 'printing',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }, { Authorization: `Bearer ${directorToken}` });
    record('Task Management: Create Task with Due Date', createTask.status === 201, `Task ID: ${createTask.data.id}`);
    const taskId = createTask.data.id;

    // Step through valid workflow transitions: new -> received -> in_progress -> completed
    await request('PATCH', `/api/tasks/${taskId}/status`, { status: 'received' }, { Authorization: `Bearer ${printingToken}` });
    
    const updateTask = await request('PATCH', `/api/tasks/${taskId}/status`, {
      status: 'in_progress'
    }, { Authorization: `Bearer ${printingToken}` });
    record('Task Workflow: Office Manager Updates Status (in_progress)', updateTask.status === 200 && updateTask.data.status === 'in_progress', `Status: ${updateTask.data.status}`);

    // Printing Manager completes task
    const completeTask = await request('PATCH', `/api/tasks/${taskId}/status`, {
      status: 'completed'
    }, { Authorization: `Bearer ${printingToken}` });
    record('Task Workflow: Complete Task & Record Completion Timeline', completeTask.status === 200 && completeTask.data.status === 'completed' && !!completeTask.data.completedAt, `CompletedAt: ${completeTask.data.completedAt}`);

    // 9. Real File Upload & Download
    const uploadRes = await uploadFile(directorToken, 'official-directive.txt', 'Official University Directive Content 2026 - Confidential');
    record('File Upload: Real Multipart Attachment Storage', uploadRes.status === 201 && !!uploadRes.data.id, `File ID: ${uploadRes.data.id}, Path: ${uploadRes.data.url}`);

    if (uploadRes.data?.id) {
      const fileDownload = await request('GET', `/api/files/${uploadRes.data.id}`, null, { Authorization: `Bearer ${directorToken}` });
      record('File Retrieval: Download Stored Attachment', fileDownload.status === 200, `Downloaded file verified with auth`);
    }

    // 10. Live Screen View Signaling
    const screenStart = await request('POST', '/api/screen/start', {
      officeId: 'printing',
      taskId: taskId,
      reason: 'Quality assurance verification on grade sheets print run'
    }, { Authorization: `Bearer ${directorToken}` });
    record('Live Screen Monitoring: Initialize Supervision Session', screenStart.status === 201 && (screenStart.data.officeId === 'printing' || screenStart.data.session?.officeId === 'printing'), `Session ID: ${screenStart.data.id || screenStart.data.session?.id}`);

    const screenStop = await request('POST', '/api/screen/stop', {
      officeId: 'printing'
    }, { Authorization: `Bearer ${directorToken}` });
    record('Live Screen Monitoring: Terminate Supervision Session', screenStop.status === 200, `Session stopped`);

    // 11. Device Heartbeat & Telemetry
    const heartbeat = await request('POST', '/api/devices/heartbeat', {
      officeId: 'printing',
      deviceId: 'DEV-PRN-01',
      hostname: 'DESKTOP-PRINT-WS',
      ip: '10.20.4.12',
      agentVersion: '1.2.0',
      activeTaskCount: 1,
      status: 'online',
      cpuUsage: 18,
      memoryUsage: 42
    }, { Authorization: `Bearer ${printingToken}` });
    record('Device Telemetry: Process Desktop Agent Heartbeat', heartbeat.status === 200 && heartbeat.data.received === true, `Heartbeat OK`);

    // 12. IT Admin Audit Logs
    const auditLogs = await request('GET', '/api/audit-logs', null, { Authorization: `Bearer ${nocToken}` });
    record('Audit Trail: IT Admin Accesses Persistent Audit Logs', auditLogs.status === 200 && Array.isArray(auditLogs.data) && auditLogs.data.length > 0, `Total Audit Entries: ${auditLogs.data.length}`);

    // Summary
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;

    console.log('\n============================================================');
    console.log(`📊 TEST SUITE COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('💥 Test execution error:', err);
    process.exit(1);
  }
}

runTests();
