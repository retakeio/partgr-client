define(function () {

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

	var enableUpload = function () {
		// called when the space is free again
		tipText = $('#tip');
		tipText.removeClass('hidden');

		pick = $('#pick-image');
		pick.removeClass('hidden');
	};

	function sendMsg (msg) {
		socket.emit('msg', msg);
		// We are done, next image please
		setTimeout(function () {
			enableUpload();
		}, 1500);
	}

	return {
		image: sendImage
	};

});