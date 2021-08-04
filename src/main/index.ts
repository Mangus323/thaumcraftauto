import {app, BrowserWindow, ipcMain} from "electron"
import * as path from "path"
import {format as formatUrl} from "url"
import pixelmatch from "pixelmatch";
import screenshot from "screenshot-desktop";
import Jimp from "Jimp";
import {PNG} from "pngjs";
import fs from "fs";

const isDevelopment = process.env.NODE_ENV !== "production"

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null
const interval = 64

async function checkScreen(screenshot: Jimp) {
    let fullscreen = screenshot.resize(1920, 1080)
    let mask = await Jimp.read("images/mask.png") // убрать числа

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            await compareImages(fullscreen.clone(), mask, "aer", 490 + interval * i, 185 + interval * j, i, j)
                .catch(e => console.log(e))
        }
    }

}

async function compareImages(fullscreen: Jimp, mask: Jimp, aspectName: string, x: number, y: number, a: number, b: number) {
    let aspect = await Jimp.read(`images/aspects/${aspectName}.png`)

    let capturedAspect = fullscreen
        .crop(x, y, 60, 60)
        .mask(mask, 0, 0)
        //.write(`[${a},${b}].png`)
    //const diff = new PNG({width: 60, height: 60})
    let number = pixelmatch(aspect.bitmap.data, capturedAspect.bitmap.data, null, 60, 60)
    console.log(number + " " + x + " " + y + " " + a + " " + b)

    //fs.writeFileSync('diff.png', PNG.sync.write(diff))
}

function createMainWindow() {
    //screen.getPrimaryDisplay().workAreaSize
    const window = new BrowserWindow({
        webPreferences: {nodeIntegration: true},
        height: 600,
        width: 800
    })
    //Menu.setApplicationMenu(null)
    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true
        }))
    }

    screenshot({format: 'png'}).then((screenshot) => {
        Jimp.read(screenshot).then(screenshot => {
            setTimeout(() => {
                checkScreen(screenshot)
            }, 5000);


        })
    })


    window.on("closed", () => {
        mainWindow = null
    })

    window.webContents.on("devtools-opened", () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window

}

// quit application when all windows are closed
app.on("window-all-closed", () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow()
    }
})

// create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow()
})


ipcMain.on('asynchronous-message', (event, arg) => {
    //event.returnValue = screen
})


