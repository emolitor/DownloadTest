const { ipcRenderer } = require('electron');

global.download = (url) => {
  let control = document.getElementById("control");
  control.style.display = "none";

  console.log("download: " + url);
  ipcRenderer.send('download', url);
};

global.downloadMulti = (url) => {
    let control = document.getElementById("control");
    control.style.display = "none";

    console.log("download Multi: " + url);
    ipcRenderer.send('multidownload', url);
};

global.downloadCurl = (url) => {
  let control = document.getElementById("control");
  control.style.display = "none";

  console.log("download Curl: " + url);
  ipcRenderer.send('curlDownload', url);
};

global.downloadElectron = (url) => {
  let control = document.getElementById("control");
  control.style.display = "none";

  console.log("download Electron: " + url);
  ipcRenderer.send('electronDownload', url);
};

global.updateUX = (u) => {
  let statusContents = "";
  //let statusContents = "<pre>";
  if (u.url)
    statusContents = statusContents + "URL: " + u.url + "<br />";
  if (u.size)
    statusContents = statusContents + "Size: " + (u.size / 1024 / 1024 / 1024).toFixed(2) + "GB<br />";
  if (u.statusCode)
    statusContents = statusContents + "Status Code: " + u.statusCode + "<br />";
  if (u.headers)
    statusContents = statusContents + "<br />Headers<pre>" + u.headers + "</pre>";
  if (u.startDate)
    statusContents = statusContents + "Start: " + u.startDate.toLocaleString() + "<br />";
  if (u.percent)
    statusContents = statusContents + "Percent: " + Math.floor(u.percent * 100) + "&percnt;<br />";
  if (u.elapsedSeconds)
    statusContents = statusContents + "elapsedSeconds: " + u.elapsedSeconds + "<br />";
  if (u.elapsedBytes) {
    statusContents = statusContents + "elapsedSize: (" + u.elapsedBytes + ") ";
    //statusContents = statusContents + "elapsedKB: " + (u.elapsedBytes / 1024).toFixed(2) + "\n";
    statusContents = statusContents + (u.elapsedBytes / 1024 / 1024).toFixed(2) + "MB ";
    statusContents = statusContents + (u.elapsedBytes / 1024 / 1024 / 1024).toFixed(2) + "GB<br />";
  }
  if (u.bytesPerSecond) {
    statusContents = statusContents + "throughput: (" + u.bytesPerSecond + ") ";
    statusContents = statusContents + (u.bytesPerSecond / 1024 / 1024).toFixed(2) + "MBs<br />";
  }
  if (u.doneDate)
    statusContents = statusContents + "done: " + u.doneDate.toLocaleString() + "<br />";
  //statusContents = statusContents + "</pre>";

  document.getElementById("status").innerHTML = statusContents
};

ipcRenderer.on('update', (event, u)=>{
  console.log("update: " + JSON.stringify(u));
  updateUX(u)
});
