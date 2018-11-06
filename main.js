const electron = require('electron')
const {download} = require('electron-dl')
const path = require('path')

// Module to control application life.
const app = electron.app

// // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  console.log("Create Window fired")

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    console.log("closed fired");

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=> {
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
  app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

var startDate

electron.ipcMain.on('download', (event, url) => {
  startDate = new Date().toLocaleString()
  console.log("download start("+ startDate + "): " + url)
  mainWindow.webContents.send('start', startDate)

  download(mainWindow, url, {
    onProgress: (progress) => { 
      const percent = Math.floor( progress *100)
      if (mainWindow && mainWindow.webContents) 
        mainWindow.webContents.send('update', percent)
    }
  })
    .then(dl => mainWindow.webContents.send('done', new Date().toLocaleString()) )
    .catch(console.error);
})
