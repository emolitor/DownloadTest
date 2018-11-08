//const electron = require('electron')
const {app, BrowserWindow, ipcMain} = require('electron');
const {download} = require('electron-dl');
const path = require('path');
const request = require('request');

const MultipartDownload = require('multipart-download');
const os = require('os');

var Curl = require('node-libcurl').Curl;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 800, webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });
  
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=> {
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
  app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

let info = {};

ipcMain.on('curlDownload', (event, url) => {
  info.startDate = new Date();
  info.url = url;
  info.elapsedBytes = 0;
  info.headers = "";

  const curl = new Curl();
  curl.setOpt('URL', url);

  curl.setOpt('FOLLOWLOCATION', 1);
  curl.setOpt('VERBOSE', 1);

  console.log("AppPath:" + app.getAppPath());

  curl.setOpt(Curl.option.CAINFO,  app.getAppPath() + path.sep  + "cacert.pem");
  curl.setOpt('SSL_VERIFYHOST', 2); //This is not a boolean field! 0 -> Disabled, 2 -> Enabled
  curl.setOpt('SSL_VERIFYPEER', 1);
  //curl.setOpt('SSL_VERIFYHOST', 0);
  //curl.setOpt('SSL_VERIFYPEER', 0);

  curl.setOpt(Curl.option.NOPROGRESS, false);

  //Since we are downloading a large file, disable internal storage
  // used for automatic http data/headers parsing.
  //Because of that, the end event will receive null for both data/header arguments.
  curl.enable(Curl.feature.NO_STORAGE);

  // The option XFERINFOFUNCTION was introduced in curl version 7.32.0,
  // versions older than that should use PROGRESSFUNCTION.
  // if you don't want to mess with version numbers,
  // there is the following helper method to set the progress cb.
  curl.setProgressCallback(function(dltotal, dlnow /*, ultotal, ulnow*/) {
    if(dltotal === 0)
      return 0;

    info.elapsedSeconds = Math.floor((new Date().getTime() - info.startDate.getTime()) / 1000);

    info.size = dltotal;
    info.elapsedBytes = dlnow;

    if (info.elapsedSeconds > 0) {
      info.bytesPerSecond = Math.floor(info.elapsedBytes / info.elapsedSeconds);
    }

    mainWindow.webContents.send('update', info);

    //console.log("dltotal:" + dltotal);
    //console.log("dlnow:" + dlnow);
    return 0;
  });

  // This is the same than the data event, however,
// keep in mind that here the return value is considered.
  curl.setOpt(Curl.option.WRITEFUNCTION, function(chunk) {
    //fs.appendFileSync(outputFile, chunk);

    //console.log("write:" + chunk.length);
    mainWindow.webContents.send('update', info);

    return chunk.length;
  });

  curl.on('header', function(chunk) {
    var textChunk = chunk.toString('utf8');
    info.headers = info.headers + textChunk;
    mainWindow.webContents.send('update', info);
  });

  curl.on('end', function() {
    info.doneDate = new Date();
    mainWindow.webContents.send('update', info);

    console.log('Download ended');
    curl.close();
  });

  curl.on('error', function(err) {
    console.log('Failed to download file', err);
    curl.close();
  });

  curl.perform();
});

ipcMain.on('multidownload', (event, url) => {
    info.startDate = new Date();
    info.url = url;
    info.elapsedBytes = 0;

    request.head(url).on('response', function(response) {
        info.statusCode = response.statusCode;
        info.headers = "";

        let headers = response.headers;
        for (const k in headers){
            if (k === "content-length")
              info.size = headers[k];
            info.headers = info.headers + `${k}=${headers[k]}\n`;
        }
    });

    mainWindow.webContents.send('update', info);

    new MultipartDownload()
        .start(url, {
            numOfConnections: 5,
            saveDirectory: os.homedir() + "/Downloads",
        })
        .on('error', (err) => {
            console.log(JSON.stringify(err));
        })
        .on('data', (data, offset) => {
            info.elapsedBytes = info.elapsedBytes + data.length;
            info.elapsedSeconds = Math.floor((new Date().getTime() - info.startDate.getTime()) / 1000);

            if (info.size)
                info.percent = info.elapsedBytes / info.size;

            if (info.elapsedSeconds > 0) {
                info.bytesPerSecond = Math.floor(info.elapsedBytes / info.elapsedSeconds);
            }

            mainWindow.webContents.send('update', info);
        })
        .on('end', (output) => {
            console.log(`Downloaded file path: ${output}`);
            info.doneDate = new Date();
            mainWindow.webContents.send('update', info);
        });
});

ipcMain.on('download', (event, url) => {
  info.startDate = new Date();
  info.url = url;

  request.head(url).on('response', function(response) {
    info.statusCode = response.statusCode;
    info.headers = "";

    let headers = response.headers;
    for (const k in headers){
      info.headers = info.headers + `${k}=${headers[k]}\n`;
    }
  });

  mainWindow.webContents.send('update', info);

  download(mainWindow, info.url, {
    onStarted: (dl) => {
      info.size = dl.getTotalBytes();
      info.startDate = new Date();
      mainWindow.webContents.send('update', info);
    },
    onProgress: (progress) => { 
      info.percent = progress;
      info.elapsedSeconds = Math.floor((new Date().getTime() - info.startDate.getTime()) / 1000);
      info.elapsedBytes = Math.floor(info.size * info.percent);

      if (info.elapsedSeconds > 0) {
        info.bytesPerSecond = Math.floor(info.elapsedBytes / info.elapsedSeconds);
      }

      if (mainWindow && mainWindow.webContents) 
        mainWindow.webContents.send('update', info);

      //console.log("download update: " + JSON.stringify(info))
    }
  }).then(dl => {
      info.doneDate = new Date();
      //console.log("download done: " + JSON.stringify(info))
      if (mainWindow && mainWindow.webContents) 
        mainWindow.webContents.send('update', info);
    })
    .catch(console.error);
});
