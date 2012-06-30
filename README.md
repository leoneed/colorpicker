colorpicker
===========

jQuery Color Picker Plugin

Configuration options:

$("#picker").colorPicker({
    width: 602, //color picker width
    height: 602, //color picker height
    radius: 300, //color picker radius
    callback: function (color){ //gets an object with color data
      var hexcolor = "#" + color.red + color.green + color.blue; // format of data received
      $("#selected_color").val(hexcolor).css('background-color', hexcolor);
    },
    direction: false, // Gradient direction. Default value is 'false', which means dark colors are inside and light colors are outside toward the edge.
    sectors: 24, //The number of sectors in the color picker
    layers: 6, //The number of rings in the color picker (excluding black and white colors)
    preselect: '#000000' //Preselected color
});

Any of the sizing variables are not set, colorpicker is using the size of the box it's residing inside. 
If the box is 0px in size (height/width), the radius is set to 300px. 
Any of the the 3 variables set will be in effect: you can set just the radius, just width and height, or any combination thereof.
For older browsers plugin can work in tandem with excanvas.
