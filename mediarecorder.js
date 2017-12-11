
var mediaRecorder;

function mediaRecorderInit(){
     window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

     if (navigator.getUserMedia) {
         navigator.getUserMedia({
             video: true,
             audio: false
         }, function(stream) {
             var chunks = [];

             mediaRecorder = new MediaRecorder(stream);

             mediaRecorder.onstop = function(e) {
                 console.log("stop");

                 var video = document.createElement('video');
                 video.classList.add("messageUserProfile");
                 video.loop = true;
                 video.controls = false;
                 var blob = new Blob(chunks, {
                     'type': 'video/webm'
                 });
                 var videoURL = window.URL.createObjectURL(blob);
                 video.src = videoURL;

                 document.body.appendChild(video);

				 video.autoplay = true;
				 video.load();
             };

             mediaRecorder.ondataavailable = function(e) {
                 console.log("data");
                 chunks.push(e.data);
             };


         }, function(err) {
             console.log('Failed to get local stream', err);
             alert("Failed to get local stream " + err);
         });
     }
 };