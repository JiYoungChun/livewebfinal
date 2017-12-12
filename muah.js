var socket = io.connect();

socket.on('connect', function() {
    console.log("Connected");
});

var liveVideo; // live profile video near input
var previewVid;

var bigPreviewVid;
var previewText;

var sendMessageToServer; //function to call when sending message
var conversation;//message list div

var mediaRecorder;
// var mediaRecorderPreview;

var ypos = 0; 
var isTyping = false;

var firstTime = true;

var previewVideoArray = [];
var previewTextArray = [];
var previewIndex = 0;

var initWebRTC = function() {
    // These help with cross-browser functionality
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

     $(document).ready(function() {
     document.ontouchmove = function(e){
          e.preventDefault();
          }
    });
     document.getElementById('message').onfocus = function () {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
    }
    // The video element on the page to display the webcam
    liveVideo = document.getElementById('liveVideo');
    conversation = document.getElementById('conversation');
    previewVid = document.getElementById('previewVideo');
    bigPreviewVid = document.getElementById('bigPreviewVideo');
    previewText = document.getElementById('previewText');

    bigPreviewVid.controls = false;
    bigPreviewVid.muted = true;
    bigPreviewVid.autoplay = true;

    previewVid.controls = false;
    previewVid.muted = true;
    previewVid.autoplay = true;

    previewVid.onended = function(){
        previewVid.src= previewVideoArray[previewIndex];
        previewVid.load();
        previewVid.play();

        console.log(previewTextArray[previewIndex]);
        previewIndex++;
        if(previewIndex>=previewVideoArray.length){
            previewIndex=0;
        }
    }

    bigPreviewVid.onended = function(){
        bigPreviewVid.src= previewVideoArray[previewIndex];
        bigPreviewVid.load();
        bigPreviewVid.play();

        previewText.innerHTML = previewTextArray[previewIndex];
        previewIndex++;
        if(previewIndex>=previewVideoArray.length){
            previewIndex=0;
        }
    }
    
    //if you start typing in the input, start the recording process
    $("#message").keyup(function() {
        if (!isTyping) {
            console.log(mediaRecorder.state);
            console.log("START RECORD");
            mediaRecorder.start();
            isTyping = true;
        }
    });

    //press enter to send message. cannot send if input field is empty
    $('#message').bind("enterKey",function(e){
           sendMessageToServer(document.getElementById('message').value);
    });

    $('#message').keyup(function(e){
        if(e.keyCode == 13 && document.getElementById('message').value != "")
        {
            $(this).trigger("enterKey");
        }
    });

    // setting up the media recorder
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
            video: true,
            audio: false
        }, function(stream) { //the live stream
            var chunks = [];

            //get live stream and display for the bottom live video
            liveVideo.src = window.URL.createObjectURL(stream) || stream;
            liveVideo.play();
            mediaRecorder = new MediaRecorder(stream);
            //when stopping mediarecorder while it's already recording
            //save the data as a blob and send it to server as a bufferarray
            mediaRecorder.onstop = function(e) {
                var blob = new Blob(chunks, {
                    'type': 'video/webm'
                });
                
                //get message content from input field
                var message = document.getElementById('message').value;

                var localObj = {
                    video: blob,
                    content: message,
                    isLocal: true
                }
                makeMsgBox(localObj);

                var objtosend = {
                    video: blob,
                    content: message,
                    isLocal: false
                }

                socket.emit ('message', objtosend);

                //reset everything
                //and reset the input field to an empty string
                document.getElementById('message').value = "";

                //make it so typing will start the mediarecorder again
                isTyping = false;

                //reset chunks so it doesn't keep previous video data
                chunks = [];
                console.log(mediaRecorder.state);
            };

            mediaRecorder.ondataavailable = function(e) {
                console.log("data");
                chunks.push(e.data);
                socket.emit("chunk", e.data);
            };

        }, function(err) {
            console.log('Failed to get local stream', err);
            alert("Failed to get local stream " + err);
        });
    }
};

//display image from server
//sent from all users whenever they send a message
//data: dataUrl, msgData   ->  javascript object

function makeMsgBox(data) {
    previewTextArray.push(data.content);
    //make a msgbox div 
    var div = document.createElement("div");
    div.classList.add("messageContainer");


    var profileDiv = document.createElement("div");
    profileDiv.classList.add("profileContainer");

    var para = document.createElement("p");
    para.classList.add("messageText");

    var vid = document.createElement("video");
    vid.classList.add("messageUserProfile");
    var profileCircle = document.createElement("img");
    profileCircle.classList.add("messageProfileCircle");
    var node = document.createTextNode(data.content);
    para.appendChild(node);
    

    vid.onpause = function() { //weird bug. all videos pause when loading new video
        vid.play();
    }
    //set settings for video
    vid.loop = true;
    vid.autoplay = true;
    vid.muted = true;
    vid.controls = false;

    var newBlob = data.video;
    //need to convert arraybuffer into BLOB
    if(!data.isLocal)
    {
        newBlob = new Blob([data.video], {
            'type': 'video/webm'
        });
    }


    //get videourl from blob
    var videoURL = window.URL.createObjectURL(newBlob);
    console.log(videoURL);
    vid.src = videoURL;

    profileCircle.src = "circle.png";

    div.style.top = ypos + "%";

    profileDiv.appendChild(vid);
    profileDiv.appendChild(profileCircle);
    div.appendChild(profileDiv)
    div.appendChild(para);
   
    conversation.appendChild(div);
    document.getElementById("chatDisplay").appendChild(conversation);

 //local stuff. put on right side
    if(data.isLocal)
    {
        para.style.left =  "60%";
    }
    else //everyone else, do on left side
    {
        para.style.right = "60%";
    }



    vid.play();
    //push text down
    //TODO: shift messages from other people to the left
    //TODO: need to scroll to bottom of message container everytime there's new message
    //TODO: pressing enter to send message
    //TODO: more styling to make it pretty
    ypos += 17;
    var scrollDiv = document.getElementById("chatDisplay");
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
}

//receive message data from server
socket.on('message', function(data) {
    makeMsgBox(data);
});

socket.on('chunk', function(data){

    console.log("received chunk");
     var blob = new Blob([data], {
                    'type': 'video/webm'
                });

    var previewVideoURL = window.URL.createObjectURL(blob);
    previewVideoArray.push(previewVideoURL);
    previewVid.src = previewVideoArray[previewIndex];
    bigPreviewVid.src = previewVideoArray[previewIndex];
    previewVid.play();  
    previewVideoArray.play();
});

//on message deliver to server on button press
//message is whatever string is inside the app text field
sendMessageToServer = function(message) {
    mediaRecorder.stop();
};


window.addEventListener('load', initWebRTC);