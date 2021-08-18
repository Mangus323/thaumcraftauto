import {app, BrowserWindow, ipcMain} from "electron"
import * as path from "path"
import {format as formatUrl} from "url"
import {startScript} from "./script";

const isDevelopment = process.env.NODE_ENV !== "production"

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null


function createMainWindow() {
    //screen.getPrimaryDisplay().workAreaSize
    const window = new BrowserWindow({
        webPreferences: {nodeIntegration: true},
        height: 200,
        width: 200
    })
    //Menu.setApplicationMenu(null)
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

    startScript();


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


ipcMain.on('asynchronous-message', (event) => {
    event.returnValue = "aspectsImages;"
})


