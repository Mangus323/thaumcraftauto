import {app, BrowserWindow, ipcMain, Menu} from "electron"
import * as path from "path"
import {format as formatUrl} from "url"
import {startScript} from "./script";
import {getBuffer} from "./preview";

const isDevelopment = process.env.NODE_ENV !== "production"

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null

function createMainWindow() {
    //screen.getPrimaryDisplay().workAreaSize
    const window = new BrowserWindow({
        webPreferences: {nodeIntegration: true},
        height: 680,
        width: 600
    })
    Menu.setApplicationMenu(null)
    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
            .catch(e => console.log(e))
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true
        })).catch(e => console.log(e))
    }


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

//create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow()
})


let clicked = 0
ipcMain.on('asynchronous-message', (event) => {
    startScript(clicked++)
        .then(getBuffer)
        .then(e => event.returnValue = e)
        .catch(e => {
            console.log(e)
            event.returnValue = "err"
        })
})


