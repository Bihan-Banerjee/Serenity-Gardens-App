# Serenity Gardens

React + TypeScript (Vite) app wrapped for Android with Capacitor. Backend: existing Render API (`src/lib/api.ts`).

- `npm run dev` - web dev server
- `npm run build` - typecheck + production build into `dist/`
- `npm run android` - build, sync, open in Android Studio
- `npm run apk` - build debug APK -> `android/app/build/outputs/apk/debug/app-debug.apk`

Capacitor 8 needs **JDK 21** (Android Studio's bundled JBR works): set `JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"`.
Set `VITE_RAZORPAY_KEY_ID` in `.env` (see `.env.example`).
