const { ipcRenderer } = require('electron');

global.download= (url) => {
  var control = document.getElementById("control")
  control.style.display = "none"

  console.log("download: " + url);
  ipcRenderer.send('download', url);
};

global.updateUX = (u) => {
  var statusContents = "<pre>";
  if (u.url)
    statusContents = statusContents + "URL: " + u.url + "\n";
  if (u.size)
    statusContents = statusContents + "Size: " + (u.size / 1024 / 1024 / 1024).toFixed(2) + "GB\n";
  if (u.startDate)
    statusContents = statusContents + "Start: " + u.startDate.toLocaleString() + "\n";
  if (u.percent)
    statusContents = statusContents + "Percent: " + Math.floor(u.percent * 100) + "&percnt;\n";
  if (u.elapsedSeconds)
    statusContents = statusContents + "elapsedSeconds: " + u.elapsedSeconds + "\n";
  if (u.elapsedBytes) {
    statusContents = statusContents + "elapsedSize: (" + u.elapsedBytes + ") ";
    //statusContents = statusContents + "elapsedKB: " + (u.elapsedBytes / 1024).toFixed(2) + "\n";
    statusContents = statusContents + (u.elapsedBytes / 1024 / 1024).toFixed(2) + "MB ";
    statusContents = statusContents + (u.elapsedBytes / 1024 / 1024 / 1024).toFixed(2) + "GB\n";
  }
  if (u.bytesPerSecond) {
    statusContents = statusContents + "throughput: (" + u.bytesPerSecond + ") ";
    statusContents = statusContents + (u.bytesPerSecond / 1024 / 1024).toFixed(2) + "MBs \n";
  }
  if (u.doneDate)
    statusContents = statusContents + "done: " + u.doneDate.toLocaleString() + "\n";
  statusContents = statusContents + "</pre>";

  document.getElementById("status").innerHTML = statusContents
  //statusUX.innerHTML = "<pre>" + 
//		'Start          :' + startDate + '\n' +
//		'Percent        :' + percentage + '&percnt;\n' +
//		'Elapsed Seconds:' + elapsedSeconds + '\n' +
//		'Done           :' + doneDate + '\n' +
//		"</pre>"
}

ipcRenderer.on('update', (event, u)=>{
  console.log("update: " + JSON.stringify(u));
  updateUX(u)
})
