var socket = io.connect('http://10.20.0.118:3000')
    , output = document.querySelector('#output')
    , width = document.width
    , img
    ;


function sendImage () {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var data;
    var img = document.getElementById('theImage');
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0, c.width, c.height);
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
