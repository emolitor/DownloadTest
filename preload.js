const { remote } = require('electron');
const mainProcess = remote.require('./main.js');

global.download = (url) => {
  document.getElementById("control").style.display = "none";

  console.log("download: " + url);
  mainProcess.download(url);
};

global.downloadCurl = (url) => {
  document.getElementById("control").style.display = "none";

  console.log("download Curl: " + url);
  mainProcess.curlDownload(url);
};

global.downloadElectron = (url) => {
  document.getElementById("control").style.display = "none";

  console.log("download Electron: " + url);
  mainProcess.electronDownload(url);
};

global.updateUX = (u) => {
  let statusContents = "";

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
    statusContents = statusContents + (u.elapsedBytes / 1024 / 1024).toFixed(2) + "MB ";
    statusContents = statusContents + (u.elapsedBytes / 1024 / 1024 / 1024).toFixed(2) + "GB<br />";
  }
  if (u.bytesPerSecond) {
    statusContents = statusContents + "throughput: (" + u.bytesPerSecond + ") ";
    statusContents = statusContents + (u.bytesPerSecond / 1024 / 1024).toFixed(2) + "MBs<br />";
  }
  if (u.doneDate)
    statusContents = statusContents + "done: " + u.doneDate.toLocaleString() + "<br />";

  document.getElementById("status").innerHTML = statusContents
};

setInterval(function() {
  var info = mainProcess.getInfo();
  console.log(info);
  updateUX(info)
}, 500);

