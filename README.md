<div align="center">
<img src="https://telegra.ph/file/fbe3160f0ad0e14abeeeb.jpg" width="150" height="150" border="0" alt="PFP">

# Kaguya PublicBot - MD
### Use at your own risk!

## [![JavaScript](https://img.shields.io/badge/JavaScript-d6cc0f?style=for-the-badge&logo=javascript&logoColor=white)](https://javascript.com) [![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![discord.js](https://img.shields.io/badge/discord.js-0026a3?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)

> Build with Baileys and discord.js ( as a command handler ) <br />
Untuk instalasi bahasa Indonesia [disini](./ID.md)<br />

</div><br />
<br />

## Highlights

- [x] Support WhatsApp Multi-Device
- [x] Features rich

## Instalation
Rename or create new file called `config.json`.<br />
Fill in everything needed in the `config.json` file.

### Require
1. [nodejs](https://nodejs.org/en/download) 16x/17x
2. [FFMPEG](https://ffmpeg.org)
3. [libWebP](https://developers.google.com/speed/webp/download)

### FFMPEG Instalation
- For Windows User, you can see this website, [WikiHow](https://www.wikihow.com/Install-FFmpeg-on-Windows).


- For Linux User, you can use your own package manager, below are for example

```bash
# apt
apt install ffmpeg -y

# pacman
pacman -S ffmpeg

# ...
```

### libWebP Instalation
- For Windows User, 
1. Download libWebP for Windows. [download](https://developers.google.com/speed/webp/download).
2. Extract to C:\
3. Rename extracted folder to "libwebp" (without quote)
4. on PowerShell
```cmd
setx /m PATH "C:\libwebp\bin;%PATH%"
*if successful installed, SUCCESS: specified value was saved

*check webpmux version
webpmux -version
```

- For Linux User, you can use your own package manager, below for example
```sh
# apt
apt install libwebp-dev -y

# pacman
pacman -S libwebp

# ...
```

### Cloning this repo
```sh
# clone begin
git clone https://github.com/FaizBastomi/wbot.git --branch "multi-device"

# change dir
cd wbot

# install npm dependencies
npm install
# in case @adiwajshing/baileys-md not compiled automatic
cd node_modules/@adiwajshing/baileys-md
npm run build:tsc

# run this project
node main.js
```
