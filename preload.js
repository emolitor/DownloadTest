const { ipcRenderer } = require('electron');

var startDate = ""
var doneDate = ""
var percentage = ""

global.download= (url) => {
  var control = document.getElementById("control")
  control.style.display = "none"

  console.log("download: " + url);
  ipcRenderer.send('download', url);
};

global.updateUX = () => {
  var statusUX = document.getElementById("status")
  statusUX.innerHTML = "<pre>" + 
		'Start   :' + startDate + '\n' +
		'Percent :' + percentage + '&percnt;\n' +
		'Done    :'+ doneDate + '\n' +
		"</pre>"
}

ipcRenderer.on('update', (event, percent)=>{
  console.log("update: " + percent);
  percentage = percent
  updateUX()
})

ipcRenderer.on('start', (event, date)=>{
  console.log("start: " + date);
  startDate = date
  updateUX()
})


ipcRenderer.on('done', (event, date)=>{
  console.log("done: " + date);
  doneDate = date
  updateUX()
})
