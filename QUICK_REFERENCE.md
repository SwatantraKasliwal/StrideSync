# 🚀 StrideSync - Quick Reference Card

## 📌 Essential URLs

| What            | URL                                               |
| --------------- | ------------------------------------------------- |
| 🌐 **Live App** | https://stride-sync-virid.vercel.app/             |
| 💻 **GitHub**   | https://github.com/SwatantraKasliwal/StrideSync   |
| ⚙️ **Vercel**   | https://vercel.com/dashboard                      |
| 🔐 **Google**   | https://console.cloud.google.com/apis/credentials |

---

## 🔑 Environment Variable

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=70059231909-3jds1hb6i37tbm40jgf77saino4vitq3.apps.googleusercontent.com
```

**Location**: `.env.local` (already configured ✅)

---

## ⚡ Quick Commands

```bash
# Clone repository
git clone https://github.com/SwatantraKasliwal/StrideSync.git

# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push changes (auto-deploys!)
git add .
git commit -m "Your message"
git push origin main
```

---

## 🔧 Arduino Setup

```cpp
// Pins Configuration
HC-05 TX  -> Arduino Pin 2
HC-05 RX  -> Arduino Pin 3
Buzzer    -> Arduino Pin 4
Ultrasonic Trig -> Arduino Pin 9
Ultrasonic Echo -> Arduino Pin 8
```

**⚠️ IMPORTANT**: Disconnect HC-05 TX/RX before uploading code!

---

## 📱 Browser Support

✅ Chrome (Recommended)  
✅ Microsoft Edge  
✅ Opera  
❌ Firefox (No Web Bluetooth)  
❌ Safari (No Web Bluetooth)

---

## 🎯 Features Checklist

- [x] Real-time Bluetooth (HC-05)
- [x] Google Fit integration
- [x] Step tracking
- [x] Power monitoring
- [x] Buzzer control
- [x] Obstacle detection
- [x] Activity history
- [x] Auto-reconnection
- [x] Responsive UI
- [x] HTTPS enabled

---

## 🐛 Quick Troubleshooting

| Issue                       | Solution                   |
| --------------------------- | -------------------------- |
| **Google Fit not working**  | Check `.env.local` exists  |
| **Bluetooth won't connect** | Use Chrome/Edge browser    |
| **Build fails**             | Run `npm install` again    |
| **Changes not showing**     | Hard refresh: Ctrl+Shift+R |
| **Arduino not responding**  | Check HC-05 wiring         |

---

## 📚 Documentation Files

- `README.md` - Main documentation
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_STATUS.md` - Project summary
- `SETUP_GUIDE.md` - Detailed setup
- `TROUBLESHOOTING_FINAL.md` - Issue solutions

---

## 🎉 Project Status: READY ✅

**No changes needed - Push to Git anytime!**

---

Print this card for quick reference! 🖨️
