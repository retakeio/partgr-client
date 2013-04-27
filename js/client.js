var socket = io.connect('http://10.20.0.118:3000')
    , output = document.querySelector('#output')
    , width = document.width
    , img
    ;


function sendImage () {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var data;
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img,10,10);
    data = canvas.toDataURL();
    sendMsg(data);
}


socket.on('connected', function () {
    console.log('connected');
    socket.emit('set nickname', 'andrei');
    navigator.geolocation.getCurrentPosition(function (pos) {
        socket.emit('set location', {
            pos : {
                lat : pos.coords.latitude,
                lng : pos.coords.longitude
            }
        });
    });
});

socket.on('newmsg', handleMsg);

function handleMsg (msg) {
    img.src = msg;
}

function sendMsg (msg) {
    socket.emit('msg', msg);
}


// Drag and drop
var doc = document.documentElement;
doc.ondragover = function () { this.className = 'hover'; return false; };
doc.ondragend = function () { this.className = ''; return false; };
doc.ondrop = function (event) {
    event.preventDefault && event.preventDefault();
    this.className = '';

    // now do something with:
    var files = event.dataTransfer.files;
    console.log(files);

    if (acceptedTypes[files[0].type] === true) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var image = new Image();
            image.src = event.target.result;
            image.width = 500;
            document.body.appendChild(image);

            img = image;
            img.addEventListener('dragstart', function (e) { e.preventDefault(); return false; });
        };

        reader.readAsDataURL(files[0]);
    }

    return false;
};

var dndSupported = function () {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
};

if (!dndSupported()) {
    alert('drag n drop not supported');
}

var acceptedTypes = {
    'image/png': true,
    'image/jpeg': true,
    'image/gif': true
};