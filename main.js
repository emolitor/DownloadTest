//const electron = require('electron')
const {app, BrowserWindow, ipcMain} = require('electron')
const {download} = require('electron-dl')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let mainMenu

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 600, webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {

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

var info = {}

ipcMain.on('download', (event, url) => {
  info.startDate = new Date()
  info.url = url
  //console.log("download start: " + JSON.stringify(info))
  mainWindow.webContents.send('update', info)

  download(mainWindow, info.url, {
    onStarted: (dl) => {
      info.size = dl.getTotalBytes();
      info.startDate = new Date()
      mainWindow.webContents.send('update', info)
    },
    onProgress: (progress) => { 
      info.percent = progress 
      info.elapsedSeconds = Math.floor((new Date().getTime() - info.startDate.getTime()) / 1000);
      info.elapsedBytes = Math.floor(info.size * info.percent);

      if (info.elapsedSeconds > 0) {
        info.bytesPerSecond = Math.floor(info.elapsedBytes / info.elapsedSeconds);
      }

      if (mainWindow && mainWindow.webContents) 
        mainWindow.webContents.send('update', info)

      //console.log("download update: " + JSON.stringify(info))
    }
  })
    .then(dl => {
      info.doneDate = new Date()
      //console.log("download done: " + JSON.stringify(info))
      if (mainWindow && mainWindow.webContents) 
        mainWindow.webContents.send('update', info)
    })
    .catch(console.error);
})
