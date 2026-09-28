# <img src="resources/icons/128x128.png" width="32"> fig-linux

[English](README.md) | **Português (Brasil)**

fig-linux é um app desktop não oficial do [Figma](https://figma.com) para Linux, baseado em [Electron](https://www.electronjs.org).

Não é afiliado, endossado ou patrocinado pela Figma, Inc. "Figma" é marca registrada da Figma, Inc.

<p align="center">
	<img src="images/banner.png">
</p>

## Instalação

Baixe o pacote da sua distro na
[última release](https://github.com/carlosoliveiras/fig-linux/releases/latest)
(versão atual: **0.12.0**).

| Distro | Arquivo |
|---|---|
| Debian / Ubuntu | `fig-linux_<versão>_linux_amd64.deb` |
| Fedora / openSUSE | `fig-linux_<versão>_linux_x86_64.rpm` |
| Arch / Manjaro | `fig-linux_<versão>_linux_x64.pacman` |
| Qualquer distro | `fig-linux_<versão>_linux_x86_64.AppImage` ou `fig-linux_<versão>_linux_x64.zip` |

### Distros baseadas em Debian

```bash
sudo apt install ./fig-linux_*_linux_amd64.deb
```

### Distros baseadas em RPM

```bash
sudo dnf install ./fig-linux_*_linux_x86_64.rpm
```

### Distros baseadas em Arch

```bash
sudo pacman -U fig-linux_*_linux_x64.pacman
```

### AppImage

```bash
chmod +x fig-linux_*.AppImage
sudo ./fig-linux_*.AppImage -i
```
Isso instala o fig-linux no sistema; depois é só abrir pelo terminal ou pela lista de apps.
Rode `./fig-linux_*.AppImage -h` para ver mais opções.

### Vindo do figma-linux

Na primeira execução, o fig-linux copia configurações, sessão e temas de
`~/.config/figma-linux` para `~/.config/fig-linux`. O diretório antigo fica intacto,
então dá para apagá-lo quando tudo estiver funcionando.

## Compilando a partir do código-fonte

1. Clone o repositório:
```bash
git clone https://github.com/carlosoliveiras/fig-linux
cd fig-linux
```
2. Instale as dependências:
```bash
npm i
```

Depois:

- `npm run dev` roda o app em modo de desenvolvimento
- `npm run build` gera o build de produção
- `npm run start` gera o build e roda o app
- `npm run builder` empacota o app. Os alvos ficam em `./config/builder.json`; remova os que não precisar ou cujas dependências não tiver.
- `npm run pack` apaga pacotes antigos do diretório de instaladores, gera o build e empacota. O alvo AppImage precisa do [AppImageTool](https://appimage.github.io/appimagetool/).

Exemplo de **.env** para desenvolvimento local:
```
NODE_ENV=dev
DEV_PANEL_PORT=3330
DEV_SETTINGS_PORT=3331
```

## Créditos

O fig-linux é baseado no [figma-linux](https://github.com/Figma-Linux/figma-linux),
de Chugunov Roman e colaboradores.

## Licença

GPL-2.0, veja [LICENSE](LICENSE).
