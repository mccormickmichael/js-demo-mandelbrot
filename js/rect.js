define(function() {

    // define a rectangle by specifying boundaries
    var bounds = function (min_r, min_i, max_r, max_i, value_f) {
	
	var R = function() {
	    this.min_r = min_r;
	    this.min_i = min_i;
	    this.max_r = max_r;
	    this.max_i = max_i;
	    this.value_f = value_f || function() {return 0;};
	};
	R.prototype = rect;
	return new R();
    };

    var point = function(r, i) {
	return {
	    r: r,
	    i: i
	};
    };

    var rect = {
	range_r: function() {
	    return this.max_r - this.min_r;
	},
	range_i: function() {
	    return this.max_i - this.min_i;
	},
	midpoint: function() {
	    return point((this.min_r + this.max_r)/2, (this.min_i + this.max_i)/2);
	},
	value: function() {
	    var mp = this.midpoint();
	    return this.value_f(mp.r, mp.i);
	},
	variance: function() { // max difference between escape values of corners.
	    // variance is expensive! only compute it once.
	    if (this.c_variance === undefined) {
		var v1 = this.value_f(this.min_r, this.min_i);
		var v2 = this.value_f(this.min_r, this.max_i);
		var v3 = this.value_f(this.max_r, this.max_i);
		var v4 = this.value_f(this.max_r, this.min_i);

		var max = Math.max(v4, Math.max(v3, Math.max(v2, v1)));
		var min = Math.min(v4, Math.min(v3, Math.min(v2, v1)));

		this.c_variance = max - min;
	    }
	    return this.c_variance;
	},
	    
	split: function(limit_r, limit_i) {
	    var mp = this.midpoint();
	    if (this.range_r() <= limit_r) {
		if (this.range_i() <= limit_i) {
		    return []; // both ranges too small, no splitting
		}
		return [
		    bounds(this.min_r, mp.i, this.max_r, this.max_i, this.value_f), // bottom
		    bounds(this.min_r, this.min_i, this.max_r, mp.i, this.value_f)  // top
		];
	    }
	    if (this.range_i() <= limit_i) {
		return [
		    bounds(this.min_r, this.min_i, mp.r, this.max_i, this.value_f), // left
		    bounds(mp.r, this.min_i, this.max_r, this.max_i, this.value_f)  // right
		];
	    }
	    return [
		bounds(mp.r, mp.i, this.max_r, this.max_i, this.value_f), // top right
		bounds(this.min_r, mp.i, mp.r, this.max_i, this.value_f), // top left
		bounds(this.min_r, this.min_i, mp.r, mp.i, this.value_f), // bottom left
		bounds(mp.r, this.min_i, this.max_r, mp.i, this.value_f)  // bottom right
	    ];
	}
    };

    var exports = {
	bounds: bounds
    };

    return exports;
});
