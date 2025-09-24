# StrideSync Debug Instructions

## 🧪 Testing the Web Application

### Step 1: Open the Application

1. Go to http://localhost:3000
2. Open browser Developer Tools (Press F12)
3. Go to the Console tab

### Step 2: Test the Test Mode

1. Click "Scan Devices" button
2. Click "Test Mode" button
3. Watch the Console for debug messages

### Expected Console Output:

```
DeviceScanner: Test Mode button clicked
DeviceScanner: Created test device: {id: "test-device-12345", name: "Test StrideSync Device", connected: false}
DeviceScanner: Calling onDeviceSelected with test device
Dashboard: Connecting to device: Test StrideSync Device ID: test-device-12345
Dashboard: Detected test device, calling connectTestDevice()
BluetoothService: connectTestDevice() called
BluetoothService: Calling status callback with 'connecting'
Dashboard: Status callback received: connecting
BluetoothService: Simulating connection delay...
BluetoothService: Starting mobile simulation...
BluetoothService: Calling status callback with 'connected'
Dashboard: Status callback received: connected
Dashboard: Device connected, setting up session
BluetoothService: Simulated data: {steps: X, power: Y, buzzerActive: false, timestamp: Z}
BluetoothService: Calling data callback with simulated data
Dashboard: Received data from bluetooth service: {steps: X, power: Y, buzzerActive: false, timestamp: Z}
Dashboard: Updated state - steps: X power: Y
```

### Step 3: Verify Visual Feedback

After clicking Test Mode, you should see:

1. **Toast Notification**: "🔄 Connecting..." (briefly)
2. **Toast Notification**: "🎯 Test Mode Connected!" (4 seconds)
3. **Green Success Banner**: "✅ Successfully Connected!" with device name
4. **Live Data Updates**: Step count and power values updating every 2 seconds

### Step 4: Monitor Data Flow

In the main dashboard, you should see:

- **Step counter** increasing every 2 seconds
- **Power meter** showing changing values (0.2-1.0 watts)
- **Power chart** building up with data points
- **Connection status** showing connected state
- **Session timer** counting up

## 🔍 Troubleshooting

### If Test Mode Button Doesn't Work:

- Check browser console for JavaScript errors
- Refresh the page and try again
- Make sure you're using Chrome, Edge, or Opera

### If No Console Messages Appear:

- Make sure Developer Tools is open
- Check the Console tab is selected
- Refresh the page and try again

### If Connection Succeeds But No Data Updates:

- Look for "BluetoothService: Simulated data" messages
- Check if data callback is being called
- Verify dashboard state updates

### If Toast Notifications Don't Appear:

- Check if toaster component is properly mounted
- Look for any UI component errors
- Try refreshing the page

## 🚀 Quick Fixes

### Fix 1: Clear Browser Cache

1. Press Ctrl+Shift+R to hard refresh
2. Or clear browser cache and reload

### Fix 2: Restart Development Server

1. Stop the server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Refresh browser

### Fix 3: Check Network Tab

1. Open Developer Tools > Network tab
2. Look for any failed requests
3. Check if all assets are loading properly

Once you complete this test, report back with:

1. What console messages you see
2. Which visual elements appear/don't appear
3. Any error messages in the console
4. Whether data updates after connection
