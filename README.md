# Zane: Werewolf

Aplikasi mobile Werewolf offline untuk Android — mendukung 2 mode permainan: dengan Operator manusia atau HP otomatis jadi Operator (dengan suara).

## Cara Menjalankan Lokal

```bash
npm install
npx expo start
```

Scan QR code dengan Expo Go di HP, atau tekan `a` untuk membuka Android emulator.

## Cara Mendapatkan APK dari GitHub Actions

1. Push kode ke branch `main` di GitHub:
   ```bash
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. Buka tab **Actions** di repository GitHub.
3. Klik workflow **"Build Android APK"** yang sedang/sudah berjalan.
4. Setelah selesai (hijau), scroll ke bawah ke bagian **Artifacts**.
5. Download **werewolf-malam-apk**.
6. Extract ZIP, install `app-release.apk` ke HP (aktifkan "Install from Unknown Sources").

Workflow juga bisa dipicu manual via tombol **"Run workflow"** di tab Actions.

## 2 Mode Permainan

### Mode 1: Dengan Operator
1 orang jadi moderator memegang HP, membaca skrip narasi sendiri, dan mencatat aksi malam/siang. Mode klasik.

### Mode 2: HP Jadi Operator (Bersuara)
Tanpa moderator manusia. HP yang jadi operator:
- Membacakan semua narasi malam/siang dengan **Text-to-Speech** (Bahasa Indonesia)
- Mengatur giliran pass-and-play: tiap pemain mengambil HP untuk aksi rahasianya
- Voting siang pass-and-play: tiap pemain memilih secara rahasia, HP menghitung suara
- Mengumumkan hasil dengan suara

## Fitur Suara (TTS)

- Menggunakan `expo-speech` dengan bahasa `id-ID`
- Pengaturan: toggle Suara On/Off + slider Kecepatan bicara (0.5x - 2.0x)
- Fallback aman: jika perangkat tidak punya suara Indonesia, pakai default atau lewati

### Cara Mengetes Suara
- **Tes di HP Android asli** (via Expo Go atau APK), bukan simulator
- Jika suara tidak keluar, buka **Setelan Android > Bahasa & Input > Text-to-Speech**:
  - Pastikan engine TTS aktif (biasanya Google TTS)
  - Pastikan bahasa **Indonesia** terinstall sebagai voice data
  - Tes di setelan TTS Android dulu untuk memastikan berfungsi
- Di menu utama app ada tombol **Pengaturan Suara** untuk tes langsung

## Role yang Tersedia

| Role | Tim | Kemampuan |
|------|-----|-----------|
| Serigala | Serigala | Tiap malam memilih 1 pemain untuk dimangsa |
| Warga | Desa | Tanpa kemampuan khusus |
| Peramal | Desa | Tiap malam mengintip role 1 pemain |
| Pelindung | Desa | Tiap malam melindungi 1 pemain dari serangan |
| Pemburu | Desa | Jika terbunuh, menarik 1 pemain ikut mati |

## Alur Permainan

1. **Pilih Mode** — Operator manual atau HP otomatis
2. **Setup** — Input nama pemain (min 4)
3. **Atur Role** — Atur jumlah tiap role, sisa otomatis jadi Warga
4. **Reveal** — Tiap pemain melihat role-nya secara bergantian (pass & play)
5. **Handoff** — Serahkan HP ke Operator (atau mulai malam otomatis)
6. **Malam** — Aksi serigala, peramal, pelindung (manual atau pass-and-play)
7. **Siang** — Pengumuman korban, diskusi, voting eliminasi
8. **Game Over** — Tampilkan pemenang + daftar role semua pemain

## Keputusan Teknis

- **Single-screen state machine**: Seluruh game dikelola satu state machine tanpa navigasi multi-screen.
- **Expo SDK 57 + React Native 0.86**: Versi terbaru stabil saat pembuatan.
- **expo-speech untuk TTS**: Text-to-Speech native Android/iOS dengan fallback jika bahasa Indonesia tidak tersedia.
- **expo-haptics untuk feedback**: Haptic feedback pada interaksi (tap, select, warning).
- **Animasi native**: Twinkling stars, card flip, FadeIn transitions, bounce buttons — semua pakai `useNativeDriver`.
- **Debug keystore signing**: APK release ditandatangani debug keystore — cukup untuk distribusi personal.
- **Offline penuh**: Tidak ada network call, server, atau database. Semua state di memori React.
- **Pelindung tidak bisa protect target yang sama 2 malam berturut-turut**: Aturan klasik Werewolf.

## Tech Stack

- React Native + Expo (TypeScript)
- Expo SDK 57
- expo-speech (TTS narasi)
- expo-haptics (feedback sentuhan)
- @react-native-community/slider (pengaturan kecepatan)
- Tanpa backend / tanpa login / tanpa database
