/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("./lib/underscore", function (exports, module) {
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

});

require.register("./lib/util", function (exports, module) {
var _=require('./lib/underscore');

/**
 * 常用工具
 */
var Util = {};
/*
 * 检查是否包含制定字符(正则表达式)
 * */
Util.match=function(str,matchs){
    var regStr='';
    if(this.isArray(matchs)){
        _.each(matchs,function(v){
            regStr=regStr+v+'|';
        });
        regStr = regStr.substr(0, regStr.length - 1);
    }else{
        regStr=matchs;
    }
    reg=new RegExp(regStr);
    return reg.test(str);
};
/*
 * 按名字获取内容,一半用于head meta中
 * */
Util.getContentByName = function (name) {
    if (document.getElementsByName(name).length == 1) {
        return document.getElementsByName(name)[0].getAttribute("content");
    } else {
        return false;
    }
};
/*
 * 删除对象属性
 * */
Util.clearKey=function(obj,key){
    if(_.has(obj,key)){
        delete obj[key];
    }
};

/*
 * 删除多个对象属性
 * */
Util.clearKeys=function(obj,key){
    var self=this;
    if(self.isString(key)){
        self.clearKey(obj,key);
    }else if(self.isArray(key)){
        _.each(key,function(v){
            self.clearKey(obj,v);
        })
    }else if(self.isObject(key)){
        _.each(key,function(v,k){
            self.clearKey(obj,k);
        })
    }
};

/*
 * 替换字符串
 * */
Util.replace = function (str, sptr, sptr1) {
    str = str.replace(new RegExp(sptr, 'gm'), sptr1);
    return str;
};
/*
 * 替代js本身的 eval,避免编译错误
 * */
Util.eval = function (v) {
    var estr = ('(' + v + ')');
    var Fn = Function;  //一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + estr)();
};
/*
 * 获取js
 * */
Util.getScript = function (src, callback) {
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");
    script.async = "true";
    script.src = src;
    var done = false;
    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                callback(script);
            } catch (err) {
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
};
/*
 * 获取css
 * */
Util.getCss = function (src, callback) {
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("link");
    script.async = "true";
    script.href = src;
    script.rel = 'stylesheet';
    script.type = 'text/css';

    var done = false;

    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                callback(script);
            } catch (err) {
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
};

/*
 * String 转 vars对象
 * */
Util.stringToVars = function (str) {
    var obj = {};
    var node;
    var arrSource = unescape(str).split("&");
    i = 0;
    while (i < arrSource.length) {
        if (arrSource[i].indexOf("=") > 0) {
            node = arrSource[i].split("=");
            obj[node[0]] = node[1];

        }
        i++;
    }
    return obj;
};
/*
 * vars对象 转 String
 * */
Util.varsToString = function (obj) {
    var str = '';
    for (var i in obj) {
        str += i + '=' + obj[i + ''] + '&';
    }
    str = str.substr(0, str.length - 1);
    return str;
};


Util.intToString = function (v, length, add_character) {
    if (!add_character) {
        add_character = '0';
    }
    var str;
    if (this.isString(v)) {
        str = v;
    } else {
        str = v.toString();
    }

    while (str.length < length) {
        str = add_character + str;
    }
    return str;

};
/* 模版 Nano Templates - https://github.com/trix/nano
 *  nano("<p>Hello {user.first_name} {user.last_name}! Your account is <strong>{user.account.status}</strong></p>", data)
 * */


Util.nano = function (template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."), v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
    });
};


//是否数组
Util.isString = function (arg) {
    return Object.prototype.toString.call(arg) === '[object String]';
};
//是否数组
Util.isObject = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
};
//是否数组
Util.isNumber = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Number]';
};
//是否数组
Util.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};
//获取当前时间戳
Util.getTime = function () {
    if (!Date.now) {
        return new Date().getTime();
    } else {
        return Date.now();
    }
};

//对js原生扩展

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


module.exports = Util;

});

require.register("./lib/css", function (exports, module) {
var _ = require("./lib/underscore");
var Util = require("./lib/util");
var Css = {};
Css.fixValue = function (value, ext) {
    if (Util.isString(value)) {
        if (Util.match(value, 'px$|%$|cm$|em$|rem$|pt$|ms$|s$')) {
            return value;
        }
    }
    if (!ext) {
        ext = 'px';
    }
    value = parseFloat(value);
    return value + ext;
};
Css.withExt=function(key,value,ext){
    if (Util.isString(key)) {
        if (Util.match(key, 'width|height|top|left|right|bottom|margin|padding|size')) {
            return this.fixValue(value, ext);
        } else {
            return value;
        }
    }
    return value;
};

Css.fixCss = function (name, attr) {
    cssObj = {};
    cssObj[name] = attr;
    cssObj['-webkit-' + name] = attr;
    cssObj['-moz-' + name] = attr;
    cssObj['-ms-' + name] = attr;
    cssObj['-o-' + name] = attr;
    return cssObj;
};
Css.transitionObject = function (obj) {
    var option = _.extend({property: "all", duration: 0, delay: 0, func: "ease"}, obj);
    var self = this;
    var transition = {};
    _.each(option, function (value, key) {
        switch (key) {
            case 'property':
                transition = _.extend(transition, self.fixCss('transition-property', value));
                break;
            case 'duration':
                transition = _.extend(transition, self.fixCss('transition-duration', value));
                break;
            case 'func':
                transition = _.extend(transition, self.fixCss('transition-timing-function', value));
                break;
            case 'delay':
                transition = _.extend(transition, self.fixCss('transition-delay', value));
                break;
        }
    });
    return transition;
};

Css.transformObject = function (obj, ext) {
    return this.fixCss('transform', this.transformString(obj, ext))
};

function formatScaleInObject(obj) {
    var scale = {scaleX: 1, scaleY: 1};
    if (_.has(obj, 'scale')) {
        scale.scaleX = obj.scale;
        scale.scaleY = obj.scale;
        delete obj.scale;
    }
    if (_.has(obj, 'scaleX')) {
        scale.scaleX = obj.scaleX;
        delete obj.scaleX;
    }
    if (_.has(obj, 'scaleY')) {
        scale.scaleY = obj.scaleY;
        delete obj.scaleY;
    }

    obj.scaleString = 'scale(' + scale.scaleX + ',' + scale.scaleY + ') ';
}

Css.transformString = function (obj, ext) {
    var self = this;
    var string = '';
    obj = _.clone(obj);
    formatScaleInObject(obj);
    _.each(obj, function (value, key) {

        switch (key) {
            case 'x':
                string += 'translateX(' + self.fixValue(value, ext) + ') ';
                break;
            case 'y':
                string += 'translateY(' + self.fixValue(value, ext) + ') ';
                break;
            case 'scaleString':
                string += value;
                break;
            case 'rotate':
                string += 'rotate(' + self.fixValue(value, 'deg') + ') ';
                break;
            case 'rotateX':
                string += 'rotateX(' + self.fixValue(value, 'deg') + ') ';
                break;
            case 'rotateY':
                string += 'rotateY(' + self.fixValue(value, 'deg') + ') ';
                break;
            case 'rotateZ':
                string += 'rotateZ(' + self.fixValue(value, 'deg') + ') ';
                break;
        }
    });
    return string;
};
Css.transformOriginObject = function (x, y, ext) {
    return this.fixCss('transform-origin', this.fixValue(x, ext) + ' ' + this.fixValue(y, ext));
};
Css.animationDurationObject = function (time) {
    return this.fixCss('animation-duration', this.fixValue(time,'s'));
};
Css.animationDelayObject = function (time) {
    return this.fixCss('animation-delay', this.fixValue(time,'s'));
};
Css.smartObject = function (obj, ext) {
    var self=this;
    obj= _.clone(obj);
    var transform = this.transformObject(obj, ext);
    Util.clearKeys(obj, ['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY']);
    _.each(obj,function(value,key){
        obj[key]=self.withExt(key,value,ext);
    });
    return _.extend(obj,transform);
};
module.exports = Css;
});

require.register("./lib/size", function (exports, module) {
var _ = require("./lib/underscore");
function Size(x, y, width, height) {
    this.x = x||0;
    this.y = y||0;
    this.width = width||0;
    this.height = height||0;
};
Size.prototype.fixInRec = function ( recBig) {
    var rec=this;
    var obj = {width: 0, height: 0};
    var rad = rec.width / rec.height;
    var radbig = recBig.width / recBig.height;
    if (rad > radbig) {
        obj.width = recBig.width;
        obj.height = obj.width / rad;
    } else {
        obj.height = recBig.height;
        obj.width = obj.height * rad;
    }
    obj.x = (recBig.width - obj.width) / 2;
    obj.y = (recBig.height - obj.height) / 2;
    obj.scale = obj.width / rec.width;
    return obj;
};
Size.prototype.fillInRec = function (recBig) {
    var rec=this;
    var obj = {width: 0, height: 0};
    var rad = rec.width / rec.height;
    var radbig = recBig.width / recBig.height;
    if (rad < radbig) {
        obj.width = recBig.width;
        obj.height = obj.width / rad;
    } else {
        obj.height = recBig.height;
        obj.width = obj.height * rad;

    }
    obj.x = (recBig.width - obj.width) / 2;
    obj.y = (recBig.height - obj.height) / 2;
    obj.scale = obj.width / rec.width;
    return obj;
};
module.exports = Size;
});

require.register("./lib/input", function (exports, module) {
/**
 * 常用输入检测
 */
var Input = {};
Input.TEXT=1;
Input.NUMBER=2;
Input.EMAIL=3;
Input.PASSWORD=4;
Input.RADIO=6;
Input.CHECKBOX=7;
Input.COMBOBOX=8;
Input.TEXTAREA=9;
Input.FILE=10;
Input.IMAGE=11;
Input.DATE=20;
Input.DATETIME=21;

/*
 * 是否邮箱
 * */

Input.isEmail = function (str) {
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);
};
/*
 * 是否http
 * */
Input.isHttp = function (str) {
    str = str.toLowerCase();
    var reg = /^http:\/\//;
    return reg.test(str);
};
/*
 * 是否Https
 * */
Input.isHttps = function (str) {
    str = str.toLowerCase();
    var reg = /^https:\/\//;
    return reg.test(str);
};
/*
 * 是否 //的url
 * */
Input.isFlexUrl = function (str) {
    str = str.toLowerCase();
    var reg = /^\/\//;
    return reg.test(str);
};

/*
 * 是否邮箱
 * */
Input.isLink = function (str) {

    return this.isHttp(str) || this.isHttps(str);
};
module.exports = Input;

});

require.register("./lib/file", function (exports, module) {
var _=require('./lib/underscore');
var Util=require('./lib/util');

/**
 * 常用输入检测
 */
var File = {};


File.jpg='.jpg$|.jpeg$';
File.png='.png$';
File.gif='.gif$';
File.svg='.svg$';
File.sql='.sql$';
File.excel='.xls$|.xlsx|.xlsm';


/*
 * 是否Jpg
 * */

File.isJpg = function (str) {
    return Util.match(str.toLowerCase(),File.jpg);
};

/*
 * 是否Gif
 * */
File.isGif = function (str) {
    return Util.match(str.toLowerCase(),File.gif);
};
/*
 * 是否png
 * */
File.isPng = function (str) {
    return Util.match(str.toLowerCase(),File.png);
};
/*
 * 是否svg
 * */
File.isSvg = function (str) {
    return Util.match(str.toLowerCase(),File.svg);
};
/*
 * 是否图片 不含svg
 * */
File.isImage = function (str) {
    return Util.match(str.toLowerCase(),[File.jpg,File.gif,File.png]);
};

/*
 * 是否sql
 * */
File.isSql = function (str) {
    return Util.match(str.toLowerCase(),File.sql);
};
/*
 * 是否Excel
 * */
File.isExcel = function (str) {
    return Util.match(str.toLowerCase(),File.excel);
};

module.exports = File;

});

require.register("./lib/event-dispatcher", function (exports, module) {
var _ = require('./lib/underscore');


/**
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function () {};

EventDispatcher.prototype = {

    constructor: EventDispatcher,

    apply: function ( object ) {

        object.addEventListener = EventDispatcher.prototype.addEventListener;
        object.hasEventListener = EventDispatcher.prototype.hasEventListener;
        object.removeEventListener = EventDispatcher.prototype.removeEventListener;
        object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;

    },

    addEventListener: function ( type, listener ) {

        if ( this._listeners === undefined ) this._listeners = {};

        var listeners = this._listeners;

        if ( listeners[ type ] === undefined ) {

            listeners[ type ] = [];

        }

        if ( listeners[ type ].indexOf( listener ) === - 1 ) {

            listeners[ type ].push( listener );

        }

    },

    hasEventListener: function ( type, listener ) {

        if ( this._listeners === undefined ) return false;

        var listeners = this._listeners;

        if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

            return true;

        }

        return false;

    },

    removeEventListener: function ( type, listener ) {

        if ( this._listeners === undefined ) return;

        var listeners = this._listeners;
        var listenerArray = listeners[ type ];

        if ( listenerArray !== undefined ) {

            var index = listenerArray.indexOf( listener );

            if ( index !== - 1 ) {

                listenerArray.splice( index, 1 );

            }

        }

    },

    dispatchEvent: function ( event ) {

        if ( this._listeners === undefined ) return;

        var listeners = this._listeners;
        var listenerArray = listeners[ event.type ];

        if ( listenerArray !== undefined ) {

            event.target = this;

            var array = [];
            var length = listenerArray.length;

            for ( var i = 0; i < length; i ++ ) {

                array[ i ] = listenerArray[ i ];

            }

            for ( var i = 0; i < length; i ++ ) {

                array[ i ].call( this, event );

            }

        }

    }

};





module.exports = EventDispatcher;

});

require.register("./lib/file-button", function (exports, module) {
var EventDispatcher = require('./lib/event-dispatcher');
var $ = window.$;

/**
 * 文件按钮
 * change 事件
 *
 *
 * 和Fastclick有冲突
 */

var filebuttonCount=0;
function FileBtton(dom,read) {
    this.dom = $(dom);
    this.read=read||true;
    EventDispatcher.prototype.apply(FileBtton.prototype);
    this.init();
}
FileBtton.prototype.hiddenFile=function(){
    this.file.css({'height':'0px','width':'0px',overflow:"hidden"});
};
FileBtton.prototype.init = function () {
    var me = this;
    filebuttonCount++;

    me.file = $('<input type="file" style="display:none;width:0px;height:0px;overflow: hidden;" hidden="hidden" id="FileBtton_' + filebuttonCount + '"/>');
    me.dom.click(function () {
        me.file.click();
    });
    me.file.change(function () {
        var data = {type: "change",inputFile:me.file,file: me.file.get(0).files[0]};
        me.file.hide();
        me.dispatchEvent(data);
    });
};


module.exports = FileBtton;

});

require.register("./lib/tween", function (exports, module) {
//------------------------------
// Tween
//------------------------------
var _ = require('./lib/underscore');
Tween = (function() {
  if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }
  //------------------------------
  // Constants
  //------------------------------

  var PI = Math.PI;
  var acos = Math.acos;
  var pow = Math.pow;
  var cos = Math.cos;
  var sin = Math.sin;
  var raf = requestAnimationFrame;
  var caf = cancelAnimationFrame;

  //------------------------------
  // Helpers
  //------------------------------

  function isFunction(object) {
    return Object.prototype.toString.call(object) == '[object Function]';
  }

  function trigger(callbacks, callback) {
    if (isFunction(callback)) {
      callbacks.push(callback);
    } else {
      if (callbacks.length) {
        var params = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, n = callbacks.length; i < n; i++) {
          callbacks[i].apply(null, params);
        }
      }        
    }
  }

  function ease(core) {
    core.in = core;
    core.out = function(t) {
      return 1 - core(1 - t);
    };
    core.inOut = function(t) {
      return t <= 0.5 ? core(t * 2) / 2 : (2 - core(2 * (1 - t))) / 2;
    };
    return core;
  }

  function copy(target, options) {
    var result = {};
    for (var key in options) {
      result[key] = target[key];
    }
    return result;
  }

  
function now() {
    return  Date.now();
  }

  //------------------------------
  // Prototype
  //------------------------------

  function Tween(target, duration, options) {
    this.startTime = now();
    this.duration = duration;
    this.options = options;
    this.target = target;
    this.easing = API.Linear;
    this.onStart = [];
    this.onStep = [];
    this.onDone = [];
    this.progress = 0;
    this.paused = false;
    this.alive = true;
    this.delay = 0;
  }

  Tween.prototype = {

    wait: function(delay) {
      this.delay = delay;
      return this;
    },

    ease: function(callback) {
      this.easing = callback;
      return this;
    },

    kill: function() {
      this.alive = false;
      return this;
    },

    start: function(callback) {
      trigger(this.onStart, callback);
      return this;
    },

    pause: function() {
      if (!this.paused) {
        this.pauseTime = now();
        this.paused = true;
      }
    },

    play: function() {
      if (this.paused) {
        this.startTime += now() - this.pauseTime;
        this.paused = false;
      }
    },
    
    step: function(callback) {

      trigger(this.onStep, callback);
      return this;
    },

    done: function(callback) {
      trigger(this.onDone, callback);
      return this;
    }
  };

  //------------------------------
  // Engine
  //------------------------------

  var running = false;
  var tweens = [];
  var req;

  function update() {

    if (running) {

      var tween, delta, key, a, b;

      for (var i = tweens.length - 1; i >= 0; i--) {
        
        tween = tweens[i];

        if (tween.alive) {

          delta = (now() - tween.startTime) * 0.001;

          if (delta > tween.delay && !tween.paused) {
            
            if (tween.progress === 0) {
              tween.initial = copy(tween.target, tween.options); 
              trigger(tween.onStart, tween);
            }

            tween.progress = (delta - tween.delay) / tween.duration;
            tween.progress = Math.max(0.0, Math.min(tween.progress, 1.0));

            for (key in tween.options) {
              a = tween.initial[key];
              b = tween.options[key];
              tween.target[key] = a + (b - a) * tween.easing(tween.progress);
            }
             


            trigger(tween.onStep, tween);
          }

          if (tween.progress >= 1.0) {
            tween.alive = false;
            trigger(tween.onDone, tween);
          }  
        }

        if (!tween.alive) {
          tweens.splice(i, 1);
        }
      }

      if (tweens.length) {
        req = raf(update);
      } else {
        running = false;
      }
    }
  }

  function start() {
    if (!running) {
      req = raf(update);
      running = true;
    }
  }

  function stop() {
    running = false;
    caf(req);
  }

  function queue(tween) {
    tweens.push(tween);
    start();
    return tween;
  }

  //------------------------------
  // API
  //------------------------------

  var API = {

    Linear: ease(function(t) {
      return t;
    }),

    Elastic: ease(function(t) {
      return pow(2, 10 * --t) * cos(20 * t * PI * 1 / 3 );
    }),

    Bounce: ease(function(t) {
      for (var n, a = 0, b = 1; 1; a += b, b /= 2) {
        if (t >= (7 - 4 * a) / 11){
          n = -pow((11 - 6 * a - 11 * t) / 4, 2) + b * b;
          break;
        }
      }
      return n;
    }),

    Back: ease(function(t) {
      return pow(t, 2) * ((1.618 + 1) * t - 1.618);
    }),

    Sine: ease(function(t) {
      return 1 - sin((1 - t) * PI / 2);
    }),

    Circ: ease(function(t) {
      return 1 - sin(acos(t));
    }),

    Expo: ease(function(t) {
      return pow(2, 10 * (t - 1));
    }),

    Quad: ease(function(t) {
      return pow(t, 2);
    }),

    Cubic: ease(function(t) {
      return pow(t, 3);
    }),

    Quart: ease(function(t) {
      return pow(t, 4);
    }),

    Quint: ease(function(t) {
      return pow(t, 5);
    }),

    to: function(target, duration, options) {
      var tween = new Tween(target, duration, options);
      return queue(tween);
    }
  };

  return API;

})();

module.exports = Tween;

});

require.register("./lib/drag", function (exports, module) {
/**
 * Created by johnny on 16/3/13.
 */
/*!
 * drag.js - copyright Jake Luer 2011
 * https://github.com/jakeluer/drag.js
 * MIT License
 */
var _ = require('./lib/underscore');
var $ = window.$;
var EventDispatcher = require("./lib/event-dispatcher");
var Tween=require('./lib/tween');
/**
 * 设备信息
 */
var is_touch_device = !!('ontouchstart' in window);

var Drag = function (dom, option) {
    var def = {minX: 0, maxX: 100, minY: 0, maxY: 0, scaleX: 1, scaleY: 1,startDom:false};
    this.opt = _.extend(def, option);
    this.opt.width = this.opt.maxX - this.opt.minX;
    this.opt.height = this.opt.maxY - this.opt.minY;
    this.dom = $(dom);
    if(this.opt.startDom==false){
        this.startDom=this.dom;
    }else {
        this.startDom=$( this.opt.startDom);
    }

    this.init();
};

function getPositon(e) {
    if (is_touch_device) {
        var _touch = e.originalEvent.targetTouches[0];
        if (!_touch) {
            _touch = e.originalEvent.changedTouches[0];
        }
        return {x: _touch.clientX, y: _touch.clientY};
    } else {
        return {x: e.originalEvent.clientX, y: e.originalEvent.clientY};
    }
}

Drag.prototype.init = function () {

    EventDispatcher.prototype.apply(Drag.prototype);
    var self = this;
    var dis = {x: 0, y: 0};
    var startPos = {x: 0, y: 0};
    var start;

    self.updateScale = function (x, y) {
        self.opt.scaleX = x;
        self.opt.scaleY = y;
    };
    self.setValue = function (vx, vy) {
        var pos = {};
        pos.x = vx * self.opt.width+ self.opt.minX;
        pos.y = vy * self.opt.height + self.opt.minY;
        self.update(pos);
        self.dispatchEvent({type: "update"});

    };
    self.destroy=function(){
        $(window).unbind(self.evs.move, self.dragMove);
        $(window).unbind(self.evs.end, self.dragEnd);
        self.startDom.unbind(self.evs.start, self.dragStart);
    };


    self.tweenTo = function (vx, vy, time, func) {
        if (!func) {
            func = Tween.Sine.inOut;
        }
        if (!time) {
            time = 0.5;
        }

        var target = {valueX: self.valueX, valueY: self.valueY};

        self.tween_obj = Tween.to(target, time, {valueX: vx, valueY: vy}).ease(func).step(function (tween) {
            self.setValue(tween.target.valueX,  tween.target.valueY);

        });
        return self.tween_obj;
    };

    self.update = function (domPos) {
        domPos.x = Math.max(Math.min(domPos.x, self.opt.maxX), self.opt.minX);
        domPos.y = Math.max(Math.min(domPos.y, self.opt.maxY), self.opt.minY);
        if (self.opt.width == 0) {
            self.valueX = 0;
        } else {
            self.valueX = (domPos.x - self.opt.minX) / self.opt.width;
        }
        if (self.opt.height == 0) {
            self.valueY = 0;
        } else {
            self.valueY = (domPos.y - self.opt.minY) / self.opt.height;
        }

        self.dom.css({'margin-left': domPos.x, 'margin-top': domPos.y});


    };

    function getAbsPos(pos){
        pos.x = pos.x / self.opt.scaleX;
        pos.y = pos.y / self.opt.scaleY;
        return   {x: startPos.x + pos.x, y: startPos.y + pos.y};
    }

    self.dragMove = function (e) {
        var pos = getPositon(e);
        dis.x = pos.x - start.x;
        dis.y = pos.y - start.y;
        self.update(getAbsPos(dis));
        self.dispatchEvent({type: "update"});
    };
    self.dragEnd = function (e) {
        var pos = getPositon(e);
        dis.x = pos.x - start.x;
        dis.y = pos.y - start.y;
        self.update(getAbsPos(dis));
        $(window).unbind(self.evs.move, self.dragMove);
        $(window).unbind(self.evs.end, self.dragEnd);
        self.startDom.bind(self.evs.start, self.dragStart);
        self.dispatchEvent({type: "end"});
    };


    self.dragStart = function (e) {
        if (self.tween_obj) {
            self.tween_obj.kill();
        }
        startPos.x = parseFloat(self.dom.css('margin-left'));
        startPos.y = parseFloat(self.dom.css('margin-top'));
        start = getPositon(e);
        dis.x = dis.y = 0;
        self.update(getAbsPos(dis));
        $(window).bind(self.evs.move, self.dragMove);
        $(window).bind(self.evs.end, self.dragEnd);
        self.startDom.unbind(self.evs.start, self.dragStart);
        self.dispatchEvent({type: "start"});
    };

    self.evs = (function () {
        if (is_touch_device) {
            return {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend'
            };
        }
        else {
            return {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            };
        }
    }());
    var prevDef = function (e3) {
        e3.preventDefault();
        e3.stopPropagation();
    };
    self.dom.bind('selectstart', prevDef);
    self.dom.bind('dragstart', prevDef);
    self.startDom.bind(self.evs.start, self.dragStart);
};


module.exports = Drag;

});

require.register("./lib/sound", function (exports, module) {
var _ = require('./lib/underscore');
var EventDispatcher = require("./lib/event-dispatcher");
/**
 * 声音播放
 */

function Sound(config) {
    this.init(config);
}

Sound.prototype = {
    init: function (config) {
        var me = this;
        EventDispatcher.prototype.apply(Sound.prototype);
        this.config = _.extend({

            autoload: false


        }, config);

        if (!this.config.path) {
            console.log('path is need');
        } else {

            this.audio = new Audio(this.config.path);
            for (var key in this.config) {
                if (this.config.hasOwnProperty(key) && (key in this.audio)) {
                    this.audio[key] = this.config[key];
                }
            }
            this.audio.onended = function () {
                me.dispatchEvent({type: "onended"});
            }
            this.audio.oncanplay=function(){
                me.dispatchEvent({type: "oncanplay"});
            }
            this.audio.onloadeddata = function () {
                //me.stop();
                me.dispatchEvent({type: "onloadeddata"});
            };
            this.audio.load();

        }

    },

    play: function () {

        this.audio.play();
        this.dispatchEvent({type: "play"});
    },
    destory: function () {
        this.audio.src = '';
    },
    pause: function () {

        this.audio.pause();
        this.dispatchEvent({type: "pause"});
    },
    playing:function(){
        return !this.audio.paused;
    },
    currentTime:function(){
        return this.audio.currentTime;
    },
    duration:function(){
        return this.audio.duration;
    },

    onended:function(){
        this.dispatchEvent({type: "stop"});
    },

    stop: function () {
        this.audio.pause();
       // this.audio.currentTime = 0;
        this.dispatchEvent({type: "stop"});
    },

    toggle: function () {

        if (this.audio.paused) {

            this.play();
        } else {
            this.pause();
        }

    },

    seek: function (time) {

        this.audio.currentTime = parseInt(time, 10);
    },


    percent: function () {
        return (this.audio.currentTime / this.audio.duration) || 0;

    }


};


module.exports = Sound;

});

require.register("./lib/ui-go-mark", function (exports, module) {
var _ = require('./lib/underscore');
var $ = window.$;
/**
 * 微信分享
 */

function UIGoMark(dom, option) {
    this.dom = $(dom);
    this.init(option)
}
UIGoMark.prototype.init = function (opt) {
    var me = this;
    me.opt = _.extend({time: 500, type: "y", body: 'html,body', mark: 'body'}, opt);
    me.dom.click(function () {

        me.goTop();
    })
};
UIGoMark.prototype.goPosition = function (top, left, time, callback) {
    var me = this;
    var toObj = {};
    left=left||0;
    time=time||500;
    callback=callback||function(){};

    toObj.scrollTop = top + 'px';


    toObj.scrollLeft = left + 'px';


    $(me.opt.body).animate(toObj, time, function () {
        if (callback) {
            callback(me);
        }
    });
}
UIGoMark.prototype.goTop = function () {
    var me = this;
    var mark = $(me.opt.mark);

    if (mark.offset()) {

    } else {
        mark = $(mark.first());
    }
    var position = mark.offset();

    var toObj = {};
    if (me.opt.type != 'x') {

        toObj.scrollTop = position.top + 'px'

    }
    if (me.opt.type != 'y') {

        toObj.scrollLeft = position.left + 'px'


    }


    if (window.Zepto) {
        console.log('UIGoMark is not support Zepto');
    } else {
        $(me.opt.body).animate(toObj, me.opt.time, function () {
            if (me.opt.callback) {
                me.opt.callback(me);
            }
        });

    }


};


module.exports = UIGoMark;

});

require.register("./lib/css-animations", function (exports, module) {
/*
 * Author: Alex Gibson
 * https://github.com/alexgibson/shake.js
 * License: MIT license
 */

(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(global, global.document);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document);
    } else {
        global.CSSAnimations = factory(global, global.document);
    }
}(typeof window !== 'undefined' ? window : this, function (window, document) {


    var _ = require('./lib/underscore');
    var Util = require('./lib/util');
    var Css = require('./lib/css');
    var $ = window.$;
    // Utility

    function findKeyframeRules(styles, func) {
        var rules = styles.cssRules || styles.rules || [];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (rule.type == CSSRule.IMPORT_RULE) {
                findKeyframeRules(rule.styleSheet, func);
            }
            else if (rule.type === CSSRule.KEYFRAMES_RULE ||
                rule.type === CSSRule.MOZ_KEYFRAMES_RULE ||
                rule.type === CSSRule.WEBKIT_KEYFRAMES_RULE) {
                func(rule, styles, i);
            }
        }
    }

    // Classes

    function KeyframeRule(r) {
        this.original = r;
        this.keyText = r.keyText;
        this.css = {};

        // Extract the CSS as an object
        var rules = r.style.cssText.split(';');

        for (var i = 0; i < rules.length; i++) {
            var parts = rules[i].split(':');

            if (parts.length == 2) {
                var key = parts[0].replace(/^\s+|\s+$/g, '');
                var value = parts[1].replace(/^\s+|\s+$/g, '');

                this.css[key] = value;
            }
        }
    };

    function KeyframeAnimation(kf) {
        this.original = kf;
        this.name = kf.name;
        this.keyframes = [];
        this.keytexts = [];
        this.keyframeHash = {};

        this.initKeyframes();
    };

    KeyframeAnimation.prototype.initKeyframes = function () {
        this.keyframes = [];
        this.keytexts = [];
        this.keyframeHash = {};

        var rules = this.original;

        for (var i = 0; i < rules.cssRules.length; i++) {
            var rule = new KeyframeRule(rules.cssRules[i]);
            this.keyframes.push(rule);
            this.keytexts.push(rule.keyText);
            this.keyframeHash[rule.keyText] = rule;
        }
    };

    KeyframeAnimation.prototype.getKeyframeTexts = function () {
        return this.keytexts;
    };

    KeyframeAnimation.prototype.getKeyframe = function (text) {
        return this.keyframeHash[text];
    };

    KeyframeAnimation.prototype.fixStyle = function (name, value) {
        var style = name + ':' + value + ';';
        switch (name) {

            case 'transform':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'transform-origin':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'transform-style':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'perspective':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'perspective-origin':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'backface-visibility':
                style += '-webkit-' + name + ':' + value + ';';
                break;

        }


        return style;
    };


    KeyframeAnimation.prototype.setKeyframe = function (text, css) {
        var self = this;
        var cssRule = text + " {";
        for (var k in css) {
            cssRule += self.fixStyle(k, css[k]);
        }
        cssRule += "}";

        // The latest spec says that it should be appendRule, not insertRule.
        // Browsers also vary in the semantics of this, whether or not the new
        // rules are merged in with previous ones at the same keyframe or if they
        // are simply replaced. Need to look into that more.
        //
        // https://github.com/jlongster/css-animations.js/issues/4
        if ('appendRule' in this.original) {
            this.original.appendRule(cssRule);
        }
        else {
            this.original.insertRule(cssRule);
        }

        this.initKeyframes();

        // allow for chaining for ease of creation.
        return this;
    };

    KeyframeAnimation.prototype.setKeyframes = function (obj) {
        for (var k in obj) {
            this.setKeyframe(k, obj[k]);
        }
    };

    KeyframeAnimation.prototype.clear = function () {
        for (var i = 0; i < this.keyframes.length; i++) {
            this.original.deleteRule(this.keyframes[i].keyText);
        }
    };

    function Animations() {
        this.animations = {};
        this.id = 0;

        var styles = document.styleSheets;
        var anims = this.animations;

        for (var i = 0; i < styles.length; i++) {
            try {
                findKeyframeRules(styles[i], function (rule) {
                    anims[rule.name] = new KeyframeAnimation(rule);
                });
            }
            catch (e) {
                // Trying to interrogate a stylesheet from another
                // domain will throw a security error
            }
        }
    }

    Animations.prototype.get = function (name) {
        return this.animations[name];
    };

    Animations.prototype.getDynamicSheet = function () {
        if (!this.dynamicSheet) {
            var style = document.createElement('style');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            this.dynamicSheet = style.sheet;
        }

        return this.dynamicSheet;
    };
    Animations.prototype.createSmartAnimation = function (from, to) {
        var self=this;
        var ext = 'px';//后缀
        var smartObjects;
        if (Util.isString(_.last(arguments))) {
            ext = _.last(arguments);
            smartObjects = _.without(arguments, ext);
        } else {
            smartObjects = arguments;
        }
       var animations={};
        var step=smartObjects.length-1;
        _.each(smartObjects,function(obj,index){
            var key=parseInt(index/step*100)+'%';
            animations[key]=Css.smartObject(obj,ext);

        });
        return self.create(animations);
    };

    Animations.prototype.create = function (name, frames) {
        var styles = this.getDynamicSheet();

        // frames can also be passed as the first parameter
        if (typeof name === 'object') {
            frames = name;
            name = null;
        }

        if (!name) {
            this.id++;
            name = 'johnny_css_animation_' + this.id;
        }

        // Append a empty animation to the end of the stylesheet
        try {
            var idx = styles.insertRule('@keyframes ' + name + '{}',
                styles.cssRules.length);
        }
        catch (e) {
            if (e.name == 'SYNTAX_ERR' || e.name == 'SyntaxError') {
                idx = styles.insertRule('@-webkit-keyframes ' + name + '{}',
                    styles.cssRules.length);
            }
            else {
                throw e;
            }
        }

        var anim = new KeyframeAnimation(styles.cssRules[idx]);
        this.animations[name] = anim;

        if (frames) {
            anim.setKeyframes(frames);
        }

        return anim;
    };

    Animations.prototype.remove = function (name) {
        var styles = this.getDynamicSheet();
        name = name instanceof KeyframeAnimation ? name.name : name;

        this.animations[name] = null;

        try {
            findKeyframeRules(styles, function (rule, styles, i) {
                if (rule.name == name) {
                    styles.deleteRule(i);
                }
            });
        }
        catch (e) {
            // Trying to interrogate a stylesheet from another
            // domain will throw a security error
        }
    };
    Animations.prototype.clearAnimationByID = function (id) {
        var ele = typeof(id) == 'string' ? document.getElementById(id) : id;
        ele.style.animationName = null;
        var self = this;

        self.setCss(ele, "animation-name", '');

    };
    Animations.prototype.setCss = function (dom, name, value) {
        dom.style['-webkit-' + name] = value;
        dom.style[name] = value;

    };
    Animations.prototype.addAnimation = function (dom, option) {
        var me = this;
        $(dom).each(function () {
            me.addAnimationToID($(this).get(0), option);
        })
    };


    Animations.prototype.addAnimationToID = function (id, option) {
        var ele = typeof(id) == 'string' ? document.getElementById(id) : id;
        ele.style.animationName = option.name;
        var self = this;
        for (var prop in option) {
            if (option.hasOwnProperty(prop)) {

                switch (prop) {
                    case "name":
                        self.setCss(ele, "animation-name", option[prop]);
                        break;
                    case "duration":
                        self.setCss(ele, "animation-duration", option[prop]);
                        break;
                    case "func":
                        self.setCss(ele, "animation-timing-function", option[prop]);
                        break;
                    case "delay":
                        self.setCss(ele, "animation-delay", option[prop]);
                        break;
                    case "count":
                        self.setCss(ele, "animation-iteration-count", option[prop]);
                        break;
                    case "direction":
                        self.setCss(ele, "animation-direction", option[prop]);
                        break;
                    case "state":
                        self.setCss(ele, "animation-play-state", option[prop]);
                        break;
                    case "transform-origin":
                        self.setCss(ele, "transform-origin", option[prop]);
                        break;
                    case 'transform':
                        self.setCss(ele, "transform", option[prop]);
                        break;
                    case 'transform-style':
                        self.setCss(ele, "transform-style", option[prop]);
                        break;
                    case 'perspective':
                        self.setCss(ele, "perspective", option[prop]);
                        break;
                    case 'perspective-origin':
                        self.setCss(ele, "perspective-origin", option[prop]);
                        break;
                    case 'backface-visibility':
                        self.setCss(ele, "backface-visibility", option[prop]);
                        break;
                }


            }
        }


    };

    return window.CSSAnimations = new Animations;
}));

});

require.register("./lib/loader", function (exports, module) {
var PxLoaderImage = require('./lib/loader/PxLoaderImage.js');
var _ = require('./lib/underscore');
var $ = window.$;

/*
 * PixelLab Resource Loader
 * Loads resources while providing progress updates.
 */
function PxLoader(settings) {

    // merge settings with defaults
    settings = settings || {};
    this.settings = settings;

    // how frequently we poll resources for progress
    if (settings.statusInterval == null) {
        settings.statusInterval = 5000; // every 5 seconds by default
    }

    // delay before logging since last progress change
    if (settings.loggingDelay == null) {
        settings.loggingDelay = 20 * 1000; // log stragglers after 20 secs
    }

    // stop waiting if no progress has been made in the moving time window
    if (settings.noProgressTimeout == null) {
        settings.noProgressTimeout = Infinity; // do not stop waiting by default
    }

    var entries = [],
    // holds resources to be loaded with their status
        progressListeners = [],
        timeStarted, progressChanged = Date.now();

    /**
     * The status of a resource
     * @enum {number}
     */
    var ResourceState = {
        QUEUED: 0,
        WAITING: 1,
        LOADED: 2,
        ERROR: 3,
        TIMEOUT: 4
    };

    // places non-array values into an array.
    var ensureArray = function (val) {
        if (val == null) {
            return [];
        }

        if (Array.isArray(val)) {
            return val;
        }

        return [val];
    };

    // add an entry to the list of resources to be loaded
    this.add = function (resource) {

        // TODO: would be better to create a base class for all resources and
        // initialize the PxLoaderTags there rather than overwritting tags here
        resource.tags = new PxLoaderTags(resource.tags);

        // ensure priority is set
        if (resource.priority == null) {
            resource.priority = Infinity;
        }

        entries.push({
            resource: resource,
            status: ResourceState.QUEUED
        });
    };

    this.addProgressListener = function (callback, tags) {
        progressListeners.push({
            callback: callback,
            tags: new PxLoaderTags(tags)
        });
    };

    this.addCompletionListener = function (callback, tags) {
        progressListeners.push({
            tags: new PxLoaderTags(tags),
            callback: function (e) {
                if (e.completedCount === e.totalCount) {
                    callback(e);
                }
            }
        });
    };

    // creates a comparison function for resources
    var getResourceSort = function (orderedTags) {

        // helper to get the top tag's order for a resource
        orderedTags = ensureArray(orderedTags);
        var getTagOrder = function (entry) {
            var resource = entry.resource,
                bestIndex = Infinity;
            for (var i = 0; i < resource.tags.length; i++) {
                for (var j = 0; j < Math.min(orderedTags.length, bestIndex); j++) {
                    if (resource.tags.all[i] === orderedTags[j] && j < bestIndex) {
                        bestIndex = j;
                        if (bestIndex === 0) {
                            break;
                        }
                    }
                    if (bestIndex === 0) {
                        break;
                    }
                }
            }
            return bestIndex;
        };
        return function (a, b) {
            // check tag order first
            var aOrder = getTagOrder(a),
                bOrder = getTagOrder(b);
            if (aOrder < bOrder) {
                return -1;
            }
            if (aOrder > bOrder) {
                return 1;
            }

            // now check priority
            if (a.priority < b.priority) {
                return -1;
            }
            if (a.priority > b.priority) {
                return 1;
            }
            return 0;
        };
    };

    this.start = function (orderedTags) {
        timeStarted = Date.now();

        // first order the resources
        var compareResources = getResourceSort(orderedTags);
        entries.sort(compareResources);

        // trigger requests for each resource
        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            entry.status = ResourceState.WAITING;
            entry.resource.start(this);
        }

        // do an initial status check soon since items may be loaded from the cache
        setTimeout(statusCheck, 100);
    };

    var statusCheck = function () {
        var checkAgain = false,
            noProgressTime = Date.now() - progressChanged,
            timedOut = (noProgressTime >= settings.noProgressTimeout),
            shouldLog = (noProgressTime >= settings.loggingDelay);

        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            if (entry.status !== ResourceState.WAITING) {
                continue;
            }

            // see if the resource has loaded
            if (entry.resource.checkStatus) {
                entry.resource.checkStatus();
            }

            // if still waiting, mark as timed out or make sure we check again
            if (entry.status === ResourceState.WAITING) {
                if (timedOut) {
                    entry.resource.onTimeout();
                } else {
                    checkAgain = true;
                }
            }
        }

        // log any resources that are still pending
        if (shouldLog && checkAgain) {
            log();
        }

        if (checkAgain) {
            setTimeout(statusCheck, settings.statusInterval);
        }
    };

    this.isBusy = function () {
        for (var i = 0, len = entries.length; i < len; i++) {
            if (entries[i].status === ResourceState.QUEUED || entries[i].status === ResourceState.WAITING) {
                return true;
            }
        }
        return false;
    };

    var onProgress = function (resource, statusType) {

        var entry = null,
            i, len, numResourceTags, listener, shouldCall;

        // find the entry for the resource
        for (i = 0, len = entries.length; i < len; i++) {
            if (entries[i].resource === resource) {
                entry = entries[i];
                break;
            }
        }

        // we have already updated the status of the resource
        if (entry == null || entry.status !== ResourceState.WAITING) {
            return;
        }
        entry.status = statusType;
        progressChanged = Date.now();

        numResourceTags = resource.tags.length;

        // fire callbacks for interested listeners
        for (i = 0, len = progressListeners.length; i < len; i++) {

            listener = progressListeners[i];
            if (listener.tags.length === 0) {
                // no tags specified so always tell the listener
                shouldCall = true;
            } else {
                // listener only wants to hear about certain tags
                shouldCall = resource.tags.intersects(listener.tags);
            }

            if (shouldCall) {
                sendProgress(entry, listener);
            }
        }
    };

    this.onLoad = function (resource) {
        onProgress(resource, ResourceState.LOADED);
    };
    this.onError = function (resource) {
        onProgress(resource, ResourceState.ERROR);
    };
    this.onTimeout = function (resource) {
        onProgress(resource, ResourceState.TIMEOUT);
    };

    // sends a progress report to a listener
    var sendProgress = function (updatedEntry, listener) {
        // find stats for all the resources the caller is interested in
        var completed = 0,
            total = 0,
            i, len, entry, includeResource;
        for (i = 0, len = entries.length; i < len; i++) {

            entry = entries[i];
            includeResource = false;

            if (listener.tags.length === 0) {
                // no tags specified so always tell the listener
                includeResource = true;
            } else {
                includeResource = entry.resource.tags.intersects(listener.tags);
            }

            if (includeResource) {
                total++;
                if (entry.status === ResourceState.LOADED ||
                    entry.status === ResourceState.ERROR ||
                    entry.status === ResourceState.TIMEOUT) {

                    completed++;
                }
            }
        }

        listener.callback({
            // info about the resource that changed
            resource: updatedEntry.resource,

            // should we expose StatusType instead?
            loaded: (updatedEntry.status === ResourceState.LOADED),
            error: (updatedEntry.status === ResourceState.ERROR),
            timeout: (updatedEntry.status === ResourceState.TIMEOUT),

            // updated stats for all resources
            completedCount: completed,
            totalCount: total
        });
    };

    // prints the status of each resource to the console
    var log = this.log = function (showAll) {
        if (!window.console) {
            return;
        }

        var elapsedSeconds = Math.round((Date.now() - timeStarted) / 1000);
        window.console.log('PxLoader elapsed: ' + elapsedSeconds + ' sec');

        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            if (!showAll && entry.status !== ResourceState.WAITING) {
                continue;
            }

            var message = 'PxLoader: #' + i + ' ' + entry.resource.getName();
            switch (entry.status) {
                case ResourceState.QUEUED:
                    message += ' (Not Started)';
                    break;
                case ResourceState.WAITING:
                    message += ' (Waiting)';
                    break;
                case ResourceState.LOADED:
                    message += ' (Loaded)';
                    break;
                case ResourceState.ERROR:
                    message += ' (Error)';
                    break;
                case ResourceState.TIMEOUT:
                    message += ' (Timeout)';
                    break;
            }

            if (entry.resource.tags.length > 0) {
                message += ' Tags: [' + entry.resource.tags.all.join(',') + ']';
            }

            window.console.log(message);
        }
    };
}


// Tag object to handle tag intersection; once created not meant to be changed
// Performance rationale: http://jsperf.com/lists-indexof-vs-in-operator/3

function PxLoaderTags(values) {

    this.all = [];
    this.first = null; // cache the first value
    this.length = 0;

    // holds values as keys for quick lookup
    this.lookup = {};

    if (values) {

        // first fill the array of all values
        if (Array.isArray(values)) {
            // copy the array of values, just to be safe
            this.all = values.slice(0);
        } else if (typeof values === 'object') {
            for (var key in values) {
                if (values.hasOwnProperty(key)) {
                    this.all.push(key);
                }
            }
        } else {
            this.all.push(values);
        }

        // cache the length and the first value
        this.length = this.all.length;
        if (this.length > 0) {
            this.first = this.all[0];
        }

        // set values as object keys for quick lookup during intersection test
        for (var i = 0; i < this.length; i++) {
            this.lookup[this.all[i]] = true;
        }
    }
}

// compare this object with another; return true if they share at least one value
PxLoaderTags.prototype.intersects = function (other) {

    // handle empty values case
    if (this.length === 0 || other.length === 0) {
        return false;
    }

    // only a single value to compare?
    if (this.length === 1 && other.length === 1) {
        return this.first === other.first;
    }

    // better to loop through the smaller object
    if (other.length < this.length) {
        return other.intersects(this);
    }

    // loop through every key to see if there are any matches
    for (var key in this.lookup) {
        if (other.lookup[key]) {
            return true;
        }
    }

    return false;
};

// AMD module support
if (typeof define === 'function' && define.amd) {
    define('PxLoader', [], function () {
        return PxLoader;
    });
}

// add a convenience method to PxLoader for adding an image
PxLoader.prototype.addImage = function (url, tags, priority, origin) {
    var imageLoader = new PxLoaderImage(url, tags, priority, origin);
    this.add(imageLoader);

    return imageLoader.img;
};
PxLoader.prototype.checkAllImages=function(dom){
    var images=[];
    $(dom).each(function () {
        if ($(this).prop("nodeName") == 'IMG') {
            images.push($(this).attr('img')||$(this).attr('src'));
        } else {
            $(this).find('img').each(
                function () {
                    images.push($(this).attr('img')||$(this).attr('src'));

                }

            )

        }
    });
    return images;
}
PxLoader.prototype.addImages = function (urls, tags, priority, origin) {
    urls= _.isArray(urls)?urls:this.checkAllImages($(urls));
    urls=_.uniq(urls);
    urls= _.without(urls,null);


    var imgs=[];

    for(var i=0;i<urls.length;i++){
        imgs.push(this.addImage(urls[i], tags, priority, origin))
    }
    return imgs;
};

module.exports = PxLoader;
});

require.register("./lib/loader/PxLoaderImage.js", function (exports, module) {
// PxLoader plugin to load images
function PxLoaderImage(url, tags, priority, origin) {
    var self = this,
        loader = null;

    this.img = new Image();
    if (origin !== undefined) {
        this.img.crossOrigin = origin;
    }
    this.tags = tags;
    this.priority = priority;

    var onReadyStateChange = function () {
        if (self.img.readyState === 'complete') {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    var onLoad = function () {
        removeEventHandlers();
        loader.onLoad(self);
    };

    var onError = function () {
        removeEventHandlers();
        loader.onError(self);
    };

    var removeEventHandlers = function () {
        self.unbind('load', onLoad);
        self.unbind('readystatechange', onReadyStateChange);
        self.unbind('error', onError);
    };

    this.start = function (pxLoader) {
        // we need the loader ref so we can notify upon completion
        loader = pxLoader;

        // NOTE: Must add event listeners before the src is set. We
        // also need to use the readystatechange because sometimes
        // load doesn't fire when an image is in the cache.
        self.bind('load', onLoad);
        self.bind('readystatechange', onReadyStateChange);
        self.bind('error', onError);

        self.img.src = url;
    };

    // called by PxLoader to check status of image (fallback in case
    // the event listeners are not triggered).
    this.checkStatus = function () {
        if (self.img.complete) {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    // called by PxLoader when it is no longer waiting
    this.onTimeout = function () {
        removeEventHandlers();
        if (self.img.complete) {
            loader.onLoad(self);
        } else {
            loader.onTimeout(self);
        }
    };

    // returns a name for the resource that can be used in logging
    this.getName = function () {
        return url;
    };

    // cross-browser event binding
    this.bind = function (eventName, eventHandler) {
        if (self.img.addEventListener) {
            self.img.addEventListener(eventName, eventHandler, false);
        } else if (self.img.attachEvent) {
            self.img.attachEvent('on' + eventName, eventHandler);
        }
    };

    // cross-browser event un-binding
    this.unbind = function (eventName, eventHandler) {
        if (self.img.removeEventListener) {
            self.img.removeEventListener(eventName, eventHandler, false);
        } else if (self.img.detachEvent) {
            self.img.detachEvent('on' + eventName, eventHandler);
        }
    };

}

module.exports = PxLoaderImage;
});

require.register("./lib/dom", function (exports, module) {
var _ = require("./lib/underscore");
var Size = require("./lib/size");
var Css = require("./lib/css");
var Input=require('./lib/input');
var Loader=require('./lib/loader');
var $ = window.$;

function Dom(dom) {
    this.baseUrl='';
    this.dom = $(dom);
}
Dom.prototype.smartCss=function(obj,ext){
    this.dom.css(Css.smartObject(obj,ext));

};
Dom.prototype.smartTransition=function(obj){
    this.dom.css(Css.transitionObject(obj));
};
Dom.prototype.transformOrigin=function (x, y, ext){
    this.dom.css(Css.transformOriginObject(x, y, ext));
};
Dom.prototype.boxShadow=function(shadow){
    this.dom.css(Css.fixCss('box-shadow',shadow));
};

Dom.prototype.size = function () {
    return new Size(0, 0, this.dom.width(), this.dom.height());
};
Dom.prototype.fillInRec = function (rec) {
    var obj = this.size().fillInRec(rec);
    var size = Css.transformObject(obj, 'px');
    this.dom.css(Css.transformOriginObject(0,0));
    this.dom.css(size);
    return obj;
};
Dom.prototype.fixInRec = function (rec) {
    var obj = this.size().fixInRec(rec);
    var size = Css.transformObject(obj, 'px');
    this.dom.css(Css.transformOriginObject(0,0));
    this.dom.css(size);
    return obj;
};
Dom.prototype.scrollTo = function (time,callback) {
    var me = this;
    var mark = $(me.dom);

    if (mark.offset()) {

    } else {
        mark = $(mark.first());
    }
    var position = mark.offset();

    var toObj = {};
        toObj.scrollTop = position.top + 'px';
        toObj.scrollLeft = position.left + 'px';
    if (window.Zepto) {
        console.log('UIGoMark is not support Zepto');
    } else {
        $('html,body').animate(toObj,time, function () {
            if (callback) {
                callback(me);
            }
        });

    }


};
Dom.prototype.maskImage=function(url){
    //兼容安卓需要加上z-index属性
    this.dom.css(Css.fixCss('mask-image','url('+url+')'));
};


Dom.prototype.preLoadImages=function(callback){
    var self = this;
    var loader = new Loader();
    this.preloader=loader;
    loader.addImages(loader.checkAllImages(self.dom));
    if(callback){
        loader.addCompletionListener(callback);
    }
    loader.start();
};


Dom.prototype.getAssetUrl = function (url) {
    if (Input.isHttp(url)||Input.isHttps(url)) {
        return url;
    } else {
        return this.baseUrl + url;

    }
};
function displayImage(dom) {
    var self = this;
    var imgurl =dom.attr('image-data');
    if (imgurl) {
        dom.attr('src', self.getAssetUrl(imgurl));
    }
    return self;
}

Dom.prototype.displayImages = function () {
    var self = this;
    $(self.dom).each(function () {
        if ($(this).prop("nodeName").toLowerCase()== 'img') {
            displayImage($(this));
        } else {
            $(this).find('img').each(function () {
                displayImage($(this));
            })
        }


    });
    return self;
};
module.exports = Dom;
});

require.register("./lib/pro-css-animate", function (exports, module) {
/*
 * Author: Johnny Chen
 */

var Css = require('./lib/css');
var _ = require("./lib/underscore");
var Tween = require("./lib/tween");
var Dom=require("./lib/dom");
var $ = window.$;

// ext  'px' or '%'
//limitToRange 强制将值限制在 范围内
// allowOutRange 是否允许超过范围的值

var ProCSSAnimate = function (dom, from, to, option) {
    this.dom = $(dom);
    this.smartDom=new Dom(dom);
    this.from = from;
    this.to = to;
    this.option = _.extend({min: 0, max: 1, ext: "px", outRangeUpdate: true,limitToRange:true}, option);
    this.option.size = this.option.max - this.option.min;
    this.init();
};

ProCSSAnimate.prototype.init = function () {
    var self = this;
    self.value = 0;
    self.current = {};
    for (var i in self.to) {
        var tov = parseFloat(self.to[i]);
        if (!self.from.hasOwnProperty(i))  {
          self.from[i]=tov;

        }
    }
    self.updateDom = function () {
        self.smartDom.smartCss(self.current,self.option.ext);
    };
    self.updateValue = function (v) {
        self.value = v;
        self.realValue = (v - self.option.min) / self.option.size;
        if (false == self.option.outRangeUpdate) {
            if (self.realValue < 0 || self.realValue > 1) {
                return;
            }
        }
        if(self.option.limitToRange==true){
            self.realValue = Math.max(Math.min(self.realValue, 1), 0);
        }
        var d, subd;
        for (var i in self.to) {
            var tov = self.to[i];
            var fromv = self.from[i];
                d = tov - fromv;
                d = self.realValue * d;
                self.current[i] = d + fromv;
        }
        self.updateDom();
    };
    self.updateValue(0);

};
var ProCSSAnimateManager = function () {
    this.init();
};
ProCSSAnimateManager.prototype.init = function () {
    var self = this;
    self.list = [];
    self.value = 0;
    self.add = function (pca) {
        self.list.push(pca);
    };
    self.remove = function (pca) {
        self.list = _.without(self.list, pca);
    };
    self.updateAnimates = function () {
        _.each(self.list, function (pca) {
            pca.updateValue(self.value);
        })
    };
    self.updateValue = function (v) {
        self.value = v;
        self.updateAnimates();
    }
    self.tweenTo = function (v, time, func) {
        if (!func) {
            func = Tween.Sine.inOut;
        }
        if (!time) {
            time = 0.5;
        }
        var target = {value: self.value};
        return VA.Tween.to(target, time, {value: v}).ease(func).step(function (tween) {
            self.updateValue(target.value);

        });
    }


};
ProCSSAnimateManager.prototype.createAnimate = function (dom, from, to, option) {
    return new ProCSSAnimate(dom, from, to, option);
};

module.exports = ProCSSAnimateManager;


});

require.register("./lib/toggle-button", function (exports, module) {
var $ = window.$;
var _ = require('./lib/underscore');
/**
 * 设备信息
 */
function ToggleButton(dom, opt) {
    this.init(dom, opt);
}
ToggleButton.prototype.init = function (dom, opt) {
    var me = this;
    this.dom = $(dom);

    this.opt=_.extend({select:false},opt);
    this.select = this.opt.select;
    this.setSelect(this.select);
    this.dom.click(function () {
        me.click();
    })
};
ToggleButton.prototype.setSelect=function(selected){
    this.select=selected;
    if (this.select) {
        this.dom.addClass('selected');
    }else{
        this.dom.removeClass('selected');
    }
    if (this.select) {
        if (this.opt.onselect) {
            this.opt.onselect(this);
        }

    }else{
        if (this.opt.unselect) {
            this.opt.unselect(this);
        }

    }
};
ToggleButton.prototype.setSelectSilence=function(selected){
    this.select=selected;
    if (this.select) {
        this.dom.addClass('selected');
    }else{
        this.dom.removeClass('selected');
    }
};


ToggleButton.prototype.click = function () {

    this.setSelect(!this.select);


};



module.exports = ToggleButton;

});

require.register("./lib/ajax-file-upload", function (exports, module) {
/**
 * Created by johnny on 16/4/17.
 */

(function () {
    var AjaxFileUpload,
        __bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        };

    AjaxFileUpload = (function () {
        var ajaxUpload, bindStateEventsToWrap,  displayFileNames, embedSWF, handleAjaxProgress, handleAjaxProgressEnd, handleAjaxProgressStart, handleAjaxStateChange, handleFileSelection, has, setupCustomInput, utils, valid, validateFiles,
            _this = this;

        function AjaxFileUpload(input, options) {
            var defaultSettings;
            defaultSettings = {
                url: "",
                additionalData: {},
                autoUpload: false,
                dataType: "json",
                method: "post",
                pathToSwf: "/dist/AjaxFileUpload.swf",
                showCustomInput: false,
                buttonEmptyText: "Select",
                buttonSelectedText: "Upload",
                multiple: false,
                sizeLimit: 0,
                allowedTypes: [],
                onSuccess: function () {
                },
                onError: function () {
                },
                onFileSelect: function () {
                },
                onProgress: function () {
                },
                onProgressStart: function () {
                },
                onProgressEnd: function () {
                }
            };

            var _this = this;

            this.input = input;
            this.upload = __bind(this.upload, this);

            this.reset = __bind(this.reset, this);

            this.settings = utils.merge(defaultSettings, options);


            if (this.input.multiple || this.settings.multiple) {
                this.input.multiple = true;
                this.settings.multiple = true;
            }
            if (this.settings.allowedTypes.length > 0) {
                utils.attr(this.input, {
                    accept: this.settings.allowedTypes.join()
                });
            }
            if (this.settings.url === "") {
                this.settings.url = this.input.getAttribute("data-url");
            }
            if (this.settings.url === "" && this.input.form.action !== "") {
                this.settings.url = this.input.form.action;
            }
            if (this.settings.url === "") {
                return;
            }
            if (this.settings.additionalData !== {}) {
                this.settings.url += "?" + (utils.serialize(this.settings.additionalData));
            }
            if (this.settings.showCustomInput) {
                setupCustomInput(this);
            }
            if (has.fileAPI && has.formData) {
                this.input.addEventListener("change", function (event) {

                    return handleFileSelection(event, _this);
                });
            } else {
                embedSWF(this);
            }
            window.AjaxFileUpload = window.AjaxFileUpload || AjaxFileUpload;
            window.AjaxFileUpload.instances = AjaxFileUpload.instances || [];
            window.AjaxFileUpload.instances[this.input.id] = this;

            return;
        }

        AjaxFileUpload.prototype.reset = function () {
            var fakeButton, fakeInput;
            fakeButton = document.getElementById("fu-button-" + this.input.id);
            if (fakeButton != null) {
                fakeButton.innerHTML = this.settings.buttonEmptyText;
            }
            fakeInput = document.getElementById("fu-input-" + this.input.id);
            if (fakeInput != null) {
                fakeInput.value = "";
            }
            this.input.value = "";
            utils.css(this.input, {
                display: "block"
            });
        };

        AjaxFileUpload.prototype.upload = function () {
            return ajaxUpload(this);
        };

        handleFileSelection = function (event, instance) {
            var fakeButton, fakeInput, settings;
            settings = instance.settings;
            if (validateFiles(instance)) {
                if (settings.autoUpload) {
                    instance.upload();
                }
                settings.onFileSelect.apply(settings, [event.target.files]);
                if (settings.showCustomInput) {
                    fakeButton = document.getElementById("fu-button-" + event.target.id);
                    fakeInput = document.getElementById("fu-input-" + event.target.id);
                    fakeButton.innerHTML = settings.buttonSelectedText;
                    utils.css(instance.input, {
                        display: "none"
                    });
                    fakeButton.onclick = function () {
                        ajaxUpload(instance);
                        return false;
                    };
                    displayFileNames(fakeInput, event.target.files);
                }
            }
        };

        ajaxUpload = function (instance) {
            var file, formData, xhr, _i, _len, _ref;
            if (instance.input.files.length === 0) {
                return;
            }

            xhr = new XMLHttpRequest();
            if (xhr.upload) {
                xhr.upload.addEventListener("progress", function (event) {
                    return handleAjaxProgress(event, instance);
                });
                xhr.upload.addEventListener("loadstart", function (event) {
                    return handleAjaxProgressStart(event, instance);
                });
                xhr.upload.addEventListener("load", function (event) {

                    return handleAjaxProgressEnd(event, instance);
                });
            } else {
                xhr.addEventListener("progress", function (event) {
                    return handleAjaxProgress(event, instance);
                });
            }
            xhr.addEventListener("readystatechange", function (event) {
                return handleAjaxStateChange(event, instance);
            });
            formData = new FormData();
            _ref = instance.input.files;
            var name=$(instance.input).attr('name');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                file = _ref[_i];
                formData.append(name||file.name, file);
            }



            xhr.open(instance.settings.method, instance.settings.url, true);
            switch (instance.settings.dataType) {
                case "json":
                    xhr.setRequestHeader("Accept", "application/json");
                    break;
                case "xml":
                    xhr.setRequestHeader("Accept", "text/xml");
                    break;
                default:
                    break;
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(formData);
        };

        handleAjaxStateChange = function (event, instance) {
            var response, xhr, _ref, _ref1;
            xhr = event.target;
            if (xhr.readyState !== 4) {
                return;
            }
            response = xhr.responseText;
            if (~(xhr.getResponseHeader("content-type").indexOf("application/json")) && !!window.JSON) {
                response = JSON.parse(response);
            }


            if (xhr.status === 200 || xhr.status === 201) {

                (_ref = instance.settings).onSuccess.apply(_ref, [response, instance.input.files, xhr]);

                instance.reset();
            } else {
                (_ref1 = instance.settings).onError.apply(_ref1, [response, instance.input.files, xhr]);
            }
        };

        handleAjaxProgressStart = function (event, instance) {
            var _ref;
            if (instance.settings.showCustomInput) {
                document.getElementById("fu-wrap-" + instance.input.id).className += " fu-loading";
            }
            return (_ref = instance.settings).onProgressStart.apply(_ref, [instance.input.files, event.target]);
        };

        handleAjaxProgress = function (event, instance) {
            var _ref;
            return (_ref = instance.settings).onProgress.apply(_ref, [event.loaded, event.total, instance.input.files, event.target]);
        };

        handleAjaxProgressEnd = function (event, instance) {
            var wrap, _ref;
            if (instance.settings.showCustomInput) {
                wrap = document.getElementById("fu-wrap-" + instance.input.id);
                wrap.className = wrap.className.replace(" fu-loading", "");
            }

            return (_ref = instance.settings).onProgressEnd.apply(_ref, [instance.input.files, event.target]);
        };

        embedSWF = function (instance) {
            var allowedTypes, attrs, embed, embedId, flashVars, key, param, params, refNode, val, wrap;
            embedId = "fu-embed-" + instance.input.id;
            if (document.getElementById(embedId !== null)) {
                return;
            }
            allowedTypes = instance.settings.allowedTypes;
            allowedTypes = allowedTypes.join(";").replace(/[a-z]*\//ig, "*.");
            flashVars = {
                id: instance.input.id,
                url: instance.settings.url,
                method: instance.settings.method,
                multiple: instance.settings.multiple,
                additionalData: instance.settings.additionalData,
                sizeLimit: instance.settings.sizeLimit,
                allowedTypes: allowedTypes
            };
            params = {
                movie: instance.settings.pathToSwf,
                quality: "low",
                play: "true",
                loop: "true",
                wmode: "transparent",
                scale: "noscale",
                menu: "true",
                devicefont: "false",
                salign: "",
                allowScriptAccess: "sameDomain",
                flashvars: utils.serialize(flashVars)
            };
            attrs = {
                src: instance.settings.pathToSwf,
                id: embedId,
                name: "fu-embed-" + instance.input.id,
                classid: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                type: "application/x-shockwave-flash",
                pluginspage: "http://www.adobe.com/go/getflashplayer",
                FlashVars: utils.serialize(flashVars),
                width: instance.input.offsetWidth + 5,
                height: instance.input.offsetHeight + 5
            };
            embed = document.getElementById(embedId);
            if (!embed) {
                embed = document.createElement("embed");
            }
            wrap = document.getElementById("fu-wrap-" + instance.input.id);
            bindStateEventsToWrap(embed, wrap);
            for (key in params) {
                val = params[key];
                if (params.hasOwnProperty(key)) {
                    param = document.createElement("param");
                    utils.attr(param, {
                        name: key,
                        value: val
                    });
                }
            }
            utils.attr(embed, utils.merge(attrs, params));
            utils.css(embed, {
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                cursor: "pointer"
            });
            if (instance.settings.showCustomInput) {
                refNode = document.getElementById("fu-button-" + instance.input.id);
                refNode.parentNode.insertBefore(embed, refNode.nextSibling);
                instance.input.style.display = "none";
            } else {
                instance.input.parentNode.insertBefore(embed, instance.input.nextSibling);
            }
        };

        bindStateEventsToWrap = function (element, wrap) {
            element.onmouseover = function () {
                return utils.attr(wrap, {
                    "class": "fu-wrap fu-hover"
                });
            };
            element.onmouseout = function () {
                return utils.attr(wrap, {
                    "class": "fu-wrap"
                });
            };
            element.onmousedown = function () {
                return utils.attr(wrap, {
                    "class": "fu-wrap fu-active"
                });
            };
            return element.onmouseup = function () {
                return utils.attr(wrap, {
                    "class": "fu-wrap"
                });
            };
        };

        setupCustomInput = function (instance) {
            var button, input, providedInput, wrap, wrapId;
            providedInput = instance.input;
            wrapId = "fu-wrap-" + providedInput.id;
            if (document.getElementById(wrapId) !== null) {
                return false;
            }
            wrap = document.createElement("div");
            utils.attr(wrap, {
                "class": "fu-wrap",
                id: wrapId
            });
            utils.css(wrap, {
                position: "relative"
            });
            input = document.createElement("input");
            utils.attr(input, {
                type: "text",
                disabled: "disabled",
                "class": "fu-input",
                id: "fu-input-" + providedInput.id
            });
            button = document.createElement("button");
            utils.attr(button, {
                "class": "fu-button button",
                id: "fu-button-" + providedInput.id
            });
            if (instance.settings.autoUpload) {
                button.innerHTML = instance.settings.buttonSelectedText;
            } else {
                button.innerHTML = instance.settings.buttonEmptyText;
            }
            button.onclick = function () {
                if (button.innerHTML === instance.settings.buttonSelectedText) {
                    instance.upload();
                }
                return false;
            };
            wrap.appendChild(input);
            wrap.appendChild(button);
            providedInput.parentNode.insertBefore(wrap, providedInput.nextSibling);
            wrap.appendChild(providedInput);
            utils.css(providedInput, {
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0
            });
            bindStateEventsToWrap(providedInput, wrap);
            utils.css(providedInput, {
                width: document.getElementById(wrapId).clientWidth + "px",
                height: document.getElementById(wrapId).clientHeight + "px"
            });
            return providedInput;
        };

        displayFileNames = function (input, files) {
            var file, names, _i, _len;
            if (files.length === 0) {
                return;
            }
            if (files.length === 1) {
                return input.value = files[0].name;
            }
            if (files.length > 1) {
                names = "";
                for (_i = 0, _len = files.length; _i < _len; _i++) {
                    file = files[_i];
                    names += file.name + " ";
                }
                return input.value = names;
            }
        };

        utils = {
            css: function (element, properties) {
                var property, value;
                for (property in properties) {
                    value = properties[property];
                    element.style[property] = value;
                }
            },
            attr: function (element, attributes) {
                var attribute, value;
                for (attribute in attributes) {
                    value = attributes[attribute];
                    if (attribute === "class") {
                        element.className = value;
                    } else if (attributes.hasOwnProperty(attribute)) {
                        element.setAttribute(attribute, value);
                    }
                }
            },
            serialize: function (obj, prefix) {
                var k, p, str, v;
                str = [];
                for (p in obj) {
                    v = obj[p];
                    k = prefix ? prefix + "[" + p + "]" : p;
                    if (typeof v === "object") {
                        str.push(utils.serialize(v, k));
                    } else {
                        str.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
                return str.join("&");
            },
            merge: function (obj1, obj2) {
                var p;
                for (p in obj2) {
                    try {
                        if (obj2[p].constructor === Object) {
                            obj1[p] = utils.merge(obj1[p], obj2[p]);
                        } else {
                            obj1[p] = obj2[p];
                        }
                    } catch (e) {
                        obj1[p] = obj2[p];
                    }
                }
                return obj1;
            }
        };

        has = {
            fileAPI: !!window.File && !!window.FileReader && !!window.FileList && !!window.Blob,
            formData: !!window.FormData,
            fileTypeFiltering: typeof document.createElement("input").accept === "string",
            progressbar: document.createElement('progress').max !== void 0
        };

        valid = {
            sizeLimit: function (size, sizeLimit) {
                return size <= sizeLimit;
            },
            fileType: function (type, allowedTypes) {
                var match, validType, _i, _len;
                if (allowedTypes === [] || !has.fileTypeFiltering) {
                    return true;
                }
                match = false;
                if (!!allowedTypes) {
                    for (_i = 0, _len = allowedTypes.length; _i < _len; _i++) {
                        validType = allowedTypes[_i];
                        if (~(validType.indexOf(type))) {
                            match = true;
                        }
                    }
                }
                return match;
            }
        };

        validateFiles = function (instance) {
            var file, files, messages, settings, _i, _len;
            files = instance.input.files;
            settings = instance.settings;
            messages = [];
            if (files.length === 0) {
                settings.onError.apply(instance, ["No file selected"]);
                return false;
            }
            for (_i = 0, _len = files.length; _i < _len; _i++) {
                file = files[_i];
                if (settings.sizeLimit !== 0 && !valid.sizeLimit(file.size, settings.sizeLimit)) {
                    messages.push("\"" + file.name + "\" is " + file.size + " bytes. Your provided limit is " + settings.sizeLimit + " bytes.");
                }
                if (settings.allowedTypes.length !== 0 && !valid.fileType(file.type, settings.allowedTypes)) {
                    messages.push("\"" + (file.name.split(".")[1]) + "\" is not a valid file type/extension: " + settings.allowedTypes);
                }
            }
            if (messages.length > 0) {
                settings.onError.apply(instance, messages);
            }
            return messages.length === 0;
        };

        return AjaxFileUpload;

    }).call(this);

    window.AjaxFileUpload = AjaxFileUpload;

    if (window.jQuery) {
        jQuery.ajaxFileUpload = AjaxFileUpload;
        jQuery.fn.ajaxFileUpload = function (options) {
            return this.each(function (i, input) {
                new AjaxFileUpload(input, options);
            });
        };
    }

    if (typeof define === "function" && define.amd) {
        define("ajaxFileUpload", [], function () {
            return AjaxFileUpload;
        });
    }

}).call(this);

module.exports = AjaxFileUpload;


});

require.register("./lib/fast-click", function (exports, module) {

;(function () {
    'use strict';
    var $ = window.$;
    /**
     * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
     *
     * @codingstandard ftlabs-jsv2
     * @copyright The Financial Times Limited [All Rights Reserved]
     * @license MIT License (see LICENSE.txt)
     */

    /*jslint browser:true, node:true*/
    /*global define, Event, Node*/


    /**
     * Instantiate fast-clicking listeners on the specified layer.
     *
     * @constructor
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    function FastClick(layer, options) {

        layer=$(layer).get(0);
        var oldOnClick;

        options = options || {};

        /**
         * Whether a click is currently being tracked.
         *
         * @type boolean
         */
        this.trackingClick = false;


        /**
         * Timestamp for when click tracking started.
         *
         * @type number
         */
        this.trackingClickStart = 0;


        /**
         * The element being tracked for a click.
         *
         * @type EventTarget
         */
        this.targetElement = null;


        /**
         * X-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartX = 0;


        /**
         * Y-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartY = 0;


        /**
         * ID of the last touch, retrieved from Touch.identifier.
         *
         * @type number
         */
        this.lastTouchIdentifier = 0;


        /**
         * Touchmove boundary, beyond which a click will be cancelled.
         *
         * @type number
         */
        this.touchBoundary = options.touchBoundary || 10;


        /**
         * The FastClick layer.
         *
         * @type Element
         */
        this.layer = layer;

        /**
         * The minimum time between tap(touchstart and touchend) events
         *
         * @type number
         */
        this.tapDelay = options.tapDelay || 200;

        /**
         * The maximum time for a tap
         *
         * @type number
         */
        this.tapTimeout = options.tapTimeout || 700;

        if (FastClick.notNeeded(layer)) {
            return;
        }

        // Some old versions of Android don't have Function.prototype.bind
        function bind(method, context) {
            return function() { return method.apply(context, arguments); };
        }


        var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }

        // Set up event handlers as required
        if (deviceIsAndroid) {
            layer.addEventListener('mouseover', this.onMouse, true);
            layer.addEventListener('mousedown', this.onMouse, true);
            layer.addEventListener('mouseup', this.onMouse, true);
        }

        layer.addEventListener('click', this.onClick, true);
        layer.addEventListener('touchstart', this.onTouchStart, false);
        layer.addEventListener('touchmove', this.onTouchMove, false);
        layer.addEventListener('touchend', this.onTouchEnd, false);
        layer.addEventListener('touchcancel', this.onTouchCancel, false);

        // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
        // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
        // layer when they are cancelled.
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === 'click') {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };

            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === 'click') {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }

        // If a handler is already declared in the element's onclick attribute, it will be fired before
        // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
        // adding it as listener.
        if (typeof layer.onclick === 'function') {

            // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
            // - the old one won't work if passed to addEventListener directly.
            oldOnClick = layer.onclick;
            layer.addEventListener('click', function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }

    /**
     * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
     *
     * @type boolean
     */
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

    /**
     * Android requires exceptions.
     *
     * @type boolean
     */
    var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


    /**
     * iOS requires exceptions.
     *
     * @type boolean
     */
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


    /**
     * iOS 4 requires an exception for select elements.
     *
     * @type boolean
     */
    var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


    /**
     * iOS 6.0-7.* requires the target element to be manually derived
     *
     * @type boolean
     */
    var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

    /**
     * BlackBerry requires exceptions.
     *
     * @type boolean
     */
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

    /**
     * Determine whether a given element requires a native click.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element needs a native click
     */
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {

            // Don't send a synthetic click to disabled inputs (issue #62)
            case 'button':
            case 'select':
            case 'textarea':
                if (target.disabled) {
                    return true;
                }

                break;
            case 'input':

                // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
                if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                    return true;
                }

                break;
            case 'label':
            case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
            case 'video':
                return true;
        }

        return (/\bneedsclick\b/).test(target.className);
    };


    /**
     * Determine whether a given element requires a call to focus to simulate click into element.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
     */
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
            case 'textarea':
                return true;
            case 'select':
                return !deviceIsAndroid;
            case 'input':
                switch (target.type) {
                    case 'button':
                    case 'checkbox':
                    case 'file':
                    case 'image':
                    case 'radio':
                    case 'submit':
                        return false;
                }

                // No point in attempting to focus disabled inputs
                return !target.disabled && !target.readOnly;
            default:
                return (/\bneedsfocus\b/).test(target.className);
        }
    };


    /**
     * Send a click event to the specified element.
     *
     * @param {EventTarget|Element} targetElement
     * @param {Event} event
     */
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;

        // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }

        touch = event.changedTouches[0];

        // Synthesise a click event, with an extra attribute so it can be tracked
        clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };

    FastClick.prototype.determineEventType = function(targetElement) {

        //Issue #159: Android Chrome Select Box does not open with a synthetic click event
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
            return 'mousedown';
        }

        return 'click';
    };


    /**
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.focus = function(targetElement) {
        var length;

        // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };


    /**
     * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
     *
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;

        scrollParent = targetElement.fastClickScrollParent;

        // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
        // target element was moved to another parent.
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }

                parentElement = parentElement.parentElement;
            } while (parentElement);
        }

        // Always update the scroll top tracker if possible.
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };


    /**
     * @param {EventTarget} targetElement
     * @returns {Element|EventTarget}
     */
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

        // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }

        return eventTarget;
    };


    /**
     * On touch start, record the position and scroll offset.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;

        // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
        if (event.targetTouches.length > 1) {
            return true;
        }

        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];

        if (deviceIsIOS) {

            // Only trusted events will deselect text on iOS (issue #49)
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }

            if (!deviceIsIOS4) {

                // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
                // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
                // with the same identifier as the touch event that previously triggered the click that triggered the alert.
                // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
                // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
                // Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
                // which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
                // random integers, it's safe to to continue if the identifier is 0 here.
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }

                this.lastTouchIdentifier = touch.identifier;

                // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
                // 1) the user does a fling scroll on the scrollable layer
                // 2) the user stops the fling scroll with another tap
                // then the event.target of the last 'touchend' event will be the element that was under the user's finger
                // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
                // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
                this.updateScrollParent(targetElement);
            }
        }

        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;

        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            event.preventDefault();
        }

        return true;
    };


    /**
     * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;

        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }

        return false;
    };


    /**
     * Update the last position.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }

        // If the touch has moved, cancel the click tracking
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }

        return true;
    };


    /**
     * Attempt to find the labelled control for the given label element.
     *
     * @param {EventTarget|HTMLLabelElement} labelElement
     * @returns {Element|null}
     */
    FastClick.prototype.findControl = function(labelElement) {

        // Fast path for newer browsers supporting the HTML5 control attribute
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }

        // All browsers under test that support touch events also support the HTML5 htmlFor attribute
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }

        // If no for attribute exists, attempt to retrieve the first labellable descendant element
        // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };


    /**
     * On touch end, determine whether to send a click event at once.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

        if (!this.trackingClick) {
            return true;
        }

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }

        if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
            return true;
        }

        // Reset to prevent wrong click cancel on input (issue #156).
        this.cancelNextClick = false;

        this.lastClickTime = event.timeStamp;

        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;

        // On some iOS devices, the targetElement supplied with the event is invalid if the layer
        // is performing a transition or scroll, and has to be re-detected manually. Note that
        // for this to function correctly, it must be called *after* the event target is checked!
        // See issue #57; also filed as rdar://13048589 .
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];

            // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }

        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }

                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {

            // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
            // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
            if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                this.targetElement = null;
                return false;
            }

            this.focus(targetElement);
            this.sendClick(targetElement, event);

            // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
            // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
            if (!deviceIsIOS || targetTagName !== 'select') {
                this.targetElement = null;
                event.preventDefault();
            }

            return false;
        }

        if (deviceIsIOS && !deviceIsIOS4) {

            // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
            // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }

        // Prevent the actual click from going though - unless the target node is marked as requiring
        // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }

        return false;
    };


    /**
     * On touch cancel, stop tracking the click.
     *
     * @returns {void}
     */
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };


    /**
     * Determine mouse events which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onMouse = function(event) {

        // If a target element was never set (because a touch event was never fired) allow the event
        if (!this.targetElement) {
            return true;
        }

        if (event.forwardedTouchEvent) {
            return true;
        }

        // Programmatically generated events targeting a specific element should be permitted
        if (!event.cancelable) {
            return true;
        }

        // Derive and check the target element to see whether the mouse event needs to be permitted;
        // unless explicitly enabled, prevent non-touch click events from triggering actions,
        // to prevent ghost/doubleclicks.
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

            // Prevent any user-added listeners declared on FastClick element from being fired.
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {

                // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
                event.propagationStopped = true;
            }

            // Cancel the event
            event.stopPropagation();
            event.preventDefault();

            return false;
        }

        // If the mouse event is permitted, return true for the action to go through.
        return true;
    };


    /**
     * On actual clicks, determine whether this is a touch-generated click, a click action occurring
     * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
     * an actual click which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onClick = function(event) {
        var permitted;

        // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }

        // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
        if (event.target.type === 'submit' && event.detail === 0) {
            return true;
        }

        permitted = this.onMouse(event);

        // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
        if (!permitted) {
            this.targetElement = null;
        }

        // If clicks are permitted, return true for the action to go through.
        return permitted;
    };


    /**
     * Remove all FastClick's event listeners.
     *
     * @returns {void}
     */
    FastClick.prototype.destroy = function() {
        var layer = this.layer;

        if (deviceIsAndroid) {
            layer.removeEventListener('mouseover', this.onMouse, true);
            layer.removeEventListener('mousedown', this.onMouse, true);
            layer.removeEventListener('mouseup', this.onMouse, true);
        }

        layer.removeEventListener('click', this.onClick, true);
        layer.removeEventListener('touchstart', this.onTouchStart, false);
        layer.removeEventListener('touchmove', this.onTouchMove, false);
        layer.removeEventListener('touchend', this.onTouchEnd, false);
        layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };


    /**
     * Check whether FastClick is needed.
     *
     * @param {Element} layer The layer to listen on
     */
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;

        // Devices that don't support touch don't need FastClick
        if (typeof window.ontouchstart === 'undefined') {
            return true;
        }

        // Chrome version - zero for other browsers
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (chromeVersion) {

            if (deviceIsAndroid) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // Chrome 32 and above with width=device-width or less don't need FastClick
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }

                // Chrome desktop doesn't need FastClick (issue #15)
            } else {
                return true;
            }
        }

        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

            // BlackBerry 10.3+ does not require Fastclick library.
            // https://github.com/ftlabs/fastclick/issues/251
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // user-scalable=no eliminates click delay.
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // width=device-width (or less than device-width) eliminates click delay.
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }


        // IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
        if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        // Firefox version - zero for other browsers
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (firefoxVersion >= 27) {
            // Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

            metaViewport = document.querySelector('meta[name=viewport]');
            if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }

        // IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
        // http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx

        if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        return false;
    };


    /**
     * Factory method for creating a FastClick object
     *
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

        // AMD. Register as an anonymous module.
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
}());

});

require.register("./lib/random-color", function (exports, module) {
// randomColor by David Merfield under the MIT license
// https://github.com/davidmerfield/randomColor/

;(function(root, factory) {

    // Support AMD
    if (typeof define === 'function' && define.amd) {
        define([], factory);

        // Support CommonJS
    } else if (typeof exports === 'object') {
        var randomColor = factory();

        // Support NodeJS & Component, which allow module.exports to be a function
        if (typeof module === 'object' && module && module.exports) {
            exports = module.exports = randomColor;
        }

        // Support CommonJS 1.1.1 spec
        exports.randomColor = randomColor;

        // Support vanilla script loading
    } else {
        root.randomColor = factory();
    };

}(this, function() {

    // Seed to get repeatable colors
    var seed = null;

    // Shared color dictionary
    var colorDictionary = {};

    // Populate the color dictionary
    loadColorBounds();

    var randomColor = function(options) {
        options = options || {};
        if (options.seed && !seed) seed = options.seed;

        var H,S,B;

        // Check if we need to generate multiple colors
        if (options.count != null) {

            var totalColors = options.count,
                colors = [];

            options.count = null;

            while (totalColors > colors.length) {
                colors.push(randomColor(options));
            }

            options.count = totalColors;

            //Keep the seed constant between runs.
            if (options.seed) seed = options.seed;

            return colors;
        }

        // First we pick a hue (H)
        H = pickHue(options);

        // Then use H to determine saturation (S)
        S = pickSaturation(H, options);

        // Then use S and H to determine brightness (B).
        B = pickBrightness(H, S, options);

        // Then we return the HSB color in the desired format
        return setFormat([H,S,B], options);
    };

    function pickHue (options) {

        var hueRange = getHueRange(options.hue),
            hue = randomWithin(hueRange);

        // Instead of storing red as two seperate ranges,
        // we group them, using negative numbers
        if (hue < 0) {hue = 360 + hue}

        return hue;

    }

    function pickSaturation (hue, options) {

        if (options.luminosity === 'random') {
            return randomWithin([0,100]);
        }

        if (options.hue === 'monochrome') {
            return 0;
        }

        var saturationRange = getSaturationRange(hue);

        var sMin = saturationRange[0],
            sMax = saturationRange[1];

        switch (options.luminosity) {

            case 'bright':
                sMin = 55;
                break;

            case 'dark':
                sMin = sMax - 10;
                break;

            case 'light':
                sMax = 55;
                break;
        }

        return randomWithin([sMin, sMax]);

    }

    function pickBrightness (H, S, options) {

        var brightness,
            bMin = getMinimumBrightness(H, S),
            bMax = 100;

        switch (options.luminosity) {

            case 'dark':
                bMax = bMin + 20;
                break;

            case 'light':
                bMin = (bMax + bMin)/2;
                break;

            case 'random':
                bMin = 0;
                bMax = 100;
                break;
        }

        return randomWithin([bMin, bMax]);

    }

    function setFormat (hsv, options) {

        switch (options.format) {

            case 'hsvArray':
                return hsv;

            case 'hslArray':
                return HSVtoHSL(hsv);

            case 'hsl':
                var hsl = HSVtoHSL(hsv);
                return 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)';

            case 'rgbArray':
                return HSVtoRGB(hsv);

            case 'rgb':
                var rgb = HSVtoRGB(hsv);
                return 'rgb(' + rgb.join(', ') + ')';

            default:
                return HSVtoHex(hsv);
        }

    }

    function getMinimumBrightness(H, S) {

        var lowerBounds = getColorInfo(H).lowerBounds;

        for (var i = 0; i < lowerBounds.length - 1; i++) {

            var s1 = lowerBounds[i][0],
                v1 = lowerBounds[i][1];

            var s2 = lowerBounds[i+1][0],
                v2 = lowerBounds[i+1][1];

            if (S >= s1 && S <= s2) {

                var m = (v2 - v1)/(s2 - s1),
                    b = v1 - m*s1;

                return m*S + b;
            }

        }

        return 0;
    }

    function getHueRange (colorInput) {

        if (typeof parseInt(colorInput) === 'number') {

            var number = parseInt(colorInput);

            if (number < 360 && number > 0) {
                return [number, number];
            }

        }

        if (typeof colorInput === 'string') {

            if (colorDictionary[colorInput]) {
                var color = colorDictionary[colorInput];
                if (color.hueRange) {return color.hueRange}
            }
        }

        return [0,360];

    }

    function getSaturationRange (hue) {
        return getColorInfo(hue).saturationRange;
    }

    function getColorInfo (hue) {

        // Maps red colors to make picking hue easier
        if (hue >= 334 && hue <= 360) {
            hue-= 360;
        }

        for (var colorName in colorDictionary) {
            var color = colorDictionary[colorName];
            if (color.hueRange &&
                hue >= color.hueRange[0] &&
                hue <= color.hueRange[1]) {
                return colorDictionary[colorName];
            }
        } return 'Color not found';
    }

    function randomWithin (range) {
        if (seed == null) {
            return Math.floor(range[0] + Math.random()*(range[1] + 1 - range[0]));
        } else {
            //Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
            var max = range[1] || 1;
            var min = range[0] || 0;
            seed = (seed * 9301 + 49297) % 233280;
            var rnd = seed / 233280.0;
            return Math.floor(min + rnd * (max - min));
        }
    }

    function HSVtoHex (hsv){

        var rgb = HSVtoRGB(hsv);

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        var hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

        return hex;

    }

    function defineColor (name, hueRange, lowerBounds) {

        var sMin = lowerBounds[0][0],
            sMax = lowerBounds[lowerBounds.length - 1][0],

            bMin = lowerBounds[lowerBounds.length - 1][1],
            bMax = lowerBounds[0][1];

        colorDictionary[name] = {
            hueRange: hueRange,
            lowerBounds: lowerBounds,
            saturationRange: [sMin, sMax],
            brightnessRange: [bMin, bMax]
        };

    }

    function loadColorBounds () {

        defineColor(
            'monochrome',
            null,
            [[0,0],[100,0]]
        );

        defineColor(
            'red',
            [-26,18],
            [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
        );

        defineColor(
            'orange',
            [19,46],
            [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
        );

        defineColor(
            'yellow',
            [47,62],
            [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
        );

        defineColor(
            'green',
            [63,178],
            [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
        );

        defineColor(
            'blue',
            [179, 257],
            [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
        );

        defineColor(
            'purple',
            [258, 282],
            [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
        );

        defineColor(
            'pink',
            [283, 334],
            [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
        );

    }

    function HSVtoRGB (hsv) {

        // this doesn't work for the values of 0 and 360
        // here's the hacky fix
        var h = hsv[0];
        if (h === 0) {h = 1}
        if (h === 360) {h = 359}

        // Rebase the h,s,v values
        h = h/360;
        var s = hsv[1]/100,
            v = hsv[2]/100;

        var h_i = Math.floor(h*6),
            f = h * 6 - h_i,
            p = v * (1 - s),
            q = v * (1 - f*s),
            t = v * (1 - (1 - f)*s),
            r = 256,
            g = 256,
            b = 256;

        switch(h_i) {
            case 0: r = v, g = t, b = p;  break;
            case 1: r = q, g = v, b = p;  break;
            case 2: r = p, g = v, b = t;  break;
            case 3: r = p, g = q, b = v;  break;
            case 4: r = t, g = p, b = v;  break;
            case 5: r = v, g = p, b = q;  break;
        }
        var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
        return result;
    }

    function HSVtoHSL (hsv) {
        var h = hsv[0],
            s = hsv[1]/100,
            v = hsv[2]/100,
            k = (2-s)*v;

        return [
            h,
            Math.round(s*v / (k<1 ? k : 2-k) * 10000) / 100,
            k/2 * 100
        ];
    }

    return randomColor;
}));

});

require.register("./lib/easy-animation", function (exports, module) {
var _ = require('./lib/underscore');
var $ = window.$;

/**
 * 微信分享
 */



'use strict';


function EasyAnimation(dom, config) {


    var self = this;
    self.elems = {};
    self.serial = 1;
    self.blocked = false;
    self.domString = dom;

    config.viewport = $(dom) || $(window.document.documentElement);


    self.config = _.extend(self.defaults, config);


    self.init();
}

EasyAnimation.prototype = {


    defaults: {

        enter: 'bottom',
        move: '8px',
        over: '0.6s',
        wait: '0s',
        easing: 'ease',

        scale: {direction: 'up', power: '5%'},
        rotate: {x: 0, y: 0, z: 0},

        opacity: 0,
        mobile: false,
        visible: false,
        reset: false,

        //        Expects a reference to a DOM node (the <html> node by default)
        //        which is used as the context when checking element visibility.


        //        'always' — delay every time an animation resets
        //        'onload' - delay only for animations triggered by first load
        //        'once'   — delay only the first time an animation reveals
        delay: 'once',

        //        vFactor changes when an element is considered in the viewport.
        //        The default value of 0.60 means 60% of an element must be
        //        visible for its reveal animation to trigger.
        vFactor: 0.60,

        complete: function (el) {
        } // Note: reset animations do not complete.
    },

    // Queries the DOM, builds scrollReveal elements and triggers animation.
    // @param {boolean} flag — a hook for controlling delay on first load.
    init: function () {
        var self = this;
        var serial;
        var elem;
        var query = [];


        if (self.config.viewport.attr('data-sr')) {
            query.push(self.config.viewport.get(0));
        }

        self.config.viewport.each(function () {
            query = query.concat(Array.prototype.slice.call($(this).get(0).querySelectorAll('[data-sr]')));
        });


        query.forEach(function (el) {

            serial = self.serial++;
            elem = self.elems[serial] = {domEl: el};
            elem.config = self.configFactory(elem);
            elem.styles = self.styleFactory(elem);


            elem.seen = false;

            el.removeAttribute('data-sr');


            el.setAttribute('style',
                elem.styles.inline
                + elem.styles.initial
            );


        });

        if (self.config.visible == true) {
            self.show();
        } else {
            self.hide();
        }

    },

    show: function () {
        this.animate(true)
    },
    hide: function () {
        this.animate(false);
    },

    // Applies and removes appropriate styles.
    // @param {boolean} flag — a hook for controlling delay on first load.


    toggle: function (skip) {

        if (this.visible) {

            this.hide(skip)
        } else {
            this.show(skip)
        }

    },


    animate: function (visible) {
        var self = this;
        this.visible = visible;

        var key;
        var elem;
        //  var visible;

        // Begin element store digest.

      //  console.log(visible);
        for (key in self.elems) {
            if (self.elems.hasOwnProperty(key)) {

                elem = self.elems[key];
                // visible = self.isElemInViewport( elem );

                if (visible) {

                    if (self.config.delay === 'always'
                        || ( self.config.delay === 'onload' && flag )
                        || ( self.config.delay === 'once' && !elem.seen )) {

                        // Use delay.
                        elem.domEl.setAttribute('style',
                            elem.styles.inline
                            + elem.styles.target
                            + elem.styles.transition
                        );

                    } else {

                        // Don’t use delay.
                        elem.domEl.setAttribute('style',
                            elem.styles.inline
                            + elem.styles.target
                            + elem.styles.reset
                        );
                    }


                    elem.seen = true;

                    if (!elem.config.reset && !elem.animating) {
                        elem.animating = true;
                        complete(key);
                    }

                } else if (!visible && elem.config.reset) {

                    elem.domEl.setAttribute('style',
                        elem.styles.inline
                        + elem.styles.initial
                        + elem.styles.reset
                    );

                }

            }
        }

        // Digest complete, now un-block the event handler.
        self.blocked = false;

        // Cleans the DOM and removes completed elements from self.elems.
        // @param {integer} key — self.elems property key.
        function complete(key) {

            var elem = self.elems[key];

            setTimeout(function () {

                elem.domEl.setAttribute('style', elem.styles.inline);
                elem.config.complete(elem.domEl);
                delete self.elems[key];

            }, elem.styles.duration);
        }
    },

    // Parses an elements data-sr attribute, and returns a configuration object.
    // @param {object} elem — An object from self.elems.
    // @return {object}
    configFactory: function (elem) {
        var self = this;
        var parsed = {};
        var config = {};
        var words = elem.domEl.getAttribute('data-sr').split(/[, ]+/);

        words.forEach(function (keyword, i) {
            switch (keyword) {

                case 'enter':

                    parsed.enter = words[i + 1];
                    break;

                case 'wait':

                    parsed.wait = words[i + 1];
                    break;

                case 'move':

                    parsed.move = words[i + 1];
                    break;

                case 'ease':

                    parsed.move = words[i + 1];
                    parsed.ease = 'ease';
                    break;

                case 'ease-in':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'ease-in';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'ease-in';
                    break;

                case 'ease-in-out':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'ease-in-out';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'ease-in-out';
                    break;

                case 'ease-out':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'ease-out';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'ease-out';
                    break;

                case 'hustle':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                    break;

                case 'over':

                    parsed.over = words[i + 1];
                    break;

                case 'flip':
                case 'pitch':
                    parsed.rotate = parsed.rotate || {};
                    parsed.rotate.x = words[i + 1];
                    break;

                case 'spin':
                case 'yaw':
                    parsed.rotate = parsed.rotate || {};
                    parsed.rotate.y = words[i + 1];
                    break;

                case 'roll':
                    parsed.rotate = parsed.rotate || {};
                    parsed.rotate.z = words[i + 1];
                    break;

                case 'reset':

                    if (words[i - 1] == 'no') {
                        parsed.reset = false;
                    } else {
                        parsed.reset = true;
                    }
                    break;

                case 'scale':

                    parsed.scale = {};

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        break;
                    }

                    parsed.scale.power = words[i + 1];
                    break;

                case 'vFactor':
                case 'vF':
                    parsed.vFactor = words[i + 1];
                    break;

                case 'opacity':
                    parsed.opacity = words[i + 1];
                    break;

                default:
                    return;
            }
        });

        // Build default config object, then apply any keywords parsed from the
        // data-sr attribute.
        config = _.extend(config, self.config);
        config = _.extend(config, parsed);

        if (config.enter === 'top' || config.enter === 'bottom') {
            config.axis = 'Y';
        } else if (config.enter === 'left' || config.enter === 'right') {
            config.axis = 'X';
        }

        // Let’s make sure our our pixel distances are negative for top and left.
        // e.g. "enter top and move 25px" starts at 'top: -25px' in CSS.
        if (config.enter === 'top' || config.enter === 'left') {
            config.move = '-' + config.move;
        }

        return config;
    },

    // Generates styles based on an elements configuration property.
    // @param {object} elem — An object from self.elems.
    // @return {object}
    styleFactory: function (elem) {
        var self = this;
        var inline;
        var initial;
        var reset;
        var target;
        var transition;

        var cfg = elem.config;
        var duration = ( parseFloat(cfg.over) + parseFloat(cfg.wait) ) * 1000;

        // Want to disable delay on mobile devices? Uncomment the line below.
        // if ( self.isMobile() && self.config.mobile ) cfg.wait = 0;

        if (elem.domEl.getAttribute('style')) {
            inline = elem.domEl.getAttribute('style') + '; visibility: visible; ';
        } else {
            inline = 'visibility: visible; ';
        }

        transition = '-webkit-transition: -webkit-transform ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + ', opacity ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + '; ' +
        'transition: transform ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + ', opacity ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + '; ' +
        '-webkit-perspective: 1000;' +
        '-webkit-backface-visibility: hidden;';

        reset = '-webkit-transition: -webkit-transform ' + cfg.over + ' ' + cfg.easing + ' 0s, opacity ' + cfg.over + ' ' + cfg.easing + ' 0s; ' +
        'transition: transform ' + cfg.over + ' ' + cfg.easing + ' 0s, opacity ' + cfg.over + ' ' + cfg.easing + ' 0s; ' +
        '-webkit-perspective: 1000; ' +
        '-webkit-backface-visibility: hidden; ';

        initial = 'transform:';
        target = 'transform:';
        build();

        // Build again for webkit…
        initial += '-webkit-transform:';
        target += '-webkit-transform:';
        build();

        return {
            transition: transition,
            initial: initial,
            target: target,
            reset: reset,
            inline: inline,
            duration: duration
        };

        // Constructs initial and target styles.
        function build() {

            if (parseInt(cfg.move) !== 0) {
                initial += ' translate' + cfg.axis + '(' + cfg.move + ')';
                target += ' translate' + cfg.axis + '(0)';
            }

            if (parseInt(cfg.scale.power) !== 0) {

                if (cfg.scale.direction === 'up') {
                    cfg.scale.value = 1 - ( parseFloat(cfg.scale.power) * 0.01 );
                } else if (cfg.scale.direction === 'down') {
                    cfg.scale.value = 1 + ( parseFloat(cfg.scale.power) * 0.01 );
                }

                initial += ' scale(' + cfg.scale.value + ')';
                target += ' scale(1)';
            }

            if (cfg.rotate.x) {
                initial += ' rotateX(' + cfg.rotate.x + ')';
                target += ' rotateX(0)';
            }

            if (cfg.rotate.y) {
                initial += ' rotateY(' + cfg.rotate.y + ')';
                target += ' rotateY(0)';
            }

            if (cfg.rotate.z) {
                initial += ' rotateZ(' + cfg.rotate.z + ')';
                target += ' rotateZ(0)';
            }

            initial += '; opacity: ' + cfg.opacity + '; ';
            target += '; opacity: 1; ';
        }
    }


} // End of the scrollReveal prototype ======================================|


module.exports = EasyAnimation;

});

require.register("./lib/easy-animation-manager", function (exports, module) {
var _ = require('./lib/underscore');
var EasyAnimation=require("./lib/easy-animation");

/**
 * 动画管理
 */

function AnimationManager(config) {
    this.init(config);
}
AnimationManager.prototype.init = function (config) {
    this.config = _.extend({single: true, animations: {}}, config);
    this.animations = this.config.animations;
    this.currentAnimations = [];
};
AnimationManager.prototype.addAnimations=function(ids,config){
    for(var i=0;i<ids.length;i++){
        this.addAnimation(ids[i],new EasyAnimation(ids[i],config));
    }
};



AnimationManager.prototype.addAnimation = function (id, animation) {
    if (this.getAnimationByID(id)) {
        console.log('[' + id + ']  id is used');
        return;
    }
    this.animations[id] = animation;
    if(animation.visible){
        this.currentAnimations.push(animation);
    }



};
AnimationManager.prototype.removeAnimation = function (id) {
    if (this.getAnimationByID(id)) {
        delete  this.animations[id];
    }
};
AnimationManager.prototype.hide = function (mc) {


    mc.hide();
    this.currentAnimations= _.without(this.currentAnimations, mc);
 //   console.log(this.currentAnimations)


};
AnimationManager.prototype.hideAll = function () {


    while (this.currentAnimations.length > 0) {
        this.hide(this.currentAnimations.shift());
    }


};
AnimationManager.prototype.showAll = function () {
    var me=this;
    _.each(this.animations,function(ani){
        me.show(ani);
    });
};

AnimationManager.prototype.showByID = function (id) {

    if (this.getAnimationByID(id)) {
        this.show(this.animations[id]);
    }

};
AnimationManager.prototype.hideByID = function (id) {

    if (this.getAnimationByID(id)) {
        this.hide(this.animations[id]);
    }

};
AnimationManager.prototype.toggleByID=function (id) {

    if (this.getAnimationByID(id)) {
        this.toggle(this.animations[id]);
    }

};

AnimationManager.prototype.getAnimationByID=function(id){
    if (this.animations.hasOwnProperty(id)) {
        return this.animations[id];
    }
    return false;
};

AnimationManager.prototype.toggle=function (mc) {
    if (_.indexOf(this.currentAnimations, mc) == -1) {
        this.show(mc);
    }else{
        this.hide(mc);
    }




};



AnimationManager.prototype.show = function (mc) {

    if (_.indexOf(this.currentAnimations, mc) == -1) {


        if (this.config.single) {
            this.hideAll();
        }

        mc.show();
        this.currentAnimations.push(mc);

     //   console.log(this.currentAnimations)
    }

};


module.exports = AnimationManager;

});

require.register("./lib/form", function (exports, module) {
var _ = require('./lib/underscore');
var $ = window.$;
var Util = require('./lib/util');

/**
 * 表单
 *
 *
 *
 常用正则表达式
 提取信息中的网络链接:(h|H)(r|R)(e|E)(f|F) *= *('|")?(\w|\\|\/|\.)+('|"| *|>)?
 提取信息中的邮件地址:\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*
 提取信息中的图片链接:(s|S)(r|R)(c|C) *= *('|")?(\w|\\|\/|\.)+('|"| *|>)?
 提取信息中的IP地址:(\d+)\.(\d+)\.(\d+)\.(\d+)
 提取信息中的中国手机号码:(86)*0*13\d{9}
 提取信息中的中国固定电话号码:(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}
 提取信息中的中国电话号码（包括移动和固定电话）:(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}
 提取信息中的中国邮政编码:[1-9]{1}(\d+){5}
 提取信息中的中国身份证号码:\d{18}|\d{15}
 提取信息中的整数：\d+
 提取信息中的浮点数（即小数）：(-?\d*)\.?\d+
 提取信息中的任何数字 ：(-?\d*)(\.\d+)?
 提取信息中的中文字符串：[\u4e00-\u9fa5]*
 提取信息中的双字节字符串 (汉字)：[^\x00-\xff]*
 */

function Form(dom) {
    this.dom = $(dom);
}
Form.prototype.email = function (str) {

    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);

};
Form.prototype.radioHtml = function (obj, select, temp,name) {
    temp = temp || ' <input type="radio" name="{name}" value="{value}" {checked}/>{label} ';
    name=name||'';
    var html = '';
    _.each(obj, function (v, k) {
        var checked = (k == select ? 'checked' : '');
        if (!_.isObject(v)) {
            v = {name: name, value: k,label:v};
        }
        v.checked = checked;

        html += Util.nano(temp, v);
    });
    return html;
};
Form.prototype.checkboxHtml = function (obj, temp,name) {
    temp = temp || ' <input type="checkbox" name="{name}" value="{value}" {checked}/>{label} ';

    var html = '';
    _.each(obj, function (v, k) {
        v.checked = v.checked == true ? 'checked' : '';
        html += Util.nano(temp, v);
    });
    return html;
};
Form.prototype.comboboxHtmlByObj = function (obj, select) {
    var html = '';
    _.each(obj, function (v, k) {
        var selected = (k == select ? 'selected' : '');
        html += '<option value="' + k + '" ' + selected + '>' + v + '</option>';
    });
    return html;

};
Form.prototype.comboboxHtmlByArray = function (arr, label_key,value_key,value) {
    var html = '';
    _.each(arr, function (v) {
        var selected = (v[value_key]== value ? 'selected' : '');
        html += '<option value="' + v[value_key] + '" ' + selected + '>' + v[label_key] + '</option>';
    });
    return html;

};

Form.prototype.getInput = function (name, init) {
    var checkdom = this.dom;
    var value = '';
    var finded;
    var maxloop = 100;
    var loop = 0;
    while (!finded) {

        var valuedom = checkdom.find("[name='" + name + "']");
        if (valuedom.size() > 0) {

            if (valuedom.size() > 1) {
                value = checkdom.find("[name='" + name + "']" + ':checked').val();
                if (init != undefined) {

                    checkdom.find("[name='" + name + "'][value='" + init + "']").click();
                }
            } else if (valuedom.attr('type') == 'checkbox') {
                value = valuedom.is(':checked');
                if (init != undefined) {
                    valuedom.removeAttr('checked');
                    if (init == true) {
                        valuedom.click();
                    }
                }
            } else {


                value = valuedom.val();
                if (init != undefined) {
                    valuedom.val(init)
                }
            }

            finded = true;
            break;
        } else {
            loop++;
            if (loop > maxloop) {
                break;
            }
            checkdom = checkdom.parent();

        }


    }

    return value
};
Form.prototype.clearInputs = function () {
    var self = this;

    this.dom.find('input').each(function () {
        var node = $(this);
        var index = node.attr('name');
        var element = '';
        self.getInput(index, element);
    });
    return true;
};
Form.prototype.initInputs = function (name, inits) {
    var self = this;
    var obj;
    if (inits) {
        obj = _.object(name, inits);
    } else {
        obj = name;
    }
    var values = {};
    _.each(obj, function (element, index, list) {
        values[index] = self.getInput(index, element);
    });
    return values;
};
Form.prototype.getInputs = function (name) {
    var self = this;

    if (Util.isString(name)) {
        name = [name];
    }

    var values = {};
    for (var i = 0; i < name.length; i++) {
        values[name[i]] = self.getInput(name[i]);


    }

    return values;


};


module.exports = Form;

});

require.register("./lib/movie-clip", function (exports, module) {
var _ = require('./lib/underscore');
var $ = window.$;
var EventDispatcher = require("./lib/event-dispatcher");
var Util = require("./lib/util");

/**
 * 影片剪辑
 *
 *  Event  frame  play pause stop
 *
 */
function MovieClip(dom, opt) {
    if ($(dom).data('movieclip')) {
        console.log('inited movieclip');
        return $(dom).data('movieclip');
    }
    this.dom = $(dom);
    this.option = {};
    this.option.frameTime = 100;
    this.option.playOnce = false;
    this.option.loop = true;
    this.option.defaultActon = {name: 'default', frames: [1, -1]};

    this.option = $.extend(this.option, opt);


}


MovieClip.prototype.init = function () {
    EventDispatcher.prototype.apply(MovieClip.prototype);


    var movieClip = this;

    movieClip.frames = movieClip.dom.find('.movieclip_frame');
    movieClip.frames.css({padding: '0px'});
    movieClip.currentFrame = 1;
    movieClip.totalFrame = movieClip.frames.size();
    movieClip.playing = false;


    movieClip.loop = this.option.loop;

    this.option.defaultActon.frames[1] = movieClip.totalFrame;

    movieClip.action = movieClip.option.actions ? movieClip.option.actions[0] : this.option.defaultActon;

    movieClip.frame = function (frame) {

        movieClip.frames.hide();
        $(movieClip.frames.toArray()[frame - 1]).show();
        movieClip.currentFrame = frame;
        movieClip.dispatchEvent({type: "frame", frame: movieClip.currentFrame});


    };
    movieClip.nextFrame = function () {


        if (movieClip.currentFrame < movieClip.action.frames[1]) {


            movieClip.frame(movieClip.currentFrame + 1);
        } else {
            movieClip.frame(movieClip.action.frames[0]);
        }


        if (movieClip.loop == false && movieClip.currentFrame == movieClip.action.frames[1]) {
            movieClip.stop();
            return movieClip;
        } else {
            if (movieClip.playing == true) {
                movieClip.autoNextFrame();


            }

        }


    };
    movieClip.autoNextFrame = function () {
        movieClip.playing_iv = setTimeout(movieClip.nextFrame, movieClip.option.frameTime);

    };
    movieClip.clearAutoNextFrame = function () {
        clearTimeout(movieClip.playing_iv);

    };

    movieClip.delayPlay = function (time) {
        clearTimeout(movieClip.iv);
        movieClip.iv = setTimeout(movieClip.play, time);

    };


    movieClip.play = function () {
        clearTimeout(movieClip.iv);
        if (movieClip.playing == true) {
            return;
        }


        movieClip.clearAutoNextFrame();
        movieClip.autoNextFrame();
        movieClip.playing = true;


        movieClip.dispatchEvent({type: "play", frame: movieClip.currentFrame});
        movieClip.frame(movieClip.currentFrame);

    };
    movieClip.pause = function () {
        if (movieClip.playing == false) {
            return;
        }
        movieClip.clearAutoNextFrame();

        movieClip.playing = false;
        movieClip.dispatchEvent({type: "pause", frame: movieClip.currentFrame});

    };
    movieClip.stop = function () {
        if (movieClip.playing == false) {
            return;
        }
        movieClip.clearAutoNextFrame();


        movieClip.playing = false;
        movieClip.dispatchEvent({type: "stop", frame: movieClip.currentFrame});


    };


    movieClip.skipToAction = function (action) {
        for (var i = 0; i < movieClip.option.actions.length; i++) {
            if (action == movieClip.option.actions[i].name) {
                movieClip.action = movieClip.option.actions[i];
                break;

            }

        }
        movieClip.frame(movieClip.action.frames[0]);

        movieClip.play();

    };
    if (movieClip.totalFrame == 0) {
        return movieClip;
    }
    movieClip.frame(1);


    $(movieClip.dom).data('movieclip', movieClip);


};


MovieClip.prototype.buildHtml = function (dom, html, from, to, ID_length,reduceFrame) {
    var img;
    //reduceFrame 每几帧减少一帧

    var id=0;
    reduceFrame=reduceFrame||0;


    if (from < to) {

        for (var i = from; i <= to; i++) {
            if(reduceFrame>0){


                id++;
                if((id%reduceFrame)==0){
                    continue;
                }
            }
            img = $(html.replace('{ID}',Util.intToString(i, ID_length)));
            img.hide();

            $(dom).append(img);

        }
    } else {
        for (var i = from; i >= to; i--) {
            if(reduceFrame>0){


                id++;
                if((id%reduceFrame)==0){
                    continue;
                }
            }
            img = $(html.replace('{ID}', Util.intToString(i, ID_length)));
            img.hide();

            $(dom).append(img);

        }
    }


};


module.exports = MovieClip;

});

require.register("./lib/url", function (exports, module) {
var _ = require('./lib/underscore');
var Util = require('./lib/util');

/**
 * 微信分享
 */


var Url = {};


/*
 * 获取浏览器?后所有参数的对象，没有返回{}
 * */
Url.getParams = function (url) {
    url = url || String(window.location);
    return Util.stringToVars(url.split("?")[1]);
};
/*
 * 获取#后所有参数的字符串，没有返回''
 * */
Url.getHashsString = function (url) {
    url = url || String(window.location);
    return url.split("#")[1];

};
/*
 * 获取#后所有参数的对象，没有返回{}
 * */
Url.getHashs = function (url) {
    return Util.stringToVars(Url.getHashsString(url));

};
/*
 * 设置#后所有参数
 * */
Url.setHashs = function (vars) {
    window.location = String(window.location).split("#")[0] + '#' + Util.varsToString(vars);

};
Url.cachedHashs = '';

/*
 * 检测hash是否改变
 * */
Url.onHashChange = function (hashChangeFire) {
    var self = this;

    function isHashChanged() {
        var hashString = self.getHashsString();
        if (hashString == self.cachedHashs) {
            return false

        } else {
            self.cachedHashs = hashString;
            return true;

        }
    }

    if (('onhashchange' in window) && ((typeof document.documentMode === 'undefined') || document.documentMode == 8)) {
        // 浏览器支持onhashchange事件
        window.onhashchange = hashChangeFire;  // TODO，对应新的hash执行的操作函数
    } else {
        // 不支持则用定时器检测的办法
        setInterval(function () {
            var ischanged = isHashChanged();  // TODO，检测hash值或其中某一段是否更改的函数
            if (ischanged) {
                hashChangeFire();  // TODO，对应新的hash执行的操作函数
            }
        }, 150);
    }
};


/*
 * 页面跳转
 * */
Url.getUrl = function (url) {
    window.location = url;
};

Url.reload = function () {
    location.reload();
};

//获取HTML目录
Url.getPath = function (path) {
    var p = path || window.location.href;
    var pos = p.lastIndexOf("/index.php");
    if (pos > 0) {
        p = p.substr(0, pos + 1);
    }
    pos = p.indexOf("?");
    if (pos > 0) {
        p = p.substr(0, pos + 1);
    }

    pos = p.lastIndexOf("/");
    return p.substr(0, pos + 1);

};

//获取路径里的文件名和扩展名
Url.getFileName = function (url) {
    var pos = url.lastIndexOf("/");
    if (pos == -1) {
        pos = url.lastIndexOf("\\");
    }
    var filename = url.substr(pos + 1);
    var name = filename.substring(0, filename.lastIndexOf("."));
    //文件名
    var ext = filename.substr(filename.lastIndexOf(".") + 1);
    //扩展名
    return {
        name: name,
        ext: ext
    };
};


module.exports = Url;

});

require.register("./lib/video", function (exports, module) {
var _ = require('./lib/underscore');
var EventDispatcher = require("./lib/event-dispatcher");
/**
 * 声音播放
 *
 *  autoplay: true 如果false的话,视频有问题(iphone上) 可以在canplay后暂停
 *
 */

function Video(config) {
    this.init(config);
}

Video.prototype = {
    init: function (config) {
        var me = this;
        EventDispatcher.prototype.apply(Video.prototype);
        this.config = _.extend({
            autoplay: true,
            autoload: false


        }, config);

        if (!this.config.src) {
            console.log('path is need');
        } else {

            var videoObj = $('<video></video>');

            if (this.config.inline != false) {
                videoObj.attr('webkit-playsinline', true);
            }

            this.video = videoObj.get(0);
            for (var key in this.config) {
                if (this.config.hasOwnProperty(key) && (key in this.video)) {
                    this.video[key] = this.config[key];
                }
            }
            this.video.oncanplay = function () {
                me.dispatchEvent({type: "canplay"});
            }
            this.video.onended = function () {
                //me.stop();
                me.dispatchEvent({type: "ended"});
            };
            this.video.onloadeddata = function () {
                //me.stop();
                me.dispatchEvent({type: "onloadeddata"});
            };



            this.endedCheck();
            this.video.load();

        }

        //   console.log(this)

    },
    removeEndedCheck: function () {
        clearInterval(this.iv);
    },
    endedCheck: function () {
        var me = this;
        me.removeEndedCheck();
        this.iv = setInterval(function () {
            //me.stop();
            if (me.currentTime() < 1) {
                return;
            }
            if (me.currentTime() >= me.duration()) {
                me.dispatchEvent({type: "ended"});
                me.removeEndedCheck();
            }
        }, 100);
    },

    play: function () {
        this.endedCheck();
        this.video.play();
        this.dispatchEvent({type: "play"});
    },

    pause: function () {
        this.removeEndedCheck();
        this.video.pause();
        this.dispatchEvent({type: "pause"});
    },
    playing: function () {
        return !this.video.paused;
    },

    currentTime: function () {
        return this.video.currentTime;
    },
    duration: function () {
        return this.video.duration;
    },
    stop: function () {
        this.video.pause();
        this.removeEndedCheck();
        this.dispatchEvent({type: "stop"});
    },
    destory: function () {
        this.video.src = '';
    },

    toggle: function () {

        if (this.video.paused) {

            this.play();
        } else {
            this.pause();
        }

    },
    seek: function (a) {
        var player = this;

        function seekTo(t) {
            var b = player;
            try {
                player.video.currentTime = t, player.video.paused && player.video.play()
            } catch (c) {
                player.video.one("canplay", function () {
                    b.video.currentTime = t, b.video.paused && b.video.play()
                })
            }
            player.endedCheck();
        }

        function seek(t) {
            if (!isNaN(t)) {
                var b = this, c = null;
                c && (clearTimeout(c), c = null);
                var d = player.video.seekable;
                1 == d.length && t < d.end(0) ? seekTo(t) : c = setTimeout(function () {
                    seek(t)
                }, 100)
            }
        }


        seek(a);
    },


    percent: function () {
        return (this.video.currentTime / this.video.duration) || 0;

    }


};


module.exports = Video;

});

require.register("./lib/device", function (exports, module) {
var _ = require('./lib/underscore');

/**
 * 设备信息
 */
var Device = {
    UC: RegExp("Android").test(navigator.userAgent) && RegExp("UC").test(navigator.userAgent) ? true : false,
    wechat: RegExp("MicroMessenger").test(navigator.userAgent) ? true : false,
    iphone: RegExp("iPhone").test(navigator.userAgent) || RegExp("iPod").test(navigator.userAgent) || RegExp("iPad").test(navigator.userAgent) ? true : false,
    android: RegExp("Android").test(navigator.userAgent) ? true : false,
    isPC: function () {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    },
    removeSafariDefaultMove: function (dom) {
        if (!dom) {
            dom = 'body';
        }
        $(dom).attr('ontouchmove', 'event.preventDefault();');

    }
};
//Shake
function Shake(options) {
    //feature detect
    this.hasDeviceMotion = 'ondevicemotion' in window;

    this.options = {
        threshold: 15, //default velocity threshold for shake to register
        timeout: 1000 //default interval between events
    };

    if (typeof options === 'object') {
        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                this.options[i] = options[i];
            }
        }
    }

    //use date to prevent multiple shakes firing
    this.lastTime = new Date();

    //accelerometer values
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;

    //create custom event
    if (typeof document.CustomEvent === 'function') {
        this.event = new document.CustomEvent('shake', {
            bubbles: true,
            cancelable: true
        });
    } else if (typeof document.createEvent === 'function') {
        this.event = document.createEvent('Event');
        this.event.initEvent('shake', true, true);
    } else {
        return false;
    }
}

//reset timer values
Shake.prototype.reset = function () {
    this.lastTime = new Date();
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
};

//start listening for devicemotion
Shake.prototype.start = function () {
    this.reset();
    if (this.hasDeviceMotion) {
        window.addEventListener('devicemotion', this, false);
    }
};

//stop listening for devicemotion
Shake.prototype.stop = function () {
    if (this.hasDeviceMotion) {
        window.removeEventListener('devicemotion', this, false);
    }
    this.reset();
};

//calculates if shake did occur
Shake.prototype.devicemotion = function (e) {
    var current = e.accelerationIncludingGravity;
    var currentTime;
    var timeDifference;
    var deltaX = 0;
    var deltaY = 0;
    var deltaZ = 0;

    if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
        this.lastX = current.x;
        this.lastY = current.y;
        this.lastZ = current.z;
        return;
    }

    deltaX = Math.abs(this.lastX - current.x);
    deltaY = Math.abs(this.lastY - current.y);
    deltaZ = Math.abs(this.lastZ - current.z);

    if (((deltaX > this.options.threshold) && (deltaY > this.options.threshold)) || ((deltaX > this.options.threshold) && (deltaZ > this.options.threshold)) || ((deltaY > this.options.threshold) && (deltaZ > this.options.threshold))) {
        //calculate time in milliseconds since last shake registered
        currentTime = new Date();
        timeDifference = currentTime.getTime() - this.lastTime.getTime();

        if (timeDifference > this.options.timeout) {
            window.dispatchEvent(this.event);
            this.lastTime = new Date();
        }
    }

    this.lastX = current.x;
    this.lastY = current.y;
    this.lastZ = current.z;

};

//event handler
Shake.prototype.handleEvent = function (e) {
    if (typeof (this[e.type]) === 'function') {
        return this[e.type](e);
    }
};
Device.Shake=Shake;

module.exports = Device;

});

require.register("./lib/share", function (exports, module) {
var _ = require('./lib/underscore');
var Util = require('./lib/util');
var Device = require('./lib/device');
var Url = require('./lib/url');
var Input = require('./lib/input');

var Share = {};

/**
 * 微信分享
 */

function WechatShare(config) {
    this.init(config);
}


//默认参数
var wechat_share_defaults = {
    sdk: 'http://api.visionape.cn/wechat/?', //授权链接
    type: 'SDK',// SDK 或者 TXGAME
    jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
    ],
    shareData: {
        appmessage: {
            title: "",
            desc: "",
            img: "",
            link: ""
        }, timeline: {
            title: "",
            img: "",
            link: ""
        }
    }

};

WechatShare.prototype._loadHtmlInfo = function () {

    function getUrl(link) {
        if (!link) {
            return false;
        }
        if (Input.isHttp(link) || Input.isHttps(link)) {
            return link;
        } else {
            return Url.getPath() + link;
        }

    }

    this.config.shareData.appmessage.title = Util.getContentByName('wxm:appmessage_title');
    this.config.shareData.appmessage.desc = Util.getContentByName('wxm:appmessage_desc');
    this.config.shareData.appmessage.img_url =getUrl(Util.getContentByName('wxm:img_url')) || getUrl('share.jpg');
    this.config.shareData.appmessage.link = Util.getContentByName('wxm:link') || Url.getPath();
    this.config.shareData.timeline.title = Util.getContentByName('wxm:timeline_title');
    this.config.shareData.timeline.img_url = getUrl(Util.getContentByName('wxm:img_url')) ||getUrl('share.jpg');
    this.config.shareData.timeline.link = Util.getContentByName('wxm:link') || Url.getPath();

};

WechatShare.prototype._TXGAMESDK = function (callback) {
    //目前只有腾讯游戏项目支持，其他项目请调用 getSDK
    var self = this;
    try {
        WXJssdk.init(function (wx) {
            callback.apply(self, [wx]);

        })
    } catch (e) {


    }

};


WechatShare.prototype._getSDK = function (callback, apilist) {
    var self = this;

    $.getJSON(this.config.sdk + 'url=' + encodeURIComponent(location.href.replace(/[\#][\s\S]*/, '')) + '&callback=?', function (data) {

        try {

            wx.config({

                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: apilist
            });

            callback.apply(self, [wx]);
        } catch (e) {

        }


    });

};


WechatShare.prototype.update = function () {

    try {


        var self = this;

        wx.ready(function () {
            wx.onMenuShareAppMessage({
                title: self.config.shareData.appmessage.title,
                desc: self.config.shareData.appmessage.desc,
                link: self.config.shareData.appmessage.link,
                imgUrl: self.config.shareData.appmessage.img_url,
                trigger: self.config.shareData.appmessage.trigger,
                success: self.config.shareData.appmessage.success || function () {
                }, cancel: self.config.shareData.appmessage.cancel || function () {
                }, fail: self.config.shareData.appmessage.fail || function () {
                }

            });
            wx.onMenuShareTimeline({
                title: self.config.shareData.timeline.title,
                link: self.config.shareData.timeline.link,
                imgUrl: self.config.shareData.timeline.img_url,
                trigger: self.config.shareData.timeline.trigger,
                success: self.config.shareData.timeline.success || function () {
                },
                cancel: self.config.shareData.timeline.cancel || function () {
                },
                fail: self.config.shareData.timeline.fail || function () {
                }
            })
        })
    } catch (e) {
    }
};


WechatShare.prototype.init = function (config) {
    var self = this;
    this.config = _.extend(wechat_share_defaults, config);
    this._loadHtmlInfo();

    //if (false == Device.wechat) {
    //    //非微信
    //    return;
    //}

    if (this.config.type == 'SDK') {
        Util.getScript('http://res.wx.qq.com/open/js/jweixin-1.0.0.js', function () {
            self._getSDK(self.update, self.config.jsApiList);
        })
    } else if (this.config.type == 'TXGAME') {
        Util.getScript('http://ossweb-img.qq.com/images/js/WXJssdk.js', function () {
            self._TXGAMESDK(self.update);
        })
    }
};

WechatShare.prototype.set = function () {

    if (arguments.length === 3 && _.isString(arguments[0]) && _.isString(arguments[1])) {
        this.config.shareData[arguments[0]][arguments[1]] = arguments[2];
    } else {
        console.log('[WechatShare] set 函数参数错误')
    }

};
Share.WechatShare = WechatShare;

module.exports = Share;
});

require.register("./lib/smartjs", function (exports, module) {
"use strict";

var _ = require('./lib/underscore');
var Util=require('./lib/util');
var Css=require('./lib/css');
var Size=require('./lib/size');
var Input=require('./lib/input');
var File=require('./lib/file');
var FileButton=require('./lib/file-button');
var EventDispatcher=require('./lib/event-dispatcher');
var Drag=require('./lib/drag');
var Sound=require('./lib/sound');
var Tween=require('./lib/tween');
var CssAnimations=require('./lib/css-animations');
var ProCssAnimate=require('./lib/pro-css-animate');
var ToggleButton=require('./lib/toggle-button');
var AjaxFileUpload=require("./lib/ajax-file-upload");
var FastClick=require('./lib/fast-click');
var RandomColor=require('./lib/random-color');
var EasyAnimation = require("./lib/easy-animation");
var EasyAnimationManager = require("./lib/easy-animation-manager");
var Form=require("./lib/form");
var Loader=require('./lib/loader');
var MovieClip=require('./lib/movie-clip');
var Device=require('./lib/device');
var Dom=require('./lib/dom');
var Url=require('./lib/url');
var Video=require('./lib/video');
var Share=require('./lib/share');


var SmartJS = function (options) {
    this.copyright = 'www.2smart.cn';
   // console.log('By 2Smart ' + this.copyright);
    //赋值模块
    this._ = _;
    this.Util=Util;
    this.Css=Css;
    this.Size=Size;
    this.Input=Input;
    this.File=File;
    this.FileButton=FileButton;
    this.EventDispatcher=EventDispatcher;
    this.Drag=Drag;
    this.Sound=Sound;
    this.Tween=Tween;
    this.CssAnimations=CssAnimations;
    this.ProCssAnimate=ProCssAnimate;
    this.ToggleButton=ToggleButton;
    this.AjaxFileUpload=AjaxFileUpload;
    this.FastClick=FastClick;
    this.RandomColor=RandomColor;
    this.EasyAnimation=EasyAnimation;
    this.EasyAnimationManager=EasyAnimationManager;
    this.Form=Form;
    this.Loader=Loader;
    this.MovieClip=MovieClip;
    this.Dom=Dom;
    this.Url=Url;
    this.Video=Video;
    this.Device=Device;
    this.Share=Share;
};




module.exports = window.SmartJS = new SmartJS();



});

require("./lib/smartjs");
