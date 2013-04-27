(function () {
YUI().use('node', 'event', function (Y) {
    // pick
    var pickImage = document.querySelector("#pick-image");
    if (pickImage) {
        pickImage.onclick = function () {
            var pick = new MozActivity({
                name: "pick",
                data: {
                    type: ["image/png", "image/jpg", "image/jpeg"]
                 }
            });

            pick.onsuccess = function () { 
                var img = document.createElement("img");
                img.src = window.URL.createObjectURL(this.result.blob);
                var imagePresenter = document.querySelector("#image-presenter");
                imagePresenter.appendChild(img);
                imagePresenter.style.display = "block";
            };

            pick.onerror = function () { 
                alert("Can't view the image!");
            };
        }
    }

    // Geolocation
    var geolocationDisplay = document.querySelector("#geolocation-display");
    if (geolocationDisplay) {
        (function () {
            navigator.geolocation.getCurrentPosition(function (position) {
                geolocationDisplay.innerHTML = "<strong>Latitude:</strong> " + position.coords.latitude + ", <strong>Longitude:</strong> " + position.coords.longitude;
                geolocationDisplay.style.display = "block";
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
});
})();
