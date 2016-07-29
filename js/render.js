
define(['rect', 'bucketstack'], function(rect, ss) {

    var min_r, min_i, max_r, max_i;
    var max_itr;
    var range_r, range_i;
    var xscale, yscale;

    var min_size_r, min_size_i; // don't bother making rects smaller than this, they won't render.

    var canvas;
    var context;

    var pending;

    var colors = (function() {
//	var elements = ['ff', 'aa', '55', '00'];
	var elements = ['ff', 'cc', '99', '66', '33', '00'];
	var ca = [];
	for (var r = 0; r < elements.length; r++) {
	    for (var g = 0; g < elements.length; g++) {
		for (var b = 0; b < elements.length; b++) {
		    ca.push('#' + elements[r] + elements[g] + elements[b]);
		}
	    }
	}
	ca.shift(); // don't want black or white.
	ca.pop();
	return ca;
    })();

    var init = function(cvs) {
	canvas = cvs;
	context = canvas.getContext('2d');
    };

    var reset = function(config) {
	// it doesn't seem safe to use the config object directly.
	min_r = config.min_r;
	min_i = config.min_i;
	max_r = config.max_r;
	max_i = config.max_i;
	max_itr = config.max_itr;

	range_r = max_r - min_r;
	range_i = max_i - min_i;

	min_size_r = range_r/canvas.width * 2;
	min_size_i = range_i/canvas.height * 2;

	xscale = canvas.width/(max_r - min_r);
	yscale = canvas.height/(max_i - min_i);

	context.setTransform(
	    1, // horizontal scaling
	    0, // horizontal skewing
	    0, // vertical skewing
	    1,// vertical scaling (TODO: this is upside-down)
	    0, // horizontal translation
	    0// vertical translation (TODO: move to bottom)
	);

	paint_blank();
	pending = ss(max_itr + 1, function(r) {
	    return r.variance();
	});
	pending.push_arr([rect.bounds(min_r, min_i, max_r, max_i, iterate)]);
    };

    var step = function() {

	if (pending.depth() == 0) {
	    return false;
	}
	var r = pending.pop();
	var esc = r.value();
	paint_rect(r, get_color(esc));
	pending.push_arr(r.split(min_size_r, min_size_i));
	return true;
    };

    var exports = {
	init: init,
	reset: reset,
	step: step,
	xToR: xToR,
	yToI: yToI
    };

    return exports;

    function paint_blank() {

	context.fillStyle='#aaaaaa';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	context.strokeStyle = '0xcc0000';
	context.lineWidth = 1;
	context.moveTo(0, iToY(0));
	context.lineTo(canvas.width, iToY(0));
	context.moveTo(rToX(0), 0);
	context.lineTo(rToX(0), canvas.height);
	context.stroke();

    };

    function get_color(value) {
	if (value > max_itr) {
	    return '#000000';
	}
	return colors[value % colors.length];
    };

    function iterate(r, i) {
	var next_r = r;
	var next_i = i;
	var iter = 0;
	var tempx;
	while (iter <= max_itr) {
	    if (next_r*next_r + next_i*next_i >= 4) { // bounds check. Anything outside circle of radius 2 escapes.
		return iter;
	    }
	    tempx = next_r*next_r - next_i*next_i + r;
	    next_i = 2*next_r*next_i + i;
	    next_r = tempx;
	    iter++;
	}
	return max_itr + 1;
    };

    function paint_rect(rect, color) {
	context.fillStyle = color;
	context.fillRect(rToX(rect.min_r), iToY(rect.min_i), xscale*rect.range_r(), yscale*rect.range_i());
    };

    function xToR(x) {
	return x/canvas.width*range_r + min_r;
    };

    function yToI(y) {
	return y/canvas.height*range_i + min_i;
    };

    function rToX(r) {
	return (r - min_r)/range_r*canvas.width;
    };
    
    function iToY(i) {
	return (i - min_i)/range_i*canvas.height;
    };
});


