YUI.add("client", function(Y) {

    var socket = io.connect('http://10.20.0.118:3000')
    , output = document.querySelector('#output')
    , width = document.width
    ;

Y.namespace("Client");
Y.Client.sendImage = function (direction) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var data;
    var img = document.getElementById('theImage');
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    data = canvas.toDataURL();
    sendMsg({
        image: data,
        direction: direction
    });
};


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

function appendImage(img, direction) {
    Y.one('body').append(img);
    img.transition({
        duration: 1.5, // seconds
        easing: 'ease-out',
        top: '0px',
        left: '100px'
    });
}

function handleMsg (msg) {
    var img = Y.Node.create('<img class="transition" src="'+ msg.image +'">');
    appendImage(img, msg.direction);
}

function sendMsg (msg) {
    socket.emit('msg', msg);
}

}, "1.0.0", {requires: ['node', 'event', 'node-event-simulate', 'dd-drag','transition']});