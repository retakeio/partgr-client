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

    Y.Client.disableUpload = function () {
        // called when a picture occupies the space
        tipText = Y.one('#tip');
        tipText.addClass('hidden');

        pick = Y.one('#pick-image');
        pick.addClass('hidden');
    };

    Y.Client.enableUpload = function () {
        // called when the space is free again
        tipText = Y.one('#tip');
        tipText.removeClass('hidden');

        pick = Y.one('#pick-image');
        pick.removeClass('hidden');
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
    if (direction.direction == 'right') {
        img.setStyle('left', '-1000px');
        Y.one('body').append(img);
        img.transition({
            duration: 1.5, // seconds
            easing: 'ease-out',
            top: direction.top + 'px',
            left: '-450px'
        });
    } else {
        img.setStyle('right', '-1000px');
        Y.one('body').append(img);
        img.transition({
            duration: 1.5, // seconds
            easing: 'ease-out',
            top: direction.top + 'px',
            right: '-450px'
        });
    }

    var dd = new Y.DD.Drag({
        node: img
    });

}

function handleMsg (msg) {
    var img = Y.Node.create('<img class="transition" src="'+ msg.image +'">');
    appendImage(img, msg.direction);
}

function sendMsg (msg) {
    socket.emit('msg', msg);
    // We are done, next image please
    console.log('sunt aici');
    Y.Client.enableUpload();
}

}, "1.0.0", {requires: ['node', 'event', 'node-event-simulate', 'dd-drag','transition']});
