function resize(reader, result_container)
{
    /*
        Ii dai ca parametru o imagine si locul unde sa puna imaginea modificata.

    */
    var maxWidth = 100;
    var maxHeight = 100;

    var img = new Image();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var canvasCopy = document.createElement("canvas");
    var copyContext = canvasCopy.getContext("2d");

    img.onload = function()
    {
        var ratio = 1;

        if(img.width > maxWidth)
            ratio = maxWidth / img.width;
        else if(img.height > maxHeight)
            ratio = maxHeight / img.height;

        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

        // now show
        result_container.appendChild(canvas);
    };

    // now call the onload
    img.src = reader.src;
}

// always.
var img = document.getElementById('theImage');
resize(img, document.body);