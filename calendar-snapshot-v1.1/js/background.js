/* used to get runtime info and import scripts */
var s = document.createElement('script');
s.src = chrome.runtime.getURL('js/main.js');
(document.head || document.documentElement).appendChild(s);

var t = document.createElement('script');
t.src = chrome.runtime.getURL('libraries/tesseract.min.js');
(document.head || document.documentElement).appendChild(t);

var z = document.createElement('script');
z.src = chrome.runtime.getURL('libraries/html2canvas.min.js');
(document.head || document.documentElement).appendChild(z);

s.onload = function(){
  var URLs = [chrome.runtime.getURL("libraries/worker.min.js"), chrome.runtime.getURL("traineddata"), chrome.runtime.getURL("libraries/tesseract-core.wasm.js")];

  var evt=document.createEvent("customEvent");
  evt.initCustomEvent("customEvent", true, true, URLs);
  document.dispatchEvent(evt);
};