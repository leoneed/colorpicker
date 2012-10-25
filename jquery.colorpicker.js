/**
 * 
 */
jQuery.fn.colorPicker = function (options){
	
	var options = jQuery.extend({
		defaultRadius: 300,
		width: null,
		height: null,
		radius: null,
		callback: function (color){},
		direction: false, //white inside, black on the outside
		sectors: 24,
		layers: 6,
		preselect: ''
	}, options);
	
	options.preselect = options.preselect.toLowerCase();
	
	if (options.radius === null && options.width === null && options.height === null) {
		var parentWidth = this.width(), parentHeigth = this.height();
		if (parentWidth != 0 && parentHeigth != 0) {
			options.radius = parentWidth > parentHeigth? parentHeigth/2 : parentWidth/2;
		}
		else if (parentWidth != 0) {
			options.radius = parentWidth/2;
		}
		else if (parentHeigth != 0) {
			options.radius = parentHeigth/2;
		}
		else {
			options.radius = options.defaultRadius;
		}
	}
	
	if (options.radius === null) {
		if (options.width !== null && options.height !== null) {
			options.radius = options.width > options.height? options.height/2 : options.width/2;
		}
		else if (options.width !== null) {
			options.radius = options.width/2;
		}
		else if (options.height !== null) {
			options.radius = options.height/2;
		}
	}
	if (options.width === null) {
		options.width = options.radius*2;
	}
	if (options.height === null) {
		options.height = options.radius*2;
	}
	
	//position of the center
	var x = options.width/2;
	var y = options.height/2;
	
	var centerRadius = options.radius/(2 * (options.layers+1) + 1);
	
	//add canvas tags to selected block
	var div = document.createElement('div');
	var canvasBottom = document.createElement('canvas');
	var canvasTop = document.createElement('canvas');
	
	canvasBottom.width = options.width;
	canvasBottom.height = options.height;
	canvasTop.width = options.width;
	canvasTop.height = options.height;
	
	var CanvasSupport = true;
	
	if(typeof(G_vmlCanvasManager)  != 'undefined' )
	{
		canvasBottom = G_vmlCanvasManager.initElement(canvasBottom);
		canvasTop = G_vmlCanvasManager.initElement(canvasTop);
		CanvasSupport = false;
	}
	
	//draw color sector
	var drawSector = function(ctx,radius,degrees){
		var pi = Math.PI/180;
		ctx.beginPath();
		ctx.arc(x, y, radius, pi*degrees, pi*(degrees+sectorWidth+1), false);
		ctx.arc(x, y, radius+centerRadius*2+1, pi*(degrees+sectorWidth+1), pi*degrees, true);
		ctx.fill();
	}
	
	var drawSelected = function (polar, callback) {
		if (polar[0] + centerRadius <= options.radius && polar[0] - centerRadius > centerRadius) {
			var radius = Math.floor(polar[0] / (centerRadius*2));
			var ang = Math.floor(polar[1] / sectorWidth);
			ctx2.clearRect(0, 0, options.width, options.height);
			drawSelector(ctx2, radius, ang);
			selectedKey = [radius, ang];
			
			if (callback) {
				var color = colorPositions[radius + ',' + ang];
				
				var r_hex = color[0].toString(16);
				var g_hex = color[1].toString(16);
				var b_hex = color[2].toString(16);
				if (r_hex.length < 2) r_hex = "0" + r_hex;
				if (g_hex.length < 2) g_hex = "0" + g_hex;
				if (b_hex.length < 2) b_hex = "0" + b_hex;
				
				options.callback(int2hexColor(color));
			}
		}
		else if (polar[0] - centerRadius <= centerRadius) {
			ctx2.clearRect(0, 0, options.width, options.height);
			selectedKey = "center";
			drawSelectedCenter();
			if (callback) options.callback((options.direction)?{red: '00', green: '00', blue: '00', color: '#000000'}:{red: 'ff', green: 'ff', blue: 'ff', color: '#ffffff'});
			
		}
		else if (polar[0] <= options.radius + centerRadius) {
			ctx2.clearRect(0, 0, options.width, options.height);
			selectedKey = "outer";
			drawSelectedOuterRing();
			if (callback) options.callback((!options.direction)?{red: '00', green: '00', blue: '00', color: '#000000'}:{red: 'ff', green: 'ff', blue: 'ff', color: '#ffffff'});
		}
	}
	
	//convert from Cartesian coordinates to polar coordinates
	var decart2polar = function(x, y) {
		var ang = 90-Math.atan2(x, y)/(Math.PI/180);
		if (ang < 0) ang = 360+ang;
		var radius = Math.sqrt(x*x + y*y) + centerRadius;
		return [radius, ang];
	}
	
	//draw selected color sector
	var drawSelector = function(ctx,radius,degrees){
		var pi = Math.PI/180;
		var color = colorPositions[radius + ',' + degrees];
		radius = radius*centerRadius*2 - centerRadius;
		degrees = degrees*sectorWidth;
		if (color != undefined) {
			if (CanvasSupport) {
				ctx.fillStyle = 'rgb(255,255,255)';
				ctx.beginPath();
				ctx.arc(x, y, radius-3, pi*(degrees-1), pi*(degrees+sectorWidth+1), false);
				ctx.arc(x, y, radius+centerRadius*2+2, pi*(degrees+sectorWidth+1), pi*(degrees-1), true);
				ctx.fill();
				ctx.fillStyle = 'rgb('+color+')';
				ctx.beginPath();
				ctx.arc(x, y, radius, pi*degrees, pi*(degrees+sectorWidth), false);
				ctx.arc(x, y, radius+centerRadius*2, pi*(degrees+sectorWidth), pi*degrees, true);
				ctx.fill();
			}
			else {
				ctx.beginPath();
				ctx.strokeStyle = 'rgb(255,255,255)';
				ctx.arc(x, y, radius, pi*degrees, pi*(degrees+sectorWidth), false);
				ctx.arc(x, y, radius+centerRadius*2, pi*(degrees+sectorWidth), pi*degrees, true);
				ctx.arc(x, y, radius, pi*degrees, pi*(degrees+sectorWidth), false);
				ctx2.stroke();
			}
		}
	}
	
	//draw selected center
	var drawSelectedCenter = function(){
		ctx2.beginPath();
		ctx2.strokeStyle = 'rgb(255,255,255)';
		ctx2.arc(x, y, centerRadius, 0, 2*Math.PI, true);
		ctx2.arc(x, y, centerRadius-1, 0, 2*Math.PI, true);
		ctx2.stroke();
	}
	
	//draw selected outer ring
	var drawSelectedOuterRing = function(){
		ctx2.beginPath();
		ctx2.strokeStyle = 'rgb(255,255,255)';
		ctx2.arc(x, y, options.radius, 0, 2*Math.PI, true);
		ctx2.stroke();
		ctx2.beginPath();
		ctx2.arc(x, y, options.radius - centerRadius*2, 0, 2*Math.PI, true);
		ctx2.stroke();
	}
	
	var int2hexColor = function (color){
		var r_hex = color[0].toString(16);
		var g_hex = color[1].toString(16);
		var b_hex = color[2].toString(16);
		if (r_hex.length < 2) r_hex = "0" + r_hex;
		if (g_hex.length < 2) g_hex = "0" + g_hex;
		if (b_hex.length < 2) b_hex = "0" + b_hex;
		return {red: r_hex, green: g_hex, blue: b_hex, color: '#'+r_hex+g_hex+b_hex};
	}
	
	div = $(div);
	div.css({
		width: options.width, 
		height: options.height
		});
	this.append(div);
	div.append(canvasBottom).append(canvasTop);
	$(canvasBottom).css({
		position: 'absolute'});
	$(canvasTop).css({
		position: 'absolute'});
	
	//Draw the circular rainbow
	if (canvasBottom.getContext) {
		var ctx = canvasBottom.getContext("2d");
		var ctx2 = canvasTop.getContext("2d");
		
		//draw the outer ring
		ctx.beginPath();
		if (!options.direction)
			ctx.fillStyle = 'rgb(0,0,0)';
		else
			ctx.fillStyle = 'rgb(255,255,255)';
		ctx.arc(x, y, options.radius, 0, 2*Math.PI, true);
		ctx.fill();
		
		//draw the circle in center
		ctx.beginPath();
		if (options.direction)
			ctx.fillStyle = 'rgb(0,0,0)';
		else
			ctx.fillStyle = 'rgb(255,255,255)';
		ctx.arc(x, y, centerRadius*3+1, 0, 2*Math.PI, true);
		ctx.fill();
		
		//draw colors
		var r, g, b, rc, gc, bc, step, tmpradius;
		var base_step = Math.floor(255/(options.layers/3*2));
		var sectorWidth = 360/options.sectors;
		var colorPositions = {};
		var currentKey = '';
		var selectedKey = '';
		var colorSwitch = options.sectors/6;
		
		for (j=1;j<=options.layers;j++) {
			r = (base_step*j <= 256)? base_step*j:256;
			g = (base_step*j <= 256)?0:base_step*j-256;
			b = (base_step*j <= 256)?0:base_step*j-256;
			step = (base_step*j <= 256)?base_step*j/4:(512-base_step*j)/4;
			for (i=0;i<options.sectors;i++) {
				if (i < colorSwitch) g = g + step;
				if (i >= colorSwitch && i < colorSwitch*2) r = r - step;
				if (i >= colorSwitch*2 && i < colorSwitch*3) b = b + step;
				if (i >= colorSwitch*3 && i < colorSwitch*4) g = g - step;
				if (i >= colorSwitch*4 && i < colorSwitch*5) r = r + step;
				if (i >= colorSwitch*5 && i < colorSwitch*6) b = b - step;
				
				rc = (r > 255)? 255 : Math.floor(r);
				gc = (g > 255)? 255 : Math.floor(g);
				bc = (b > 255)? 255 : Math.floor(b);
				
				ctx.fillStyle = 'rgb(' + rc + ',' + gc + ',' + bc + ')';
				tmpradius = (options.direction)? j: options.layers-j+1;
				colorPositions[tmpradius + ',' + i] = [rc, gc, bc];
				
				drawSector(ctx, tmpradius*centerRadius*2 - centerRadius, i*sectorWidth);
				
				if (options.preselect != '' && int2hexColor([rc, gc, bc]).color == options.preselect) {
					drawSelector(ctx2, tmpradius, i);
					selectedKey = [tmpradius, i];
				}
			}
		}
		
		if (options.preselect != '' && (options.preselect == "#000000" || options.preselect == "#ffffff")) {
			if (options.direction) {
				if (options.preselect == "#000000") {
					drawSelectedCenter();
					selectedKey = "center";
				}
				else {
					drawSelectedOuterRing();
					selectedKey = "outer";
				}
			}
			else {
				if (options.preselect == "#ffffff") {
					drawSelectedCenter();
					selectedKey = "center";
				}
				else {
					drawSelectedOuterRing();
					selectedKey = "outer";
				}
			}
		}
		
		//select color on mouse move
		div.mousemove(function (event) {
			var currx, curry;
			if (!(event.offsetX || event.offsetY)) {
				if (!(event.layerX || event.layerY)) {
					currx = event.pageX - $(this).offset().left;
					curry = event.pageY - $(this).offset().top;
				}
				else {
					currx = event.layerX;
					curry = event.layerY;
				}
			}
			else {
				currx = event.offsetX;
				curry = event.offsetY;
			}
			currx = currx-x;
			curry = curry-y;
			var polar = decart2polar(currx, curry);
			ctx2.clearRect(0, 0, options.width, options.height);
			if (selectedKey != '') {
				if (selectedKey == "outer")
					drawSelectedOuterRing();
				else if (selectedKey == "center")
					drawSelectedCenter();
				else
					drawSelector(ctx2, selectedKey[0], selectedKey[1]);
			}
			if (polar[0] + centerRadius <= options.radius && polar[0] - centerRadius > centerRadius) {
				var radius = Math.floor(polar[0] / (centerRadius*2));
				var ang = Math.floor(polar[1] / sectorWidth);
				drawSelector(ctx2, radius, ang);
			}
			else if (polar[0] - centerRadius <= centerRadius) {
				drawSelectedCenter();
			}
			else if (polar[0] <= options.radius + centerRadius) {
				drawSelectedOuterRing();
			}
		});
		
		
		//clear stage
		div.mouseout(function (event) {
			ctx2.clearRect(0, 0, options.width, options.height);
			if (selectedKey != '') {
				if (selectedKey == "outer")
					drawSelectedOuterRing();
				else if (selectedKey == "center")
					drawSelectedCenter();
				else
					drawSelector(ctx2, selectedKey[0], selectedKey[1]);
			}
		});
		
		
		//remeber color
		div.click(function (event) {
			var currx, curry;
			if (!(event.offsetX || event.offsetY)) {
				if (!(event.layerX || event.layerY)) {
					currx = event.pageX - $(this).offset().left;
					curry = event.pageY - $(this).offset().top;
				}
				else {
					currx = event.layerX;
					curry = event.layerY;
				}
			}
			else {
				currx = event.offsetX;
				curry = event.offsetY;
			}
			currx = currx-x;
			curry = curry-y;
			var polar = decart2polar(currx, curry);
			drawSelected(polar, true);
		});
	}
}
