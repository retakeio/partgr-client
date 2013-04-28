YUI.add("client", function(Y) {

    var socket = io.connect('http://10.20.0.118:3000')
    , output = document.querySelector('#output')
    , width = document.body.clientWidth
    ;

Y.namespace("Client");
Y.Client.sendImage = function (direction) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var data;
    var img = document.getElementById('theImage');
    if (!img) {
        console.log('There is no image to send');
        return false;
    }
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    data = canvas.toDataURL();
    sendMsg({
        image: data,
        direction: direction
    });
    return true;
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

    Y.Client.teleportImage = function () {
        if (document.querySelector('.transition')) {
            console.log('Wont teleport received images');
            return false;
        }
        Y.Client.sendImage({
            direction: 'spoof'
        });
        var img = Y.one('#theImage');
        if (img) {
            img.transition({
                duration: 1.5, // seconds
                easing: 'ease-out',
                opacity: '0'
            }, function () {
                this.remove();
            });
        }
        return true;
    };

    Y.Client.landImage = function (data) {
        // Make a new image appear; if there is one; fail
        if (document.getElementById('theImage')) {
            console.log('There is already an image on screen');
            return false;
        }

        var img = document.createElement("img");
        img.id = 'theImage';
        img.src = data;
        //img.width = 500;
        var imagePresenter = document.querySelector("#image-presenter");
        imagePresenter.appendChild(img);
        imagePresenter.style.display = "block";
        var dd = new Y.DD.Drag({node: '#theImage'});

        img = Y.one('#theImage');
        img.on('tap', function (event) {
            document.querySelector('footer').classList.add('visible');
        });

        Y.Client.disableUpload();
        return true;
    };

socket.on('connected', function () {
    console.log('connected');
    socket.emit('set nickname', 'andrei' + Date.now().toString().slice(5,100));
    socket.emit('uastring', navigator.userAgent);
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

socket.on('userlist', displayUserlist);

function displayUserlist (userlist) {

    var userlistEl = document.querySelector('#useragents');
    userlistEl.innerHTML = '';
    for (var i in userlist) {
        var user = {};
        user.family = userlist[i].family;
        console.log(userlist[i]);
        user.location = userlist[i].location;

        var img = document.createElement('img');
        img.dataset.lat = user.location.lat;
        img.dataset.lng = user.location.lng;

        if (user.family.match(/Mobile/g)) {
            img.src = 'images/b2g.png';
        } else if (user.family.match(/Firefox/g)) {
            img.src = 'images/aurora.png';
        } else if (user.family.match(/Chrome/g)) {
            img.src = 'images/chrome.png';
        } else {
            img.src = 'images/chrome.png';
        }

        userlistEl.appendChild(img);


    }
}

function appendImage(img, direction) {
        if (direction.direction == 'right') {
            img.setStyle('left', '-1000px');
            Y.one('#image-presenter').append(img);
            img.transition({
                duration: 1.5, // seconds
                easing: 'ease-out',
                top: direction.top + 'px',
                left: - parseInt(img.getStyle('width'), 10) / 2 + 'px'
            });
        }
        if (direction.direction == 'left') {
            img.setStyle('right', '-1000px');
            Y.one('#image-presenter').append(img);
            img.transition({
                duration: 1.5, // seconds
                easing: 'ease-out',
                top: direction.top + 'px',
                right: - parseInt(img.getStyle('width'), 10) / 2 + 'px'
            });
        }
        if (direction.direction == 'bottom') {
            img.setStyles({
                'left': direction.left + 'px',
                'top': '-200px'
            });
            Y.one('#image-presenter').append(img);
            img.transition({
                duration: 1.5, // seconds
                easing: 'ease-out',
                top: - parseInt(img.getStyle('height'), 10) / 2 + 'px'
            });
        }
        if (direction.direction == 'top') {
            img.setStyles({
                'left': direction.left + 'px',
                'bottom': '-200px'
            });
            Y.one('#image-presenter').append(img);
            img.transition({
                duration: 1.5, // seconds
                easing: 'ease-out',
                bottom:  - parseInt(img.getStyle('height'), 10) / 2 + 'px'
            });
        }
        if (direction.direction == 'spoof') {
            img.setStyle('opacity', 0);
            Y.one('#image-presenter').append(img);
            img.transition({
                duration: 1.5, // seconds
                easing: 'ease-out',
                opacity: 1
            });
        }
        pick = Y.one('#pick-image');
        pick.addClass('hidden');
        tipText = Y.one('#tip');
        tipText.addClass('hidden');

    var dd = new Y.DD.Drag({
        node: img
    });

}

function handleMsg (msg) {
    if (document.querySelector('.transition')) {
        console.log('Ignoring incoming image, since something on screen')
        return ;
    }

    var img = Y.Node.create('<img id="theImage" class="transition" src="'+ msg.image +'">');
    img.on('tap', function (event) {
        document.querySelector('footer').classList.add('visible');
    });
    appendImage(img, msg.direction);
}

function sendMsg (msg) {
    socket.emit('msg', msg);
    // We are done, next image please
    setTimeout(function () {
        Y.Client.enableUpload();
    }, 1500);
}

}, "1.0.0", {requires: ['node', 'event', 'node-event-simulate', 'dd-drag','transition']});
