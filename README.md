# <img src="resources/icons/128x128.png" width="32"> fig-linux

fig-linux is an unofficial [Electron](https://www.electronjs.org)-based [Figma](https://figma.com) desktop app for Linux.

It is not affiliated with, endorsed or sponsored by Figma, Inc. "Figma" is a trademark of Figma, Inc.

<p align="center">
	<img src="images/screenshot1.jpg">
</p>

## Installation

Packages (`.deb`, `.rpm`, `pacman`, AppImage and `.zip`) are published on the
[Releases](https://github.com/carlosoliveiras/fig-linux/releases) page when available.
Until then, build them from source as described below.

### AppImage

```bash
chmod +x fig-linux-*.AppImage
sudo ./fig-linux-*.AppImage -i
```
This installs fig-linux on your system, after which you can run it from a terminal or from your app list.
Run `./fig-linux-*.AppImage -h` for more options.

### Debian-based distros

```bash
sudo apt install ./fig-linux_*_amd64.deb
```

### RPM-based distros

```bash
sudo dnf install ./fig-linux-*.x86_64.rpm
```

### Coming from figma-linux

On the first run, fig-linux copies your settings, session and themes from
`~/.config/figma-linux` to `~/.config/fig-linux`. The old directory is left as is,
so you can remove it once everything works.

## Building from source

1. Clone the repository:
```bash
git clone https://github.com/carlosoliveiras/fig-linux
cd fig-linux
```
2. Install the dependencies:
```bash
npm i
```

Then:

- `npm run dev` to run the app in development mode
- `npm run build` to build the app for production
- `npm run start` to build and run it
- `npm run builder` to package the app. The targets are listed in `./config/builder.json`; remove the ones you don't need or don't have dependencies for.
- `npm run pack` to remove old packages from the installer directory, then build and package the app. The AppImage target needs [AppImageTool](https://appimage.github.io/appimagetool/).

Example of **.env** for local development:
```
NODE_ENV=dev
DEV_PANEL_PORT=3330
DEV_SETTINGS_PORT=3331
```

## Credits

fig-linux is based on [figma-linux](https://github.com/Figma-Linux/figma-linux)
by Chugunov Roman and contributors.

## License

GPL-2.0, see [LICENSE](LICENSE).
