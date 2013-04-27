    YUI().use("client", function (Y) {

        var _proximityTimestamp = -1;
        var _dragStart = {
            x: 0,
            y: 0
        };
        var _sent = false;
        // pick
        var pickImage = document.querySelector("#pick-image");
        if (pickImage) {
            if (typeof MozActivity != 'undefined') {
                pickImage.onclick = function () {
                    var pick = new MozActivity({
                        name: "pick",
                        data: {
                            type: ["image/png", "image/jpg", "image/jpeg"]
                         }
                    });

                    pick.onsuccess = function () { 
                        var img = document.createElement("img");
                        img.id = 'theImage';
                        img.src = window.URL.createObjectURL(this.result.blob);
                        var imagePresenter = document.querySelector("#image-presenter");
                        imagePresenter.appendChild(img);
                        imagePresenter.style.display = "block";

                        // make the img draggable
                        var dd = new Y.DD.Drag({node: '#theImage'});

                        tipText = Y.one('#tip');
                        tipText.addClass('hidden');

                        pick = Y.one('#pick-image');
                        pick.addClass('hidden');
                    };

                    pick.onerror = function () { 
                        alert("Can't view the image!");
                    };
                }
            } else {
                // fallback when there is no activity
                pickImage.onclick = function () {
                    var input = Y.one('#image-input');
                    input.simulate('click');
                };
            }
        }



        // proximity
        window.addEventListener('userproximity', function(event) {
            if (event.near) {
                _proximityTimestamp = new Date().getTime();
            } else {
                if (_proximityTimestamp != -1) {
                    var now = new Date().getTime();
                    if (now - _proximityTimestamp >= 100)
            alert("sending");
        _proximityTimestamp = -1;
                }
            }
        });
        // Geolocation
        var geolocationDisplay = document.querySelector("#geolocation-display");

        function codeLatLng(position) {
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        geolocationDisplay.innerHTML = results[1].formatted_address;
                    } else {
                        alert('No results found');
                    }
                } else {
                    alert('Geocoder failed due to: ' + status);
                }
            });
        }

        if (geolocationDisplay) {
            (function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                    geolocationDisplay.innerHTML = "<strong>Latitude:</strong> " + position.coords.latitude + ", <strong>Longitude:</strong> " + position.coords.longitude;
                    geolocationDisplay.style.display = "block";
                    codeLatLng(position);
                },
                function (position) {
                    geolocationDisplay.innerHTML = "Failed to get your current location";
                    geolocationDisplay.style.display = "block";
                });
            })();
        }

        // deviceStorage, pictures
        var deviceStoragePictures = document.querySelector("#device-storage-pictures"),
            deviceStoragePicturesDisplay = document.querySelector("#device-storage-pictures-display");
        if (deviceStoragePictures && deviceStoragePicturesDisplay) {
            deviceStoragePictures.onclick = function () {
                var deviceStorage = navigator.getDeviceStorage("pictures"),
                    cursor = deviceStorage.enumerate(); 

                        deviceStoragePicturesDisplay.innerHTML = "<h4>Result from deviceStorage - pictures</h4>";
                 
                      cursor.onsuccess = function() { 
                        if (!cursor.result)  {
                            deviceStoragePicturesDisplay.innerHTML = "No files";
                        }

                        var file = cursor.result,
                            filePresentation; 

                                filePresentation = "<strong>" + file.name + ":</strong> " + parseInt(file.size / 1024, 10) + "kb<br>";
                        filePresentation += "<p><img src='" + window.URL.createObjectURL(file) + "' alt=''></p>";
                        deviceStoragePicturesDisplay.innerHTML += filePresentation;

                        deviceStoragePicturesDisplay.style.display = "block";
                         };

                  cursor.onerror = function () {
                    console.log("Error");
                    deviceStoragePicturesDisplay.innerHTML = "<h4>Result from deviceStorage - pictures</h4><p>deviceStorage failed</p>";
                    deviceStoragePicturesDisplay.style.display = "block";
                };
            };
        }

        function dragStart (e) {
            _dragStart.x = e.pageX;
            _dragStart.y = e.pageY;
        }

        function dragImage (e) {
            var image = Y.one("#theImage");
            var pos = image.getXY();
            var width = image.get('offsetWidth');
            var height = image.get('offsetHeight');

            if (pos[0] + width > document.width + 100 && !_sent) {
                Y.Client.sendImage('right');
                _sent = true;
            }
            if (pos[0] < -100 && !_sent) {
                Y.Client.sendImage('left');
                _sent = true;
            }
        }

        // Drag and drop
        var doc = document.documentElement;
        var acceptedTypes = {
            'image/png': true,
            'image/jpeg': true,
            'image/gif': true
        };
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
                    var image = document.getElementById('theImage');
                    if (!image) {
                        var image = new Image();
                        image.setAttribute('id', 'theImage');
                        image.src = event.target.result;
                        image.width = 500;
                        document.body.appendChild(image);
                        // make the img draggable
                        var dd = new Y.DD.Drag({
                            node: '#theImage'
                        });

                        Y.DD.DDM.on('drag:drag', dragImage);
                        Y.DD.DDM.on('drag:start', dragStart);

                    } else {
                        image.src = event.target.result;
                        image.width = 500;
                    }
                };

                reader.readAsDataURL(files[0]);
            }

            return false;
        };


    });