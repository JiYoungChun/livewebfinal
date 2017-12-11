var mycolor = "#" + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 9);
        console.log(mycolor);


        var socket = io.connect();

        socket.on('connect', function() {
            console.log("Connected");
        });

        var sendmessage;

        // window.addEventListener('load', init);



        // var lx = 0;
        // var ly = 0;

        // window.addEventListener('mousedown', function(evt) {
        //     lx = evt.clientX;
        //     ly = evt.clientY;

        //     console.log("lx: " + lx);
        //     console.log("ly: " + ly);
        // });

        // function init() {

			var ypos= 0;


            socket.on('image', function(data) {
                console.log("data");
                document.getElementById('imagefile').src = data.dataUrl;

                

                var imagepos = document.getElementById('imagefile');
                imagepos.setAttribute("style", "height: " + 10 + "px");
                // imagepos.style.width = 10 + "px"; //같은거? 
                imagepos.style.top = ypos+"%";
                console.log("IMGypos: " +ypos);
                // imagepos.style.left = 60 + "%";
                imagepos.style.position = "absolute";
                imagepos.style.margin = "auto";

                // console.log("data.ly: " + data.ly);
                // console.log("data.lx: " + data.lx);

            });

            socket.on('chatmessage', function(data) {
                console.log(data);
                addMsg(data)
            });

            sendmessage = function(message) {
                console.log("chatmessage1: " + message);
                socket.emit('chatmessage', message);
                // addMsg(message);
                drawprofilepic();

                document.getElementById('message').value = "  ";
                ypos+= 60;
                console.log("ypos: "+ypos);
                // document.getElementById('imagefile').src= " ";
            };


            function addMsg(data) {
                // var randomy = Math.random() * 100;
                // var randomx = Math.random() * 100;
                var para = document.createElement("p");
                para.setAttribute("style", "font-size: " + 20 + "px");
                para.style.top = ypos+"%";
                para.style.left = 20 + "%";
                // para.style.left = lx + "px";

                // para.setAttribute("style", "top: " + ly 5 "px");
                // para.setAttribute("style", "left: " + lx + "px");
                para.style.position = "absolute";
                para.style.margin = "auto";

                // console.log("ly:"+ly);
                var node = document.createTextNode(data);
                para.appendChild(node);
                document.getElementById('messages').appendChild(para);
                // drawprofilepic();
                // drawXYpos();
            }

        // }
        var thecanvas;
        var thecontext;
        var video;
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

        var drawprofilepic = function() {
            thecontext.drawImage(video, 0, 0, video.width, video.height);
            var dataUrl = thecanvas.toDataURL('image/webp', 1);
            document.getElementById('imagefile').src = dataUrl;
            socket.emit('image', objtosend);

            var objtosend = {
                // lx: lx,
                // ly: ly,
                dataUrl: dataUrl
            }


        };

        // var drawXYpos = function{

        // var objtosend = {
        // 	lx:lx,
        // 	ly:ly,

        // };

        // 	socket.emit('image', objtosend);
        // };



        window.addEventListener('load', initWebRTC);