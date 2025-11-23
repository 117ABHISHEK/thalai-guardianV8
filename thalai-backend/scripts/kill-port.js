const { exec } = require('child_process');
const os = require('os');

const port = process.argv[2] || 5000;
const platform = os.platform();

console.log(`🔍 Finding process using port ${port}...`);

if (platform === 'win32') {
  // Windows
  exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.log(`✅ No process found using port ${port} (or already free)`);
      return;
    }

    const lines = stdout.trim().split('\n');
    const pids = new Set();

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && pid !== 'PID') {
        pids.add(pid);
      }
    });

    if (pids.size === 0) {
      console.log(`✅ No active process found using port ${port}`);
      return;
    }

    console.log(`⚠️  Found ${pids.size} process(es) using port ${port}:`);
    pids.forEach(pid => console.log(`   PID: ${pid}`));

    pids.forEach(pid => {
      console.log(`🔪 Killing process ${pid}...`);
      exec(`taskkill /PID ${pid} /F`, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`❌ Failed to kill process ${pid}:`, killError.message);
        } else {
          console.log(`✅ Successfully killed process ${pid}`);
        }
      });
    });

    setTimeout(() => {
      console.log(`\n✅ Port ${port} should now be free!`);
      console.log(`💡 Try running: npm run dev`);
    }, 1000);
  });
} else {
  // Linux/Mac
  exec(`lsof -ti:${port}`, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.log(`✅ No process found using port ${port} (or already free)`);
      return;
    }

    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    console.log(`⚠️  Found ${pids.length} process(es) using port ${port}:`);
    pids.forEach(pid => console.log(`   PID: ${pid}`));

    pids.forEach(pid => {
      console.log(`🔪 Killing process ${pid}...`);
      exec(`kill -9 ${pid}`, (killError) => {
        if (killError) {
          console.error(`❌ Failed to kill process ${pid}:`, killError.message);
        } else {
          console.log(`✅ Successfully killed process ${pid}`);
        }
      });
    });

    setTimeout(() => {
      console.log(`\n✅ Port ${port} should now be free!`);
      console.log(`💡 Try running: npm run dev`);
    }, 1000);
  });
}

