#!/bin/bash

# StrideSync Connection Test Script
# Run this script to verify all fixes are working correctly

echo "🧪 StrideSync Connection Test Suite"
echo "=================================="

# Check if Next.js server is running
echo "📡 Checking development server..."
if curl -s http://localhost:9002 > /dev/null; then
    echo "✅ Development server is running on http://localhost:9002"
else
    echo "❌ Development server is not running. Starting..."
    cd "C:/Users/swata/Sem 07/IOE lab/Application/StrideSync"
    npm run dev &
    sleep 5
fi

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
cd "C:/Users/swata/Sem 07/IOE lab/Application/StrideSync"
if npx tsc --noEmit; then
    echo "✅ No TypeScript errors found"
else
    echo "❌ TypeScript compilation errors detected"
fi

# Check critical files exist
echo "📁 Verifying critical files..."
files=(
    "src/lib/bluetooth-service.ts"
    "src/components/device-scanner.tsx"
    "src/components/dashboard.tsx"
    "docs/arduino-example.ino"
    "docs/FINAL_CONNECTION_FIX.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check package dependencies
echo "📦 Checking dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules installed"
    else
        echo "⚠️  Running npm install..."
        npm install
    fi
else
    echo "❌ package.json not found"
fi

echo ""
echo "🎯 Manual Testing Required:"
echo "========================="
echo "1. Open browser to http://localhost:9002"
echo "2. Click 'Connect Device' button"
echo "3. Select 'HI TECH - Paired' device"
echo "4. Verify connection status shows 'Connected'"
echo "5. Test commands with Arduino Serial Monitor"
echo ""
echo "🔧 Hardware Setup:"
echo "=================="
echo "1. Upload docs/arduino-example.ino to Arduino"
echo "2. Connect HC-05 module (VCC→5V, GND→GND, RX→Pin2, TX→Pin3)"
echo "3. Connect buzzer to Pin 8"
echo "4. Connect ultrasonic sensor (Trig→Pin9, Echo→Pin10)"
echo "5. Listen for 3 startup beeps"
echo ""
echo "✅ All automated checks complete!"
echo "🚀 Ready for manual testing!"