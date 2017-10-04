define(['lib/xdate'], function (XDate) {


    // Helpers to convert a "driver" function that takes a single argument callback function
    // to a new driver function that takes a multiple argument callback function
    // (where the arguments relate in a certain way).
    var unfold = {
        'repeat': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n, n, n, n, n, n); });
            }
        },
        'increase': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n + 1, n + 2, n + 3, n + 4, n + 5, n + 6); });
            }
        },
        'decrease': function (driver) {
            return function (f) {
                driver(function (n) { return f(n + 6, n + 5, n + 4, n + 3, n + 2, n + 1, n); });
            }
        },
        'scale': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n * 2, n * 3, n * 4, n * 5, n * 6, n * 7); });
            }
        },

        'double': function (driver) {
            return function (f) {
                driver(function (n) { return f(n, n * 2, n * 4, n * 8, n * 16, n * 32, n * 64); });
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

    // Fibonnaci: apply successive Fibonnaci numbers to callback
    function fibonnaci(f) {
        var ab = [1, 1];
        ab.push(ab[0] + ab[1]);
        ab.push(ab[1] + ab[2]);
        ab.push(ab[2] + ab[3]);

        while (f.apply(null, ab)) {
            ab.shift();
            ab.push(ab[2] + ab[3]);
        }
    }

    // Build number sequences from a fixed digit sequence
    // e.g. pi: 3,14159265  ->  ... [31, 41, 592, 6, 5] ... [3, 14, 159, 26, 5] ...
    function fromDigits(digits) {
        // Implementation: recursively based on a state array that keeps track of the length (in digits)
        // of each number in the sequence.

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
            state[i] += 1;
            return state
        }

        return function (f) {
            // TODO: make sure all numbers (or at least 4) are consumed
            /// Apply state and recursively evaluate higher states
            function recurse(state, start_index) {
                var numbers = stateToNumbers(state);
                var total = state.reduce(function (a, v) {return a + v;}, 0);
                // TODO: limit the difference in state values
                // Try the numbers: if it works and there is room to grow: try larger digit groups recursively
                if (f.apply(null, numbers) && total < digits.length) {
                    for (var i = start_index; i <= 4; i++) {
                        recurse(incr(state, i), i);
                    }
                }
            }

            recurse([1, 1, 1, 1, 1, 1, 1], 0);
        };
    }

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

    // Normal integers (from 1 to infinity): at least 4 date parts required
    addGenerators(
        [
            unfold.repeat(oneToInfinity), unfold.increase(oneToHundred), unfold.decrease(oneToHundred),
            unfold.scale(oneToHundred), unfold.double(oneToHundred)
        ],
        [
            'DYMW', 'DYMWd', 'DYMd',
            'YMWdh', 'YMdh',
            'MWdh'
        ]
    );

    // Special single numbers
    addGenerators(
        [
            unfold.repeat(digitAndZeros), unfold.scale(digitAndZeros), unfold.double(digitAndZeros),
            unfold.repeat(digitRepeat)
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
        [fibonnaci],
        ['DYMW', 'DYMWd', 'DYMWdh']
    );

    // Pi and other digits
    addGenerators(
        [
            // Pi
            fromDigits([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]),
            // Ascending and descending numbers
            fromDigits([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
            fromDigits([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]),
        ],
        [
            'DYMW', 'DYMWd', 'DYMWdh', 'DYMWdhm',
            'YMWd', 'YMWdh', 'YMWdhm',
            'MWdh', 'MWdhm'
        ]
    );

    addGenerators(
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) {
            return fromDigits([i, i, i, i, i, i, i, i, i, i]);
        }),
        [
            'DYMWdh', 'YMWdh'
        ]
    );


    //
    // return [
    //     function (f) {
    //         [123, 1234, 12345, 123456, 1234567, 12345678, 123456789].forEach(f);
    //     },
    //     function (f) {
    //         [987, 9876, 98765, 987654, 9876543, 98765432, 987654321].forEach(f)
    //     },
    //     function (f) {
    //         [12321, 1234321, 123454321, 12345654321].forEach(f)
    //     },
    // ];
    // 123, 123, 123
    // 1234, 1234, 1234
    // 12345, 12345, 12345

    // 123, 321, 123, 321, ...
    // 1234, 4321, 1234, 4321, ...

    // TODO: successive squares
    // TODO: succesive primes
    // TODO: doubling increase
    // TODO: partition of the 10 digits


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

