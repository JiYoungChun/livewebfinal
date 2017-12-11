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
var ypos = 0;

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


};

//display image from server
//sent from all users whenever they send a message
//data: dataUrl, msgData   ->  javascript object

function makeMsgBox (data){


//make a msgbox div 
var myMessages = document.getElementById("myMessages");
var div = document.createElement("div"); 
var para = document.createElement("p");
var img = document.createElement("img");
var profileCircle = document.createElement("img");
var node = document.createTextNode(data.content);

para.appendChild(node);
para.setAttribute("style", "font-size: " + 20 + "px");
para.style.left = 50 + "%";
para.style.width = 50+ "%"; 
para.style.top = 50+ "%";
para.style.position = "absolute";
para.style.padding= 4+"px";
para.style.borderRadius= 2+"px";
// para.style.padding= 4+"px" +20+"px";
para.style.margin = "auto";
para.style.background = "#e7e7e7"; 

img.src= data.image; 
img.style.left = 0 + "%";
img.style.position = "absolute";
img.style.margin = "auto";

profileCircle.src = "circle.png";
profileCircle.style.left = 0 + "%";
profileCircle.style.width = 125 + "px"; 
profileCircle.style.height = 125 + "px"; 
profileCircle.style.position = "absolute";
profileCircle.style.margin = "auto";


// div.style.width = "100px"; 
// div.style.height = "100px"; 
div.style.width = 100 + "%"
div.style.height = 20 + "%"

// div.style.color = "swhite"; 
div.style.top = ypos - 20 + "%";
div.style.position = "absolute";
div.style.margin = "auto";


// div.innerHTML = para; 
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

    // document.getElementById('imagefile').src= " ";
};


window.addEventListener('load', initWebRTC);