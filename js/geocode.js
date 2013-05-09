define(function () {

	var geocoder = new google.maps.Geocoder();
	
	function codeLatLng (latlng) {
		console.log(latlng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					map.setZoom(11);
					marker = new google.maps.Marker({
					position: new google.maps.LatLng(40.730885,-73.997383),
					map: map
				});
				infowindow.setContent(results[1].formatted_address);
				infowindow.open(map, marker);
				} else {
					alert('No results found');
				}
			} else {
				alert('Geocoder failed due to: ' + status);
			}
		});
	}

	return {
		codeLatLng: codeLatLng
	};

});