/*  TEMPORARY TESTING TOOLS  */

function downloadTestImage(data){
  var a = document.createElement('a');
  a.href = data;
  a.download = "testimage.png";
  document.body.appendChild(a);
  a.click();
}

/*  DEALING WITH THE ICS FORMATTING  */

//download the ICS file
function downloadICS(content){
  var a = document.createElement('a');
  var blob = new Blob([content], {type : "text/plain;charset=UTF-8"});
  a.href = window.URL.createObjectURL(blob);
  a.download = "iCal-"+getFullUTCTime()+".ics";
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  delete a;
}

//attempt to parse event data (singular events only, currently) from the rawText
function parseEventData(str){
  //the actual function will have to try to determine what info belongs to dates, summary, description, etc.
  var arr = [str];
  return arr;
}

//fix time values to 2-digits
function fixDateTime(dt){
  return ('0' + dt).slice(-2);
}

//used for DTSTAMP and filename
function getFullUTCTime(){
  const d = new Date();
  return ""+d.getUTCFullYear()+fixDateTime(d.getUTCMonth()+1)+fixDateTime(d.getUTCDate())+"T"+fixDateTime(d.getUTCHours())+fixDateTime(d.getUTCMinutes())+fixDateTime(d.getUTCSeconds())+"Z";
}

function formatICS(rawText){
  var event = parseEventData(rawText);
  
  //turn the event into the ICS file format
  var content = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CIS320CALTEAM//Calendar Snapshot v1.0//EN";
  
  //starts the actual event info
  content+="\nBEGIN:VEVENT";
  content+="\nUID:"+self.crypto.randomUUID();
  content+="\nDTSTAMP:"+getFullUTCTime();
  
  //fills in dummy info for an event that lasts 2 hours and starts at the time it was made
  const d = new Date();
  content+="\nDTSTART:"+d.getUTCFullYear()+fixDateTime(d.getUTCMonth()+1)+fixDateTime(d.getUTCDate())+"T"+fixDateTime(d.getUTCHours())+fixDateTime(d.getUTCMinutes())+fixDateTime(d.getUTCSeconds())+"Z";
  content+="\nDTEND:"+d.getUTCFullYear()+fixDateTime(d.getUTCMonth()+1)+fixDateTime(d.getUTCDate())+"T"+fixDateTime(d.getUTCHours()+2)+fixDateTime(d.getUTCMinutes())+fixDateTime(d.getUTCSeconds())+"Z";
  content+="\nSUMMARY:TEST EVENT";
  content+="\nDESCRIPTION:"+event[0];
  //actual info will be in the event array. Ex: [TZID, DTSTART, DTEND, DURATION, SUMMARY, RRULE, DESCRIPTION, LOCATION]
  
  //close the event and calendar
  content+="\nEND:VEVENT";
  content+="\nEND:VCALENDAR";
  
  //downloadICS(content);
  console.log(content);
}

/*  GRAB A SCREENSHOT, CROP IT, AND RUN TESSERACT TO RETRIEVE TEXT DATA  */

var URLs = [];

//retrieves URLs for the Tesseract worker
document.addEventListener('customEvent', function (e) {
  URLs=e.detail;
});

//attempts to pull text from selected content
const runTesseract = async (imageData) => {
  const { createWorker } = Tesseract;
  const worker = await createWorker();
  worker.workerPath = URLs[0];
  worker.langPath = URLs[1];
  worker.corePath = URLs[2];
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(imageData);
  await worker.terminate();
  
  formatICS(text);
}

//crop the canvas to the selected area
const croppedCanvas = (src) => {
  let cv2 = document.createElement('canvas');
  cv2.width = end_x-start_x;
  cv2.height = end_y-start_y;
  cv2.getContext("2d").drawImage(src,start_x+window.scrollX,start_y+window.scrollY,end_x-start_x,end_y-start_y,0,0,end_x-start_x,end_y-start_y);
  return cv2;
}

//take a screenshot of the user's screen 
function grabSelectedArea(){
  html2canvas(document.body).then(function(c) {
    const cropped_img = croppedCanvas(c).toDataURL('image/png');
    //downloadTestImage(cropped_img);
    runTesseract(cropped_img);
  });
}

/*  LISTENS FOR USER INPUT AND CREATES A (FUNCTIONALLY USELESS) RECTANGLE FOR SELECTION  */

var canvas = document.createElement('canvas');
const context = canvas.getContext("2d");
var snapmode = mousedown = false;
var start_x = start_y = end_x = end_y = 0;

//allow users to draw on the screen
function toggleSnapMode(bool){
  snapmode = bool;
  
  //set up the canvas (encompasses entire screen)
  if(snapmode){
    document.body.style.cursor = 'crosshair';
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.classList.add("cal_snap");
    canvas.style.position = "fixed";
    canvas.style.left="0px";
    canvas.style.top="0px";
    document.body.appendChild(canvas);
  }
  
  //remove the canvas
  else{
    document.body.style.cursor = 'auto';
    const e = document.getElementsByClassName("cal_snap");
    while(e.length>0){
      e[0].remove();
    }
  }
}

//toggles snapmode
document.addEventListener('keydown', function(e) {
  if(e.key == "Escape")
    toggleSnapMode(false);
  if (e.shiftKey && e.altKey && e.key == 'P')
    toggleSnapMode(!snapmode);
  
  //prevent default behavior
  //if(snapmode)
    //e.preventDefault();
});

//mark the mouse as down
document.addEventListener("mousedown", function (e) {
  mousedown = true;
  
  //if the mouse is held down, consider this the starting point of the rectangle
  start_x = parseInt(e.clientX);
  start_y = parseInt(e.clientY);
});

//mark the mouse as up
document.addEventListener("mouseup", function (e) {
  mousedown = false;
  
  //if in snapmode, consider this the end of the rectangle
  if(snapmode){
    context.clearRect(0,0,canvas.width,canvas.height);
    end_x = parseInt(e.clientX);
    end_y = parseInt(e.clientY);
    grabSelectedArea();
  }
});

//get the position of the mouse if in snapmode and mousedown
document.addEventListener("mousemove", function (e) {
  if(snapmode && mousedown){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.beginPath();
    context.rect(start_x,start_y,e.clientX-start_x,e.clientY-start_y);
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.stroke();
  }
});