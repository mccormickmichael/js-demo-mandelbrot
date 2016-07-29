// Maintain a priority stack by assigning each object to a bucket based on its value.
// Might not work well for lots of buckets sparsely populated, but we'll see...
// 

define(function() {

    // first iteration: fixed bucket count, simple array for each bucket.
    // optimizations: dynamic buckets, linked list for each bucket?


    return function(bucket_count, value_f) {
	bucket_count += 1;

	var buckets = new Array(bucket_count);
	var best_content = -1; // which is the best bucket with content?
	var count = 0;
	
	// for (var i = 0; i < bucket_count; i++) {
	//     buckets[i] = [];
	// }

	var find_best_content = function(start) {
	    // this iterates backwards because the "best content" has the highest value

	    for (var i = start; i >= 0; i--) {
		if (buckets[i] !== undefined) {
		    return i;
		}
	    }
	    return -1;
	};

	var push_one = function(obj) {
	    var value = value_f(obj);
	    if (value < bucket_count) { // drop anyone with too high a value. Too bad.

		buckets[value] = {
		    n: buckets[value],
		    v: obj
		};
		
		count += 1;
		if (value > best_content) {
		    best_content = value;
		}
	    }
	};

	var pop = function() {
	    if (count === 0) {
		return undefined;
	    }
	    var e = buckets[best_content];
	    buckets[best_content] = e.n;
	    count -= 1;
	    if (buckets[best_content] === undefined) {
		best_content = find_best_content(best_content);
	    }
	    return e.v;
	};

	var push_arr = function(arr) {
	    for (var i = 0; i < arr.length; i++) {
		push_one(arr[i]);
	    }
	};

	var depth = function() {
	    return count;
	};

	return {
	    pop: pop,
	    push_arr: push_arr,
	    depth: depth
	};
    };
});
