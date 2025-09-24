# Chrome Web Bluetooth Fix

## Method 1: Chrome Flags (Recommended)

1. Open Chrome
2. Go to: chrome://flags/#enable-web-bluetooth
3. Set to "Enabled"
4. Go to: chrome://flags/#enable-experimental-web-platform-features
5. Set to "Enabled"
6. Restart Chrome
7. Test your app again

## Method 2: Launch Chrome with Flags

Close Chrome completely, then:

### Windows (Command Prompt):

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --enable-web-bluetooth --enable-experimental-web-platform-features --unsafely-treat-insecure-origin-as-secure=http://localhost:9002
```

### Windows (PowerShell):

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --enable-web-bluetooth --enable-experimental-web-platform-features --unsafely-treat-insecure-origin-as-secure=http://localhost:9002
```

## Method 3: Use HTTPS (Most Reliable)

Web Bluetooth works best with HTTPS. Use ngrok:

1. Install ngrok: https://ngrok.com/download
2. Run your app: npm run dev (port 9002)
3. In new terminal: ngrok http 9002
4. Use the HTTPS URL ngrok provides

## Test Steps:

1. Open the modified Chrome
2. Go to your StrideSync app
3. The yellow banner should disappear
4. "Scan for Devices" should work
5. HC-05 should appear in the list
