const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.PORT = 8000;

console.log('Starting React application...');

// Start React app
const reactApp = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

reactApp.on('error', (error) => {
  console.error('Failed to start React app:', error);
});

console.log('Starting mock API server...');

// Start mock API server
const mockApi = spawn('node', [path.join(__dirname, 'mock-api', 'server.js')], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

mockApi.on('error', (error) => {
  console.error('Failed to start mock API server:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  reactApp.kill();
  mockApi.kill();
  process.exit();
}); 