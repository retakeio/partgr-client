var socket = io.connect('http://shipit.jit.su:80')
, output = document.querySelector('#output')
, width = document.body.clientWidth
;

var sendImage = function (direction) {
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

    var disableUpload = function () {
        // called when a picture occupies the space
        tipText = $('#tip');
        tipText.addClass('hidden');

        pick = $('#pick-image');
        pick.addClass('hidden');
    };

    var enableUpload = function () {
        // called when the space is free again
        tipText = $('#tip');
        tipText.removeClass('hidden');

        pick = $('#pick-image');
        pick.removeClass('hidden');
    };

    var teleportImage = function () {
        if (document.querySelector('.transition')) {
            console.log('Wont teleport received images');
            return false;
        }
        sendImage({
            direction: 'spoof'
        });
        var img = $('#theImage');
        if (img) {
            img.fadeOut('slow', function () {
                this.remove();
            });
        }
        return true;
    };

    var landImage = function (data) {
        // Make a new image appear; if there is one; fail
        if (document.getElementById('theImage')) {
            console.log('There is already an image on screen');
            return false;
        }

        console.log('landing image');

        var img = document.createElement("img"); // fixme
        img.id = 'theImage';
        img.src = data;
        //img.width = 500;
        var imagePresenter = document.querySelector("#image-presenter");
        imagePresenter.appendChild(img);
        imagePresenter.style.display = "block";
        img = $('#theImage');
        img.draggable({
            start: dragStart,
            drag : dragImage
        });

        img.on('tap', function (event) {
            document.querySelector('footer').classList.add('visible');
        });

        disableUpload();
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
    var found = [];
    for (var i in userlist) {

        var user = {};
        user.family = userlist[i].family;
        user.location = userlist[i].location;

        if (!user.family) continue;

        var img = document.createElement('img');
        if (user.location) {
            img.setAttribute('title',  user.location.lat.toString().slice(0,6) + ' ' + user.location.lng.toString().slice(0,6));
        }

        if (user.family.match(/Mobile/g)) {
            if (found.indexOf('moz') > -1) continue;
            found.push('moz');
            img.src = 'images/b2g.png';
        } else if (user.family.match(/Firefox/g)) {
            if (found.indexOf('ff') > -1) continue;
            found.push('ff');
            img.src = 'images/aurora.png';
        } else if (user.family.match(/Chrome/g)) {
            if (found.indexOf('chr') > -1) continue;
            found.push('chr');
            img.src = 'images/chrome.png';
        } else {
            if (found.indexOf('chr') > -1) continue;
            found.push('chr');
            img.src = 'images/chrome.png';
        }

        userlistEl.appendChild(img);

    }
}

function appendImage(img, direction) {
        if (direction.direction == 'right') {
            img.css('left', '-1000px');
            $('#image-presenter').append(img);
            img.animate({
                top: direction.top + 'px',
                left: - parseInt(img.css('width'), 10) / 2 + 'px'
            }, {
                duration: 1500
            });
        }
        if (direction.direction == 'left') {
            img.css('right', '-1000px');
            $('#image-presenter').append(img);
            img.animate({
                top: direction.top + 'px',
                right: - parseInt(img.css('width'), 10) / 2 + 'px'
            }, {
                duration: 1500
            });
        }
        if (direction.direction == 'bottom') {
            img.css({
                'left': direction.left + 'px',
                'top': '-200px'
            });
            $('#image-presenter').append(img);
            img.animate({
                top: - parseInt(img.css('height'), 10) / 2 + 'px'
            }, {
                duration: 1500
            });
        }
        if (direction.direction == 'top') {
            img.css({
                'left': direction.left + 'px',
                'bottom': '-200px'
            }, {
                duration: 1500
            });
            $('#image-presenter').append(img);
            img.animate({
                bottom:  - parseInt(img.css('height'), 10) / 2 + 'px'
            }, {
                duration: 1500
            });
        }
        if (direction.direction == 'spoof') {
            img.css('opacity', 0);
            $('#image-presenter').append(img);
            img.animate({
                opacity: 1
            }, {
                duration: 1500
            });
        }
        pick = $('#pick-image');
        pick.addClass('hidden');
        tipText = $('#tip');
        tipText.addClass('hidden');

    img.draggable();

}

function handleMsg (msg) {
    if (document.querySelector('.transition')) {
        console.log('Ignoring incoming image, since something on screen')
        return ;
    }

    var img = $('<img id="theImage" class="transition" src="'+ msg.image +'">');
    img.on('tap', function (event) {
        document.querySelector('footer').classList.add('visible');
    });
    appendImage(img, msg.direction);
}

function sendMsg (msg) {
    socket.emit('msg', msg);
    // We are done, next image please
    setTimeout(function () {
        enableUpload();
    }, 1500);
}
