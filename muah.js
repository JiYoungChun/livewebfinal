// var mycolor = "#" + Math.floor(Math.random() * 9) + 
//                     Math.floor(Math.random() * 9) + 
//                     Math.floor(Math.random() * 9) + 
//                     Math.floor(Math.random() * 9) + 
//                     Math.floor(Math.random() * 9) + 
//                     Math.floor(Math.random() * 9);

// console.log(mycolor);


var socket = io.connect();

socket.on('connect', function() {
    console.log("Connected");
});

var thecanvas;
var thecontext;
var video;
var sendMessageToServer;
var myMessages;
var ypos = 0;

var isTyping = false;

var initWebRTC = function() {
    // These help with cross-browser functionality
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    // The video element on the page to display the webcam
    video = document.getElementById('thevideo');

    // if we have the method
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
            video: true
        }, function(stream) {
            video.src = window.URL.createObjectURL(stream) || stream;
            video.play();
        }, function(error) {
            alert("Failure " + error.code);
        });
    }

    console.log(document);
    thecanvas = document.getElementById('thecanvas');
    thecontext = thecanvas.getContext('2d');
    myMessages = document.getElementById("myMessages");

    mediaRecorderInit();

    $("#message").keypress(function(){
        if(!isTyping)
        {
            console.log("START RECORD");
            mediaRecorder.start();
            isTyping = true;
        }
    });

};

//display image from server
//sent from all users whenever they send a message
//data: dataUrl, msgData   ->  javascript object

function makeMsgBox (data){


//make a msgbox div 
var div = document.createElement("div");
div.classList.add("messageContainer");
var para = document.createElement("p");
para.classList.add("messageText");
var img = document.createElement("img");
img.classList.add("messageUserProfile");
var profileCircle = document.createElement("img");
profileCircle.classList.add("messageProfileCircle");
var node = document.createTextNode(data.content);

para.appendChild(node);
img.src= data.image; 
profileCircle.src = "circle.png";

div.style.top = ypos + "%";
div.appendChild(para);
div.appendChild(img);
div.appendChild(profileCircle);


myMessages.appendChild(div); 
document.getElementById("chatDisplay").appendChild(myMessages);

}


socket.on('message', function(data) {

makeMsgBox(data);

});


//on message deliver to server on button press
//message is whatever string is inside the app text field
sendMessageToServer = function(message) {

    //display img from live video to canvas
    thecontext.drawImage(video, 0, 0, video.width, video.height);
    //get data url from canvas
    var dataUrl = thecanvas.toDataURL('image/webp', 1);
    //display data url into imagefile
    //display my profile picture
    // img.src = dataUrl;


    var objtosend = {
        image: dataUrl,
        content: message 
        // who: who
    }

    makeMsgBox(objtosend);

    socket.emit('message', objtosend);
    // console.log("sending message to server: " + objtosend);

    //TODO: how the message should appear on receiving a new message
    document.getElementById('message').value = "  ";
    ypos += 20;
    console.log("ypos : " + ypos);

    isTyping = false;
    mediaRecorder.stop();

    // document.getElementById('imagefile').src= " ";
};


window.addEventListener('load', initWebRTC);