# StrideSync - Smart Shoe Energy Harvesting System# StrideSync Smart Shoe

A Next.js web application that connects to Arduino-based smart shoes via Bluetooth (HC-05) to track steps, monitor power generation, and provide obstacle detection with a buzzer alert system. Integrates with Google Fit API for real-time step synchronization.A real-time smart shoe monitoring system that connects Arduino-based sensors with a web application via HC-05 Bluetooth module.

---## Features

## 🚀 Features✅ **Real-time Data Monitoring**

- Step counting

- **Real-time Bluetooth Connection**: Connect to HC-05 Bluetooth module via Web Bluetooth API- Power generation tracking

- **Live Data Monitoring**: Track steps, power generation, and session duration- Live data visualization

- **Google Fit Integration**: Sync real-time steps from your Google Fit account- Session history

- **Obstacle Detection**: Buzzer alert system with ultrasonic sensor (< 20cm detection)

- **Interactive Dashboard**: Beautiful UI with charts, statistics, and device controls✅ **Bluetooth HC-05 Integration**

- **Test Mode**: Built-in simulation mode for testing without hardware- Seamless connection to HI TECH HC-05 modules

- **Auto-reconnect**: Automatic reconnection on temporary disconnections- Real-time command/response communication

- **Session History**: Track your activity over time- Multiple service UUID support

---✅ **Smart Buzzer Control**

- Remote buzzer activation/deactivation

## 📋 Prerequisites- Real-time status feedback

- Test mode functionality

- **Node.js** (v18 or higher)

- **npm** or **yarn**✅ **Modern Web Dashboard**

- **Arduino Uno** with HC-05 Bluetooth module- Responsive design with Tailwind CSS

- **Modern browser** with Web Bluetooth API support (Chrome, Edge, Opera)- Interactive charts and statistics

- **Google Cloud Console account** (for Google Fit integration)- Device connection management

---## Hardware Requirements

## 🔧 Hardware Setup### Arduino Setup

- **Arduino Uno** (or compatible)

### Required Components:- **HC-05 Bluetooth Module** (appears as "HI TECH")

- **Buzzer** for alerts

1. **Arduino Uno**- **Jumper wires** and breadboard

2. **HC-05 Bluetooth Module**

3. **Ultrasonic Sensor (HC-SR04)**### Wiring Diagram

4. **Buzzer** (Active or Passive)```

5. **Jumper Wires**HC-05 Module:

6. **Power Supply** (USB or Battery) VCC -> Arduino 5V

GND -> Arduino GND

### Wiring Diagram: TXD -> Arduino Pin 2 (RX)

RXD -> Arduino Pin 3 (TX)

````

HC-05 Bluetooth Module:Buzzer:

├─ VCC → Arduino 5V  + -> Arduino Pin 4

├─ GND → Arduino GND  - -> Arduino GND

├─ TXD → Arduino Pin 2 (RX)```

└─ RXD → Arduino Pin 3 (TX)

## Arduino Code Setup

Ultrasonic Sensor (HC-SR04):

├─ VCC → Arduino 5V1. **IMPORTANT**: Disconnect HC-05 TX/RX wires (pins 2&3) before uploading

├─ GND → Arduino GND2. Upload `StrideSync_HC05_Final.ino` to your Arduino

├─ Trig → Arduino Pin 93. Reconnect HC-05 TX/RX wires

└─ Echo → Arduino Pin 84. Open Serial Monitor (9600 baud) to verify operation

5. Look for "✅ System ready" message

Buzzer:

├─ Positive (+) → Arduino Pin 12### Arduino Commands

└─ Negative (-) → Arduino GND- `TEST` - Buzzer beep test

```- `BUZZER_ON` / `ON` - Turn buzzer on

- `BUZZER_OFF` / `OFF` - Turn buzzer off

### Arduino Code Upload:- `STATUS` - Get device status

- `RESET` - Reset step counter

1. **IMPORTANT**: Disconnect HC-05 TX/RX wires from pins 2 & 3 before uploading

2. Open `StrideSync_HC05_Final.ino` in Arduino IDE## Web Application Setup

3. Select Board: **Arduino Uno**

4. Select correct **COM Port**### Prerequisites

5. Click **Upload**- Node.js 18+

6. Wait for "Done uploading"- npm/yarn/pnpm

7. **Reconnect** HC-05 TX/RX wires to pins 2 & 3

8. Open **Serial Monitor** (9600 baud) to verify operation### Installation



### Expected Serial Monitor Output:```bash

# Clone the repository

```git clone <repository-url>

🚀 StrideSync Smart Shoe - FINAL VERSIONcd StrideSync

📡 HC-05 Bluetooth Module

🔧 Hardware:# Install dependencies

   - Buzzer on Pin 12npm install

   - HC-05 on Pins 2&3

   - Ultrasonic Trig Pin 9, Echo Pin 8# Start development server

npm run dev

🔊 Testing buzzer...```

✅ Buzzer test complete

📱 Bluetooth initialized### Environment Setup

✅ System ready - waiting for commands

=====================================1. Open [http://localhost:3000](http://localhost:3000)

```2. Enable Bluetooth in your browser

3. Click "Scan for Devices"

---4. Select your "HI TECH" device

5. Click "Connect"

## 🌐 Google Fit API Setup

## Usage Guide

### Step 1: Create Google Cloud Project

### Connecting to HC-05

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Click **"Create Project"** or select existing project1. **Power on** your Arduino with HC-05 module

3. Enter project name: **"StrideSync"** (or any name)2. **Verify** HC-05 LED is blinking (ready to pair)

4. Click **"Create"**3. **Open** StrideSync web app

4. **Click** "Scan for Devices" button

### Step 2: Enable Fitness API5. **Select** "HI TECH" from device list

6. **Wait** for connection (LED should become solid)

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**7. **Verify** data starts appearing on dashboard

2. Search for **"Fitness API"**

3. Click on **"Fitness API"**### Dashboard Features

4. Click **"Enable"**

- **📊 Real-time Stats**: Steps, power, session time

### Step 3: Configure OAuth Consent Screen- **📈 Power Chart**: Live power generation graph

- **🔊 Buzzer Control**: Toggle buzzer on/off

1. Go to **"APIs & Services"** → **"OAuth consent screen"**- **📱 Device Info**: Connection status and device details

2. Select **"External"** user type- **📋 Session Log**: Historical activity data

3. Click **"Create"**

4. Fill in required fields:### Troubleshooting

   - **App name**: StrideSync

   - **User support email**: Your email**Connection Issues:**

   - **Developer contact**: Your email- Ensure HC-05 is powered and blinking

5. Click **"Save and Continue"**- Check wiring connections

6. **Scopes**: Click **"Add or Remove Scopes"**- Verify Arduino code is uploaded correctly

   - Search and add: `fitness.activity.read`- Try refreshing the web page

   - Search and add: `fitness.location.read`

7. Click **"Save and Continue"****No Data Received:**

8. **Test Users**: Click **"Add Users"**- Check Serial Monitor for Arduino output

   - Add your Gmail address- Verify HC-05 TX/RX wires are connected after upload

   - Add any other test users- Look for "📤 Data sent" messages in Serial Monitor

9. Click **"Save and Continue"**

**Buzzer Not Working:**

### Step 4: Create OAuth 2.0 Credentials- Check buzzer wiring (Pin 4, GND)

- Test with "TEST" command in Serial Monitor

1. Go to **"APIs & Services"** → **"Credentials"**- Verify buzzer polarity

2. Click **"Create Credentials"** → **"OAuth client ID"**

3. Application type: **"Web application"**## Development

4. Name: **"StrideSync Web Client"**

5. **Authorized JavaScript origins**:### Tech Stack

   - Add: `http://localhost:9002`- **Frontend**: Next.js 14, React, TypeScript

   - Add: `http://localhost:3000`- **Styling**: Tailwind CSS, shadcn/ui components

   - Add: `https://yourdomain.com` (for production)- **Bluetooth**: Web Bluetooth API

6. **Authorized redirect URIs**:- **Charts**: Recharts

   - Add: `http://localhost:9002`- **Hardware**: Arduino, HC-05 Bluetooth

   - Add: `http://localhost:3000`

   - Add: `https://yourdomain.com` (for production)### Project Structure

7. Click **"Create"**```

8. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)src/

├── app/          # Next.js app router

---├── components/   # React components

│   ├── ui/       # shadcn/ui components

## ⚙️ Installation & Configuration│   └── dashboard.tsx

├── lib/          # Utility functions

### 1. Clone the Repository│   └── bluetooth-service.ts

└── types/        # TypeScript definitions

```bash```

git clone https://github.com/SwatantraKasliwal/StrideSync.git

cd StrideSync### Building for Production

````

````bash

### 2. Install Dependenciesnpm run build

npm start

```bash```

npm install

# or## Contributing

yarn install

```1. Fork the repository

2. Create a feature branch

### 3. Configure Environment Variables3. Commit your changes

4. Push to the branch

Create a `.env.local` file in the project root:5. Open a Pull Request



```bash## License

# .env.local

This project is licensed under the MIT License.

# Google Fit API Configuration

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com## Support



# Optional: Firebase Configuration (if needed in future)For issues and questions:

NEXT_PUBLIC_FIREBASE_API_KEY=1. Check the troubleshooting section

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=2. Review Arduino Serial Monitor output

NEXT_PUBLIC_FIREBASE_PROJECT_ID=3. Check browser console for errors

```4. Open an issue on GitHub

**Replace** `your_client_id_here` with the Client ID from Step 4 above.

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
````

The application will be available at: **http://localhost:9002** (or port shown in terminal)

---

## 🎯 Usage Guide

### Connecting to Your Device

1. **Open the application** in Chrome/Edge browser
2. Click **"Scan for Devices"** button
3. Browser will show Bluetooth device picker
4. Select **"HI TECH"** or your HC-05 device name
5. Click **"Pair"**
6. Wait for connection (5-10 seconds)
7. Green success banner appears when connected

### Using Test Mode

For testing without hardware:

1. Click **"Test Mode"** button
2. Instant connection with simulated data
3. All features work with mock data
4. Great for UI testing and development

### Google Fit Integration

1. Click **"Connect Google Fit"** button (top right)
2. Dialog opens with **"Sign in with Google"** button
3. Click to authenticate
4. Select your Google account
5. Grant permissions:
   - ✅ View your fitness activity
   - ✅ View your fitness location
6. Your email appears in header
7. Steps automatically sync every 30 seconds
8. Toggle between device steps and Google Fit steps

### Buzzer Control

1. **Connect to device** first
2. Toggle the **"Buzzer Active"** switch
   - **ON**: Buzzer enabled, will beep when obstacle detected
   - **OFF**: Buzzer disabled
3. Place hand near ultrasonic sensor (< 20cm)
4. Buzzer beeps in pulsed pattern (300ms on/off)
5. Remove hand → buzzer stops
6. Toggle switch OFF → buzzer disabled even with obstacles

**Important**: The switch controls whether buzzer is _enabled_, not whether it's currently beeping. It will only beep when BOTH conditions are met:

- Switch is ON
- Obstacle detected (< 20cm)

---

## 🏗️ Project Structure

```
StrideSync/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   └── history/
│   │       └── page.tsx            # Activity history page
│   ├── components/
│   │   ├── dashboard.tsx           # Main dashboard component
│   │   ├── device-scanner.tsx     # Bluetooth device scanner
│   │   ├── google-signin.tsx      # Google Fit authentication
│   │   ├── power-chart.tsx        # Power generation chart
│   │   ├── stat-card.tsx          # Statistics cards
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── bluetooth-service.ts   # Bluetooth connection logic
│   │   ├── google-fit-service.ts  # Google Fit API integration
│   │   └── utils.ts               # Utility functions
│   ├── hooks/
│   │   └── use-toast.ts           # Toast notifications hook
│   └── types/
│       └── bluetooth.d.ts         # TypeScript type definitions
├── StrideSync_HC05_Final.ino      # Arduino firmware
├── .env.local                     # Environment variables (create this)
├── .env.local.example             # Example environment file
├── package.json                   # Dependencies
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── README.md                      # This file
```

---

## 🔍 Troubleshooting

### Google Fit Not Connecting

**Problem**: "Client ID not configured" error

**Solution**:

1. Verify `.env.local` file exists in project root
2. Check Client ID is correctly copied (no extra spaces)
3. **Restart the development server**: `Ctrl+C` then `npm run dev`
4. Clear browser cache and reload page

---

**Problem**: "redirect_uri_mismatch" error

**Solution**:

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth Client ID
3. Under "Authorized JavaScript origins", add: `http://localhost:9002`
4. Under "Authorized redirect URIs", add: `http://localhost:9002`
5. Save changes and try again

---

**Problem**: Google popup blocked

**Solution**:

1. Allow popups for `localhost:9002` in browser settings
2. Click the popup icon in address bar
3. Select "Always allow popups from this site"

---

### Bluetooth Connection Issues

**Problem**: Device not found in scan

**Solution**:

1. Check HC-05 power LED is blinking
2. Ensure HC-05 is not connected to another device
3. Enable Bluetooth on your computer
4. Use Chrome, Edge, or Opera browser (Firefox doesn't support Web Bluetooth)
5. Try refreshing the page

---

**Problem**: Connection keeps dropping

**Solution**:

1. Check HC-05 wiring (especially power supply)
2. Ensure HC-05 TX → Arduino Pin 2, RX → Arduino Pin 3
3. Keep device within 10 meters range
4. Check Arduino Serial Monitor for errors
5. Application has auto-reconnect (max 5 attempts)

---

**Problem**: "User cancelled device selection"

**Solution**:

- This is normal - user clicked "Cancel" in device picker
- Click "Scan for Devices" again and select a device

---

### Buzzer Issues

**Problem**: Buzzer switch keeps toggling on/off automatically

**Solution**: ✅ **FIXED** in latest version

- The switch now controls whether buzzer is _enabled_
- The switch won't toggle when buzzer beeps
- Only your manual clicks change the switch state

---

**Problem**: Buzzer not beeping

**Solution**:

1. Check wiring: Buzzer + → Pin 12, - → GND
2. Verify switch is **ON** (blue/green color)
3. Place hand very close to sensor (< 20cm)
4. Check Arduino Serial Monitor:
   ```
   📏 Distance: 15 cm | Obstacle: YES ⚠️
   ```
5. If no obstacle detected, sensor might be faulty

---

**Problem**: Buzzer always beeping

**Solution**:

1. Toggle switch **OFF** in web app
2. Check for objects in front of sensor
3. Increase detection distance threshold in Arduino code (line 59):
   ```cpp
   const float OBSTACLE_DISTANCE_CM = 30.0; // Increase from 20.0
   ```

---

### Arduino Upload Issues

**Problem**: "avrdude: stk500_recv(): programmer is not responding"

**Solution**:

1. **Disconnect HC-05 TX/RX wires** from pins 2 & 3
2. Close Serial Monitor
3. Check correct COM port selected
4. Upload code
5. **Reconnect HC-05 wires** after upload

---

**Problem**: No output in Serial Monitor

**Solution**:

1. Select correct COM port
2. Set baud rate to **9600**
3. Check "Both NL & CR" line ending
4. Press Arduino **reset button**
5. Check USB cable (try different cable/port)

---

### Common Errors

**Error**: `Cannot find module 'next'`

**Solution**:

```bash
npm install
# or
rm -rf node_modules package-lock.json
npm install
```

---

**Error**: Port 9002 already in use

**Solution**:

```bash
# Windows
netstat -ano | findstr :9002
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :9002
kill -9 <PID>
```

---

**Error**: Web Bluetooth API not available

**Solution**:

- Use Chrome, Edge, or Opera browser
- Ensure HTTPS or localhost (required for Web Bluetooth)
- Check: chrome://flags/#enable-web-bluetooth

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push code to GitHub**:

   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Click "Deploy"

3. **Update Google Cloud Console**:

   - Add your Vercel domain to:
     - Authorized JavaScript origins: `https://your-app.vercel.app`
     - Authorized redirect URIs: `https://your-app.vercel.app`

4. **Important**: Web Bluetooth requires HTTPS in production

---

### Build for Production

```bash
npm run build
npm run start
```

---

## 📱 Browser Compatibility

| Browser | Web Bluetooth | Supported |
| ------- | ------------- | --------- |
| Chrome  | ✅ Yes        | ✅ Yes    |
| Edge    | ✅ Yes        | ✅ Yes    |
| Opera   | ✅ Yes        | ✅ Yes    |
| Firefox | ❌ No         | ❌ No     |
| Safari  | ❌ No         | ❌ No     |

**Note**: Web Bluetooth API is only available in Chrome-based browsers.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Hooks
- **APIs**: Web Bluetooth API, Google Fit REST API
- **Authentication**: Google OAuth 2.0, Google Identity Services
- **Charts**: Recharts library
- **Hardware**: Arduino Uno, HC-05 Bluetooth, HC-SR04 Ultrasonic Sensor

---

## 📝 API Reference

### Bluetooth Service

```typescript
// Connect to device
await bluetoothService.connect();

// Send command
await bluetoothService.sendCommand("TEST");

// Toggle buzzer
await bluetoothService.setBuzzer(true); // Enable
await bluetoothService.setBuzzer(false); // Disable

// Disconnect
await bluetoothService.disconnect();
```

### Google Fit Service

```typescript
// Authenticate
const auth = await googleFitService.authenticate();

// Get today's steps
const steps = await googleFitService.getTodaySteps();

// Start monitoring (updates every 30s)
const cleanup = googleFitService.startStepMonitoring((steps) => {
  console.log("Steps:", steps);
});

// Sign out
googleFitService.signOut();
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Swatantra Kasliwal**

- GitHub: [@SwatantraKasliwal](https://github.com/SwatantraKasliwal)
- Repository: [StrideSync](https://github.com/SwatantraKasliwal/StrideSync)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for beautiful UI components
- Arduino community for HC-05 libraries
- Google Fit API for fitness data integration

---

## 📞 Support

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Review Arduino Serial Monitor output
3. Check browser console for errors (F12)
4. Ensure all wiring is correct
5. Verify environment variables are set
6. Create an issue on GitHub

---

## 🎉 Quick Start Checklist

- [ ] Arduino code uploaded (HC-05 disconnected during upload)
- [ ] HC-05 reconnected after upload
- [ ] Serial Monitor shows "System ready"
- [ ] `.env.local` file created with Google Client ID
- [ ] Development server started (`npm run dev`)
- [ ] Browser opened at `http://localhost:9002`
- [ ] Bluetooth enabled on computer
- [ ] Using Chrome/Edge/Opera browser
- [ ] Device connected successfully
- [ ] Google Fit authenticated (optional)
- [ ] Buzzer toggle working
- [ ] All features tested ✅

---

**Happy Coding! 🚀**
