<div align="center">
<img src="https://telegra.ph/file/fbe3160f0ad0e14abeeeb.jpg" width="150" height="150" border="0" alt="PFP">

# Kaguya PublicBot - MD
### Use at your own risk!

## [![JavaScript](https://img.shields.io/badge/JavaScript-d6cc0f?style=for-the-badge&logo=javascript&logoColor=white)](https://javascript.com) [![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![discord.js](https://img.shields.io/badge/discord.js-0026a3?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)

> Build with Baileys and discord.js ( as a command handler ) <br />

</div><br />
<br />

## Content
- [Highlights](#highlights)
- [TODO](#todo)
- [Instalation](#instalation)
    - [Require](#require)
    - [Ffmpeg](#ffmpeg-instalation)
    - [LibWebP](#libwebp-instalation)
    - [Cloning Repo](#cloning-this-repo)
    - [Start Bot](#start-bot)

## Highlights

- [x] Mendukung Koneksi Legacy dan Multi Perangkat
- [x] Banyak Fitur
- [x] Mudah untuk dirawat/diperbaiki

## Instalasi
Ganti nama atau buat baru file bernama `config.json`.<br />
Isi semua yang dibutuhkan di file `config.json` berdasarkan `config.json.example`.<br />
[OpenWeather API](https://openweathermap.org)

## TODO
Untuk to do list bisa dilihat disini [#1](https://github.com/FaizBastomi/wbot/issues/1)

### Dibutuhkan
1. [nodejs](https://nodejs.org/en/download) 16x/17x
2. [ffmpeg](https://ffmpeg.org)
3. [libWebP](https://developers.google.com/speed/webp/download)

### Instalasi Ffmpeg
- Untuk pengguna Windows, kamu bisa lihat tutorial disini [WikiHow](https://www.wikihow.com/Install-Ffmpeg-on-Windows)<br />
- Untuk pengguna Distribusi Linux, kamu bisa pakai manager paket kamu sendiri. Contohnya;
```bash
# apt (Ubuntu)
apt install ffmpeg -y

# pacman (Arch Linux)
pacman -S ffmpeg
```

### Instalasi libWebP
- Untuk pengguna Windows,
1. Unduh libWebP untuk Windows dari [sini](https://developers.google.com/speed/webp/download)
2. Ekstrak ke C:\
3. Ganti nama folder yang diekstrak ke `libwebp`
4. Buka PowerShell dan jalankan perintah berikut;
```cmd
setx /m PATH "C:\libwebp\bin;%PATH%"
```
> Bila sukses terinstal dengan baik, silahkan check dengan perintah berikut di Command Prompt
```cmd
webpmux -version
```

- Untuk pengguna Distribusi Linux, kamu bisa pakai manager paket kamu. Contohnya;
```bash
# apt (Ubuntu)
apt install libwebp-dev -y

# pacman (Arch Linux)
pacman -S libwebp
```

### Mengkloning Repo ini
```bash
# kloning dimulai
git clone https://github.com/FaizBastomi/wbot.git --branch "multi-device"

# ubah posisi direktori kamu
cd wbot

# install semua dependensi
npm install
# or
yarn install

# bila depedensi @adiwajshing/baileys tidak terkompilasi secara otomatis
cd ./node_modules/@adiwajshing/baileys
npm install -g typescript # jalankan sebagai root atau admin (Windows)
npm run build:tsc
```

### Start Bot
Start and Scan QR<br />
1. MD Connection
```
npm run start
```
2. Legacy Connection
```
npm run legacy
```