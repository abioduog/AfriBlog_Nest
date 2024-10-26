const { spawn } = require('child_process');
const path = require('path');

// Clean and build first
const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('Build failed');
    process.exit(code);
  }

  // Start the development server
  const start = spawn('npm', ['run', 'start:dev'], {
    stdio: 'inherit',
    shell: true
  });

  start.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
});