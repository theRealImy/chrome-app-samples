var active = false;
var logEl = document.getElementById('log');
var commandLog = document.getElementById('commands');
var message = document.getElementById('message');
var video = document.getElementById('live');
var failed = false;
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
var videoSource = new MediaSource();

var interval;

var radios = document.getElementsByTagName('input');
var value;
for (var i = 0; i < radios.length; i++) {
    if (radios[i].type === 'radio' && radios[i].checked) {
        // get value, set checked flag or do whatever you need to
        value = radios[i].value;       
    }
}


function clearLog() {
  logEl.textContent = "";
}

function log(msg) {
  logEl.textContent = msg;
//  logEl.scrollTop = 10000000;
}


function onDroneConnected() {
  video.src = window.URL.createObjectURL(videoSource);

  videoSource.addEventListener("webkitsourceclose", function(e) {
    clearInterval(interval);
    console.log("END");
    console.log(e);
  });

  //video.addEventListener("progress", function(x) {console.log(x);});
  //video.addEventListener("playing", function(x) {console.log(x);});
  //video.addEventListener("ended", function(x) {console.log(x);});
  //video.addEventListener("error", function(x) {console.log(x); console.log(video.error); console.log(video)});


  videoSource.addEventListener('webkitsourceopen', function(e) {
    // var sourceBuffer = videoSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    // console.log(sourceBuffer);

  interval = setInterval(function() {
      //console.log("yay");
      chrome.socket.read(DRONE.API.sockets["vid"].socket, function(data){
        //console.log(data);
        var buffer = parseMoreData(data.data);
        //console.log(buffer);
        if (buffer && buffer.byteLength) {
          //console.log(videoSource);
          //console.log(videoSource.sourceBuffers.length);
          var sourceBuffer = videoSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
          sourceBuffer.append(new Uint8Array(buffer));
          //console.log(videoSource.sourceBuffers.length);
          //console.log(videoSource);
          video.play();
        }
      });
    }, 100);
  });

  DRONE.Gamepad.enable();
  //message.style.display = "none";
  //instructions.style.display = "block";
}

function onDroneConnectionFailed() {
  if(!failed) {
    log("Connectioned failed - Are you attached to the Drone's Wifi network?");
    failed = true;
  }
}

function initInputGamePad() {
    DRONE.Gamepad.onConnected = function() {
        commandLog.style.display = "block";
        DRONE.API.init(onDroneConnected, onDroneConnectionFailed);
    };
    // start the gamepad
    gamepadSupport.init();
    DRONE.Gamepad.onConnected();
}

function initInputGesture() {
    DRONE.gestures.init();
}

console.log("init :"+value);
switch (value) {
    case "gamepad":
        initInputGamePad();
        break;
    case "gesture":
        initInputGesture();
        break;
}
