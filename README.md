# Zane: Werewolf

Aplikasi mobile Werewolf offline untuk Android — dipimpin oleh 1 Operator/Moderator yang tidak ikut bermain.

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

## Role yang Tersedia

| Role | Tim | Kemampuan |
|------|-----|-----------|
| Serigala | Serigala | Tiap malam memilih 1 pemain untuk dimangsa |
| Warga | Desa | Tanpa kemampuan khusus |
| Peramal | Desa | Tiap malam mengintip role 1 pemain |
| Pelindung | Desa | Tiap malam melindungi 1 pemain dari serangan |
| Pemburu | Desa | Jika terbunuh, menarik 1 pemain ikut mati |

## Alur Permainan

1. **Setup** — Input nama pemain (min 4)
2. **Atur Role** — Atur jumlah tiap role, sisa otomatis jadi Warga
3. **Reveal** — Tiap pemain melihat role-nya secara bergantian (pass & play)
4. **Handoff** — Serahkan HP ke Operator
5. **Malam** — Operator membacakan narasi & menjalankan aksi tiap role
6. **Siang** — Pengumuman korban, diskusi, voting eliminasi
7. **Game Over** — Tampilkan pemenang & daftar role semua pemain

## Keputusan Teknis

- **Single-screen state machine**: Seluruh game dikelola satu state machine tanpa navigasi multi-screen, sesuai spesifikasi.
- **Expo SDK 57 + React Native 0.86**: Versi terbaru stabil saat pembuatan.
- **Tanpa custom font**: Menggunakan system bold sebagai fallback agar build APK tetap ringan. Font Fredoka terinstall dan siap digunakan jika ingin diaktifkan.
- **Debug keystore signing**: APK release ditandatangani dengan debug keystore bawaan React Native — cukup untuk distribusi personal.
- **Offline penuh**: Tidak ada network call, server, atau database. Semua state di memori React.
- **Pelindung tidak bisa protect target yang sama 2 malam berturut-turut**: Aturan klasik Werewolf yang diterapkan.

## Tech Stack

- React Native + Expo (TypeScript)
- Expo SDK 57
- Tanpa backend / tanpa login / tanpa database
