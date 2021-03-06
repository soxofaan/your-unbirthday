define(['lib/xdate'], function (XDate) {

    // Maximum number of arguments for date convertors.
    var ARGSMAX = 8;

    var range8 = [0, 1, 2, 3, 4, 5, 6, 7];

    // A "driver" is a function that takes a single callback argument `f`,
    // which takes one or multiple numerical arguments and returns a boolean.
    // The driver should call the callback `f` successively with a set of numbers
    // following a particular pattern. For example: call `f(1, 2, 3)`, call `f(2, 3, 4)`,
    // call `f(3, 4, 5)` et cetera. The driver should check the return value of these callback
    // calls and stop once a falsy value is returned.
    // This allows the driver to implement an infinite sequence while delegating the termination condition to the callback.


    // Helpers to convert a "driver" function that takes a single argument callback function
    // to a new driver function that takes a multiple argument callback function
    // (where the arguments relate in a certain way).
    var unfold = {
        'repeat': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n, n, n, n, n, n, n); });
            }
        },
        'increase': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n + 1, n + 2, n + 3, n + 4, n + 5, n + 6, n + 7); });
            }
        },
        'decrease': function (driver) {
            return function (f) {
                driver(function (n) { return f(n + 7, n + 6, n + 5, n + 4, n + 3, n + 2, n + 1, n); });
            }
        },
        'scale': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n * 2, n * 3, n * 4, n * 5, n * 6, n * 7, n * 8); });
            }
        },

        'double': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n * 2, n * 4, n * 8, n * 16, n * 32, n * 64, n * 128); });
            }
        }
    };


    // Single number driver: 1, 2, 3, ... 99, 100
    function oneToHundred(f) {
        var i = 1;
        while (i <= 100 && f(i)) {
            i++;
        }
    }

    // Single number driver: 1, 2, 3, ...
    function oneToInfinity(f) {
        var i = 1;
        while (f(i)) {
            i++;
        }
    }

    // Single number driver: 1, 2, ..., 9, 10, 20, ..., 90, 100, 200, ...
    function digitAndZeros(f) {
        var x = 1;
        var b = 1;
        while (f(x * b)) {
            x++;
            if (x >= 10) {
                x = 1;
                b *= 10;
            }
        }
    }

    // Single number driver: 111, 222, 333, ..., 999, 1111, 2222, ..., 9999, 11111, ....
    function digitRepeat(f) {
        var x = 1;
        var b = 111;
        while (f(x * b)) {
            x++;
            if (x >= 10) {
                x = 1;
                b = b * 10 + 1;
            }
        }
    }

    function increasingDigits(f) {
        f(123) && f(1234) && f(12345) && f(123456) && f(1234567) && f(12345678) && f(123456789);
    }

    function decreasingDigits(f) {
        f(987) && f(9876) && f(98765) && f(987654) && f(9876543) && f(98765432) && f(987654321);
    }

    // Fibonnaci: apply successive Fibonnaci numbers to callback
    function fibonnaci(f) {
        var ab = [1, 1];
        while (ab.length < ARGSMAX) {
            ab.push(ab[ab.length - 2] + ab[ab.length - 1]);
        }

        while (f.apply(null, ab)) {
            ab.shift();
            ab.push(ab[2] + ab[3]);
        }
    }

    function squares(f) {
        for (
            var i = 1;
            f.apply(null, range8.map(function (x) { return (i + x) * (i + x); }));
            i++
        ) {
        }
    }

    // Paired mirror numbers: [123, 321, 123, 321], ..., [456, 654, 456, 654], ...
    function mirrorNumbers(f) {
        function mirror(x) {
            var y = 0;
            while (x) {
                y = y * 10 + (x % 10);
                x = Math.floor(x / 10);
            }
            return y
        }

        [
            123, 234, 345, 456, 567, 678, 789,
            1234, 2345, 3456, 4567, 5678, 6789
        ].forEach(function (x) {
            var y = mirror(x);
            f(x, y, x, y);
            f(y, x, y, x);
        })
    }

    // Build number sequences from a fixed digit sequence
    // e.g. pi: 3,14159265  ->  ... [31, 41, 592, 6, 5] ... [3, 14, 159, 26, 5] ...
    function fromDigits(digits, stateSize, chunkSize) {
        // Implementation: recursively based on a state array that keeps track of the length (in digits)
        // of each number in the sequence.

        chunkSize = chunkSize || 1;

        // Starting state: sequence of ones: [1, 1, 1, ..., 1, 1]
        var startState = Array(stateSize || ARGSMAX).fill(chunkSize);


        /// Convert state array to numbers using the digits
        function stateToNumbers(state) {
            // Convert state to slices.
            var slices = state.reduce(function (a, v, i) {
                return a.concat(i < 1 ? [[0, v]] : [[a[a.length - 1][1], a[a.length - 1][1] + v]]);
            }, []);
            // Slice digit array and turn into numbers
            var numbers = slices.map(function (v) {
                return digits.slice.apply(digits, v).reduce(function (a, v) { return a * 10 + v;}, 0);
            });
            return numbers;
        }

        /// Copy state and increment at given index
        function incr(state, i) {
            state = state.slice();
            state[i] += chunkSize;
            return state
        }

        return function (f) {
            /// Apply state and recursively evaluate higher states
            function recurse(state, start_index) {
                var numbers = stateToNumbers(state);
                var total = state.reduce(function (a, v) {return a + v;}, 0);
                // TODO: limit the difference in state values
                // Try the numbers: if it works and there is room to grow: try larger digit groups recursively
                if (total < digits.length && f.apply(null, numbers)) {
                    for (var i = start_index; i < stateSize; i++) {
                        recurse(incr(state, i), i);
                    }
                }
            }

            recurse(startState, 0);
        };
    }

    // Sequence of (driver, datecodes) pairs
    var generators = [];

    function addGenerators(drivers, codes) {
        drivers.forEach(function (driver) {
            generators.push([driver, codes]);
        });
    }


    // Regular birthdays
    addGenerators(
        [unfold.repeat(oneToHundred)],
        ['Y']
    );

    // Normal integers (from 1 to infinity): needs high number of date parts to be interesting.
    addGenerators(
        [
            unfold.repeat(oneToInfinity),
            unfold.increase(oneToHundred), unfold.decrease(oneToHundred),
            unfold.scale(oneToHundred), unfold.double(oneToHundred)
        ],
        [
            'DYMWdh', 'DYMdh',
            'YMWdhm', 'YMdhm',
            'MWdhm'
        ]
    );

    // Special single numbers
    addGenerators(
        [
            unfold.repeat(digitAndZeros), unfold.scale(digitAndZeros), unfold.double(digitAndZeros),
            unfold.repeat(digitRepeat),
            unfold.repeat(increasingDigits),
            unfold.repeat(decreasingDigits)
        ],
        [
            'Y', 'YM', 'YMW', 'YMWd', 'YMd',
            'M', 'MW', 'MWd', 'Md',
            'W', 'Wd', 'Wdh',
            'd', 'dh', 'dhm',
            'h', 'm', 's'
        ]
    );

    // Fibonnaci
    addGenerators(
        [fibonnaci, squares],
        [
            'DYMWd', 'DYMWdh', 'DYMd', 'DYMdh',
            'YMWd', 'YMWdh', 'YMdh'
        ]
    );

    // Digit sequence partitions
    [
        'DMWdh',
        'DMdh',
        'YMWdh',
        'YMdh',
        'MWdh'
    ].forEach(function (code) {
        var stateSize = code.length;
        addGenerators(
            [
                // Pi
                fromDigits([3, 1, 4, 1, 5, 9, 2, 6, 5, 3], stateSize),
                // Ascending and descending numbers
                fromDigits([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], stateSize),
                fromDigits([9, 8, 7, 6, 5, 4, 3, 2, 1, 0], stateSize)
            ],
            [code]
        );
    });


    // Repeated digit chunks (avoid decade usage here)
    [
        'YMWd', 'YMWdh',
        'YMd',
        'MWd'
    ].forEach(function (code) {
        var stateSize = code.length;
        addGenerators(
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) {
                return fromDigits([i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i], stateSize);
            }),
            [code]
        );
    });

    // Repeated digit pairs
    [
        'YMWdh',
        'MWdh'
    ].forEach(function (code) {
        var stateSize = code.length;
        var drivers = [];
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (i) {
            [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (j) {
                if (i != j) {
                    drivers.push(fromDigits([i, j, i, j, i, j, i, j, i, j, i, j, i, j, i, j, i, j, i, j, i, j], stateSize, 2));
                    drivers.push(fromDigits([i, j, j, i, i, j, j, i, i, j, j, i, i, j, j, i, i, j, j, i, i, j], stateSize, 2));
                }
            });
        });
        addGenerators(drivers, [code]);
    });

    // Mirrored numbers in pairs
    addGenerators(
        [mirrorNumbers],
        [
            'MWdh', 'MW', 'Mdhm', 'Md', 'Mhms', 'Mh',
            'Wdhm', 'Wd', 'Whms', 'Wh',
            'dhms', 'dh',
            'hm'
        ]
    );

    // TODO: successive primes
    // TODO: 1-11-111-1111, 2-22-222-2222, ....


    // Factory to build a function that takes multiple numbers as arguments and returns a date.
    function buildDateConvertor(birthDate, code) {
        return function convertor() {
            var args = arguments;
            // Copy date to manipulate
            var date = new XDate(birthDate);
            var nameParts = [];

            [
                [/D/, 'decade', function (x) {return date.addYears(10 * x);}],
                [/Y/, 'year', date.addYears],
                [/M/, 'month', date.addMonths],
                [/W/, 'week', function (x) { return date.addDays(7 * x);}],
                [/d/, 'day', date.addDays],
                [/h/, 'hour', date.addHours],
                [/m/, 'minute', date.addMinutes],
                [/s/, 'second', date.addSeconds]
            ].forEach(function (period) {
                // period[0]: regex
                // period[1]: period name
                // period[2]: date increment callback
                if (period[0].test(code)) {
                    var x = Array.prototype.shift.call(args);
                    if (x) {
                        period[2].call(date, x);
                        nameParts.push(x + ' ' + period[1] + (x > 1 ? 's' : ''));
                    }
                }
            });
            var name;
            if (nameParts.length > 1) {
                name = nameParts.slice(0, nameParts.length - 1).join(', ') + ' and ' + nameParts[nameParts.length - 1]
            }
            else {
                name = nameParts[0];
            }
            return [name, date];
        };
    }

    /**
     * Collect special dates, given a certain birth day, between certain dates
     * @param birthDate Date object
     * @param fromDate XDate
     * @param toDate XDate
     * @returns array mapping date description string to XDate object
     */
    function collect(birthDate, fromDate, toDate) {
        var dates = {};

        generators.forEach(function (generator) {
            var driver = generator[0];
            var dateCodes = generator[1];
            dateCodes.forEach(function (dateCode) {
                var dateConvertor = buildDateConvertor(birthDate, dateCode);

                // Call number generator with callback that collects relevant dates.
                driver(function collect() {
                    // TODO: guard against too low/high dates?
                    var result = dateConvertor.apply(null, arguments);
                    if (result[1] > toDate) {
                        // Abort this number driver
                        return false;
                    }
                    if (result[1] > fromDate) {
                        // TODO: skip/merge cases with long common prefix on same date
                        dates[result[0]] = result[1];
                    }
                    return true;
                });


            })
        });


        return dates;
    }

    return {
        collect: collect
    };
});

