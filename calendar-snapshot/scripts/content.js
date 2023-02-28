
//download the content as an ICS file
function downloadICS(content){
  var a = document.createElement('a');
  var blob = new Blob([content], {type : "text/plain;charset=UTF-8"});
  a.href = window.URL.createObjectURL(blob);
  const d = new Date();
  //current filename is just iCal-YYYYMMDD-HHMM.ics
  a.download = "iCal-"+d.getFullYear()+(d.getMonth()+1)+d.getDate()+"-"+d.getHours()+d.getMinutes()+".ics";
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  delete a;
}

function testPrint(content){
  console.log(content);
}

function fixDateTime(dt){
  return ('0' + dt).slice(-2);
}

//format necessary content in ICS format
function formatICS(arr){
  //calendar general info
  var formattedContent = "BEGIN:VCALENDAR\nVERSION:2.0";
  formattedContent+= "\nPRODID:-//CIS320CALTEAM//Calendar Snapshot v1.0//EN";
  //per event
  for(let i=0;i<arr.length;i++){
    formattedContent+="\nBEGIN:VEVENT";
    formattedContent+="\nUID:"+self.crypto.randomUUID();
    const d = new Date();
    formattedContent+="\nDTSTAMP:"+d.getUTCFullYear()+fixDateTime(d.getUTCMonth()+1)+fixDateTime(d.getUTCDate())+"T"+fixDateTime(d.getUTCHours())+fixDateTime(d.getUTCMinutes())+fixDateTime(d.getUTCSeconds())+"Z";
    if(arr[i][0])
      formattedContent+="\nTZID:"+arr[i][0];
    if(arr[i][1])
      formattedContent+="\nDTSTART:"+arr[i][1];
    if(arr[i][2])
      formattedContent+="\nDTEND:"+arr[i][2];
    if(arr[i][3])
      formattedContent+="\nDURATION:"+arr[i][3];
    if(arr[i][4])
      formattedContent+="\nSUMMARY:"+arr[i][4];
    if(arr[i][5])
      formattedContent+="\nRRULE:"+arr[i][5];
    if(arr[i][6])
      formattedContent+="\nDESCRIPTION:"+arr[i][6];
    if(arr[i][7])
      formattedContent+="\nLOCATION:"+arr[i][7];
    formattedContent+="\nEND:VEVENT";
  }
  //close calendar
  formattedContent+="\nEND:VCALENDAR";
  //downloadICS(formattedContent);
  testPrint(formattedContent);
}

function testFunction(){
  const arr = [];
  var temp_event = ["","","","","","","",""];
  var selected = "";
  if (window.getSelection) {
    selected = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    selected = document.selection.createRange().selected;
  }
  temp_event = selected.split(",");
  
  
  arr.push(temp_event);
  formatICS(arr);
}

//look for ctrl+alt+P for 'printing' the calendar event
document.addEventListener('keydown', function(event) {
  if (event.shiftKey && event.altKey && event.key == 'P') {
    testFunction();
  }
});