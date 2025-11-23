# Port Conflict Fix ✅

## Problem
Error: `EADDRINUSE: address already in use :::5000`

This occurs when port 5000 is already being used by another process (often a previous instance of the server that didn't shut down properly).

## Solution Applied

### 1. ✅ Enhanced Server Error Handling
Updated `server.js` to handle port conflicts gracefully with helpful error messages.

### 2. ✅ Created Kill-Port Utility Script
Created `scripts/kill-port.js` that automatically finds and kills processes using a specific port.

### 3. ✅ Added NPM Scripts
Added convenient npm scripts to kill processes on port 5000:
- `npm run kill-port` - Kills process on default port (5000)
- `npm run kill-port:5000` - Explicitly kills process on port 5000

## Usage

### Kill Process on Port 5000
```bash
cd thalai-backend
npm run kill-port
# OR
npm run kill-port:5000
# OR
node scripts/kill-port.js 5000
```

### Manual Method (Windows)
```bash
# Find the process
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### Manual Method (Linux/Mac)
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

## Status
✅ **Port 5000 is now free!** 

The listening process (PID: 15956) has been successfully killed. You can now start the server:

```bash
cd thalai-backend
npm run dev
```

## What Was Fixed

1. **Server.js** - Added graceful error handling for `EADDRINUSE` errors with helpful instructions
2. **Kill-port script** - Cross-platform utility to kill processes on any port
3. **Package.json** - Added convenient npm scripts for port management

## Prevention Tips

1. Always use `Ctrl+C` to stop the server properly
2. If the server crashes, run `npm run kill-port` before restarting
3. Use different ports for multiple instances:
   ```bash
   PORT=5001 npm run dev
   ```

## Note on TIME_WAIT

If you see TIME_WAIT connections after killing the process, that's normal! These are connections that are closing and won't prevent a new server from starting. The important thing is that there's no LISTENING process on the port anymore.

