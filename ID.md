<div align="center">
<img src="https://telegra.ph/file/fbe3160f0ad0e14abeeeb.jpg" width="150" height="150" border="0" alt="PFP">

# Kaguya PublicBot - MD
### Use at your own risk!

## [![JavaScript](https://img.shields.io/badge/JavaScript-d6cc0f?style=for-the-badge&logo=javascript&logoColor=white)](https://javascript.com) [![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

> [Legacy](https://github.com/FaizBastomi/wbot/tree/legacy) branch <br />

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
- [Contributing](#contributing)
- [Contributors](#contributors)

## Highlights

- [x] Mendukung Multi Perangkat
- [x] Banyak Fitur
- [x] Mudah untuk dirawat/diperbaiki

## TODO
Untuk to do list bisa dilihat disini [#1](https://github.com/FaizBastomi/wbot/issues/1)

## Instalasi
### Config
Ganti nama atau buat baru file bernama `config.json`.<br />
Isi semua yang dibutuhkan di file `config.json` berdasarkan `config.json.example`.<br />
```ts
{
    "botName": "SMH BOT",			// Your Bot Name
    "owner": [					// Your phone number or friend
        "Your_Phonenumber@s.whatsapp.net",
        "another_one@s.whatsapp.net"
    ],
    "openWeather": "OpenWeather_APIkey",	// OpenWeather API
    "igCookie": "Instagram_Cookie",		// Instagram Cookie
    "session": "session-md.json",		// Session filename
    "user_db": "users-db.json",			// User DB filename
    "chat_store": "baileys-store.json",		// Chat Store
    "timezone": "Asia/Jakarta",			// Your timezone (for cron and moment-timezone)
    "footer": "Kaguya PublicBot • FaizBastomi",	// Footer for some message
    "tier": {					// Premium Tier
        "drakath": 200,
        "nulgath": 500,
        "artix": 999
    }
}
```
- Phone Number<br>
Gunakan format internasional dan selalu tambahkan _@s.whatsapp.net_ (e.g. `6282122232224@s.whatsapp.net`)

OpenWeather API get from [openweathermap.org](https://openweathermap.org).

### Plugin/Command config
- config set
```ts
{
	"name": string,
	"desc": string,
	"use": string,
	"alias": string[],
	"cooldown": number,
	"limit": boolean,
	"consume": number,
	"premium": boolean,
	"premiumType": string[],
	"owner": boolean,
	async exec({ msg, sock, args, arg, isOwner }) { }
}
```
- example
```ts
{
	"name": "igdl",
	"desc": "Instagram Downloader",
	"use": "<link>",
	"alias": ["instagramdl"],
	"cooldown": 3,
	"limit": true,
	"consume": 2,
	"premium": true,
	"premiumType": ["drakath", "nulgath", "artix"],
	"owner": false,
	async exec({ msg, sock, args, arg, isOwner }) { }
}
```

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
```

### Start Bot
Start and Scan QR<br />
1. MD Connection
```
npm run start
# or
node ./lib/connect.js
```

## Contributing
Pull requests are welcome. Your contribution is helping me a lot :^)

## Contributors
<a href="https://github.com/FaizBastomi/wbot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=FaizBastomi/wbot" />
</a>

Made with [contrib.rocks](https://contrib.rocks).