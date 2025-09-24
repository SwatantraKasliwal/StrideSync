# HTTPS Development Server Setup

If Web Bluetooth doesn't work with HTTP, you need HTTPS:

## Option 1: Use ngrok (Recommended)

1. Download ngrok from: https://ngrok.com/
2. Run your app: `npm run dev`
3. In another terminal: `ngrok http 9002`
4. Use the HTTPS URL provided by ngrok

## Option 2: Local HTTPS Certificate

1. Install mkcert: `npm install -g mkcert`
2. Create certificates: `mkcert localhost`
3. Update next.config.ts to use HTTPS

## Option 3: Use Chrome with Flags

1. Go to: chrome://flags/#enable-web-bluetooth
2. Enable "Experimental Web Platform features"
3. Restart Chrome
4. Allow insecure localhost: chrome://flags/#allow-insecure-localhost

## Test Steps:

1. Open Chrome/Edge
2. Go to HTTPS URL
3. Click "Scan for Devices"
4. Allow Bluetooth permissions
5. Select HC-05 device
6. Verify connection

## Expected Behavior:

- HC-05 should appear in device list
- Connection should succeed
- Real-time data should flow
- Buzzer control should work immediately
