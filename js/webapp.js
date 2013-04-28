    YUI().use("client", function (Y) {

        var DEBUG = true;
        var DEBUG = false;
        var _proximityTimestamp = -1;
        var _dragStart = {
            x: 0,
            y: 0
        };
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
                        var img_src = this.result.blob;
                        Y.Client.landImage(window.URL.createObjectURL(img_src));
                        Y.DD.DDM.on('drag:drag', dragImage);
                        Y.DD.DDM.on('drag:start', dragStart);
                        console.log('got pic!');
                    };

                    pick.onerror = function () { 
                        alert("Can't view the image!");
                    };
                }
            } else {
                // fallback when there is no activity
                pickImage.onclick = function () {
                    var input = Y.one('#image-input');
                    input.on('change', function (event) {
                        var selectedFile = document.getElementById('image-input').files[0];
                        var reader = new FileReader();

                        reader.onload = function(event) {
                            Y.Client.landImage(event.target.result);

                            Y.DD.DDM.on('drag:drag', dragImage);
                            Y.DD.DDM.on('drag:start', dragStart);
                        };

                        reader.readAsDataURL(selectedFile);
                    });
                    input.simulate('click');
                };
            }
        }

        var proxibuton = Y.one('#proxibtn');
        proxibuton.on('click', function (e) {
            Y.Client.teleportImage();
        });

        // proximity
        var onProxyListener = function(event) {
            if (event.near) {
                _proximityTimestamp = new Date().getTime();
            } else {
                if (_proximityTimestamp != -1) {
                    var now = new Date().getTime();
                    if (now - _proximityTimestamp >= 100) {
                        Y.Client.teleportImage();
                    }
                    _proximityTimestamp = -1;
                }
            }
        };
        // for later
        window.addEventListener('userproximity', onProxyListener);

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
                    geolocationDisplay.innerHTML = "failed to get your current location";
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
            if (!image) {
                console.log('No image in drag, quiting');
                return false;
            }
            if (document.querySelector('.transition')) {
                console.log('Only received images, quiting')
                return false;
            }
            var pos = image.getXY();
            var width = image.get('offsetWidth');
            var height = image.get('offsetHeight');

            var dWidth = document.body.clientWidth;
            var dHeight = document.body.clientHeight;
            console.log(pos[0] + width > dWidth + width / 4);
            if (pos[0] + width > dWidth + width / 4) {
                Y.Client.sendImage({
                    top: pos[1],
                    left: pos[0],
                    direction: 'right'
                });
                image.remove();
            }
            if (pos[0] < -width / 4) {
                console.log('2');
                Y.Client.sendImage({
                    left: pos[0],
                    top: pos[1],
                    direction: 'left'
                });
                image.remove();
            }

            if (pos[1] + height > dHeight + height / 4) {
                console.log('3');
                Y.Client.sendImage({
                    top: pos[1],
                    left: pos[0],
                    direction: 'bottom'
                });
                image.remove();
            }

            if (pos[1] < - height / 4) {
                console.log('4');
                Y.Client.sendImage({
                    top: pos[1],
                    left: pos[0],
                    direction: 'top'
                });
                image.remove();
            }
            return true;
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
            console.log('ondrop');
            event.preventDefault && event.preventDefault();
            this.className = '';

            // now do something with:
            var files = event.dataTransfer.files;
            console.log(files);

            if (acceptedTypes[files[0].type] === true) {
                console.log('accepted');
                var reader = new FileReader();
                reader.onload = function (event) {
                    Y.Client.landImage(event.target.result);
                    Y.DD.DDM.on('drag:drag', dragImage);
                    Y.DD.DDM.on('drag:start', dragStart);
                };
                reader.readAsDataURL(files[0]);
            }

            return false;
        };

        // buttons on footer
         var delbut = Y.one('#delete');
         delbut.on('click', function (e) {
             var img = Y.one('#theImage');
             if (img) {
                 img.remove();
             }
             Y.Client.enableUpload();
             Y.one('footer').removeClass('visible');
         });

         var downloadButton = Y.one('#download');
         downloadButton.on('click', function(e) {
             var img = Y.one('#theImage');
             if (img) {
                var aDownload = Y.Node.create('<a download="image"  href="'+ img.get('src') +'">');
                Y.one('footer').appendChild(aDownload);
                aDownload.simulate('click');
                aDownload.remove();
                img.remove();
             }
             Y.Client.enableUpload();
             Y.one('footer').removeClass('visible');
         });

        if (DEBUG) {
            Y.one('#proxibtn').removeClass('hidden');
        }
    });
