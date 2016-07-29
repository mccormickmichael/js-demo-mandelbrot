// Don't need a requirejs.config just yet.

require(['render'], function(render) {

    var minx_field, miny_field, maxx_field, maxy_field;
    var iterations, delay, steps;
    
    var start_button, stop_button, step_button, redraw_button, restore_button;

    var status_block;
    var message_block;

    var canvas;
    var renderer;

    // state management
    var running = false;
    var finished = false;

    minx_field = document.getElementById('minx');
    miny_field = document.getElementById('miny');
    maxx_field = document.getElementById('maxx');
    maxy_field = document.getElementById('maxy');
    iterations = document.getElementById('iters');
    delay = document.getElementById('delay');
    steps = document.getElementById('steps');
    
    start_button = document.getElementById('run_start');
    stop_button = document.getElementById('run_stop');
    step_button = document.getElementById('run_step');
    redraw_button = document.getElementById('run_redraw');
    restore_button = document.getElementById('run_restore');

    status_block = document.getElementById('status');
    message_block = document.getElementById('message');
	
    start_button.addEventListener('click', start);
    stop_button.addEventListener('click', stop);
    step_button.addEventListener('click', step);
    redraw_button.addEventListener('click', redraw);
    restore_button.addEventListener('click', restore);

    canvas = document.getElementById('canvas');

    canvas.addEventListener('click', zoom);
    canvas.addEventListener('contextmenu', zoom);

    init_renderer(canvas);
    start();

    function hide_status() {
	status_block.style.visibility = 'hidden';
    };

    function show_status() {
	status_block.style.visibility = 'visible';
    };

    function message(text) {
	message_block.innerHTML = text;
    };

    function zoom(event) {
	// this is how you're supposed to get the position of a click relative to
	// an elements boundaries. But you need to know the transform applied to
	// the canvas to determine the (r, i) coordinates.
	var bounds = this.getBoundingClientRect();
	var x = event.clientX - bounds.left - this.clientLeft + this.scrollLeft;
	var y = event.clientY - bounds.top - this.clientTop + this.scrollTop;
	var zoom_factor = 4;
	if (event.button === 2) {
	    zoom_factor = 1;
	    event.preventDefault();
	    event.returnValue = false;
	    event.cancelBubble = true;
	}

	minx_field.value = render.xToR(x - this.width/zoom_factor);
	miny_field.value = render.yToI(y - this.height/zoom_factor);
	maxx_field.value = render.xToR(x + this.width/zoom_factor);
	maxy_field.value = render.yToI(y + this.width/zoom_factor);

	reset_renderer();
	start();
	
	return false;
    };

    function start() {
	if (running === true) {
	    return;
	}
	if (finished === true) {
	    reset_renderer();
	}

	var delayms = parseInt(delay.value);
	var step_count = parseInt(steps.value);

	message('Running');
	show_status();

	running = true;
	finished = false;
	
	var stepper = function() {
	    if (running) {
		var cont = true;
		var countdown = step_count;
		while (countdown >= 0 && cont === true) {
		    countdown -= 1;
		    cont = render.step();
		    if (cont) {
			setTimeout(stepper, delayms);
		    } else {
			running = false;
			finished = true;
			message('Finished!');
		    }
		}
	    }
	};
	setTimeout(stepper, delayms);
    };

    function stop(event) {
	running = false;
	message('Stopped');
    };

    function step(event) {
	render.step();
    };

    function redraw(event) {
	reset_renderer();
	start();
    };

    function init_renderer(canvas) {
	render.init(canvas);
	reset_renderer(); // unbalanced abstraction level?
    };

    function reset_renderer() {
	render.reset({
	    min_r: parseFloat(minx_field.value),
	    min_i: parseFloat(miny_field.value),
	    max_r: parseFloat(maxx_field.value),
	    max_i: parseFloat(maxy_field.value),
	    max_itr: parseInt(iterations.value)
	});
    };

    function restore() {
	minx_field.value = '-2.0';
	miny_field.value = '-1.25';
	maxx_field.value = '0.5';
	maxy_field.value = '1.25';
	iterations.value = '20';
	delay.value = '0';
	steps.value = '10';
    };
});
