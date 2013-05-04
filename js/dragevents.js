        function dragStart (e) {
            _dragStart.x = e.pageX;
            _dragStart.y = e.pageY;
        }

        function dragImage (e, ui) {
            var image = $("#theImage");
            if (!image) {
                console.log('No image in drag, quiting');
                return false;
            }
            if (document.querySelector('.transition')) {
                console.log('Only received images, quiting');
                return false;
            }
            var pos = {
                left : $(this).offset().left,
                top  : $(this).offset().top
            };
            
            var width = parseInt(image.css('width'), 10);
            var height = parseInt(image.css('height'), 10);

            var dWidth = document.body.clientWidth;
            var dHeight = document.body.clientHeight;

            console.log(pos.left, width);

            if (pos.left + width > dWidth + width / 4) {
                sendImage({
                    top: pos.top,
                    left: pos.left,
                    direction: 'right'
                });
                image.remove();
            }
            if (pos.left < - width / 4) {
                console.log('2');
                sendImage({
                    left: pos.left,
                    top: pos.top,
                    direction: 'left'
                });
                image.remove();
            }

            if (pos.top + height > dHeight + height / 4) {
                console.log('3');
                sendImage({
                    top: pos.top,
                    left: pos.left,
                    direction: 'bottom'
                });
                image.remove();
            }

            if (pos.top < - height / 4) {
                console.log('4');
                sendImage({
                    top: pos.top,
                    left: pos.left,
                    direction: 'top'
                });
                image.remove();
            }
            return true;
        }