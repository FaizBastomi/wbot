<div align="center">
<img src="https://telegra.ph/file/fbe3160f0ad0e14abeeeb.jpg" width="150" height="150" border="0" alt="PFP">

# Kaguya PublicBot - MD
### Use at your own risk!

## [![JavaScript](https://img.shields.io/badge/JavaScript-d6cc0f?style=for-the-badge&logo=javascript&logoColor=white)](https://javascript.com) [![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

> [Legacy](https://github.com/FaizBastomi/wbot/tree/legacy) branch <br />
Untuk instalasi bahasa Indonesia lihat [disini](./ID.md)<br />

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

- [x] Support Multi-Device Conneciton
- [x] Features rich
- [x] Easy to maintenance

## TODO
For a to do list, see here [#1](https://github.com/FaizBastomi/wbot/issues/1)

## Instalation
### Config
Rename `config.json.example` to `config.json` or create new file called `config.json`.<br />
Fill in everything needed in the `config.json` file (follow `config.json.example`).<br />
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
Use international phone number format and always add _@s.whatsapp.net_ (e.g. `6282122232224@s.whatsapp.net`)

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

### Require
1. [nodejs](https://nodejs.org/en/download) 16x/17x
2. [ffmpeg](https://ffmpeg.org)
3. [libwebp](https://developers.google.com/speed/webp/download)

### Ffmpeg Instalation
- For Windows User, you can see this website, [WikiHow](https://www.wikihow.com/Install-FFmpeg-on-Windows).<br />
- For Linux User, you can use your own package manager, below are for example

```bash
# apt
apt install ffmpeg -y

# pacman
pacman -S ffmpeg
```

### libWebP Instalation
- For Windows User, 
1. Download libWebP for Windows. [download](https://developers.google.com/speed/webp/download).
2. Extract to C:\
3. Rename extracted folder to `libwebp`
4. on PowerShell
```cmd
setx /m PATH "C:\libwebp\bin;%PATH%"
```
> if libWebP properly isntalled. Check it with this command in Command Prompt
```cmd
webpmux -version
```

- For Linux User, you can use your own package manager, below for example
```bash
# apt
apt install libwebp-dev -y

# pacman
pacman -S libwebp
```

### Cloning this repo
```bash
# clone begin
git clone https://github.com/FaizBastomi/wbot.git --branch "multi-device"

# change dir
cd wbot

# install npm dependencies
npm install
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