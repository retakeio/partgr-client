define([], function () {

	var geocode = {
		codeLatLng : function (position, cb) {
			var geocoder = new google.maps.Geocoder();
			console.log(position);
			var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			geocoder.geocode({
				'latLng': pos
			}, function(results, status) {
				var err = (status == google.maps.GeocoderStatus.OK) ? false : status;
				cb(err, results[1].formatted_address);
			});
		}
	}

	return geocode;

});