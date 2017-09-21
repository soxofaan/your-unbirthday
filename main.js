function getNumberGenerators() {


    // Single number driver: 1, 2, 3, ... 99, 100
    function oneToHundred(f) {
        var i = 1;
        while (i <= 100 && f(i)) {
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


    // Convert (n -> bool) callback driver to (n, n, n, n, n -> bool) callback driver
    function repeat(driver) {
        return function (f) {
            driver(function (n) { return f(n, n, n, n, n)});
        }
    }

    // Convert (n -> bool) callback driver to (n, n+1, n+2, n+3, n+4 -> bool) callback driver
    function increase(driver) {
        return function (f) {
            driver(function (n) { return f(n, n + 1, n + 2, n + 3, n + 4)});
        }
    }

    // Convert (n -> bool) callback driver to (n+4, n+3, n+2, n+1, n -> bool) callback driver
    function decrease(driver) {
        return function (f) {
            driver(function (n) { return f(n + 4, n + 3, n + 2, n + 1, n)});
        }
    }

    function scale(driver) {
        return function (f) {
            driver(function (n) { return f(n, n * 2, n * 3, n * 4, n * 5)});
        }
    }

    function double(driver) {
        return function (f) {
            driver(function (n) { return f(n, n * 2, n * 4, n * 8, n * 16)});
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

    function pi(f) {
        f(3, 1, 4, 1, 5);
        f(3, 14, 15, 92, 65);
        f(31, 41, 59, 26, 53);
        // TODO: more
    }

    // 123, 123, 123
    // 1234, 1234, 1234
    // 12345, 12345, 12345

    // 123, 321, 123, 321, ...
    // 1234, 4321, 1234, 4321, ...

    // 12, 34, 56, 78
    // 123, 456, 789
    // 1, 23, 345
    function oneTwoThree(f) {
        f()
    }

    return [
        // 'repeated one to hundred':
        repeat(oneToHundred),
        // 'one to hundred incrementing':
        increase(oneToHundred),
        // 'one to hundred decrementing':
        decrease(oneToHundred),
        scale(oneToHundred),
        double(oneToHundred),
        // 'digit and zeros':
        repeat(digitAndZeros),
        scale(digitAndZeros),
        double(digitAndZeros),
        // 'digit repeated':
        repeat(digitRepeat),
        // 'fibonnaci':
        fibonnaci,
        pi
    ];

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
    // TODO: successive squares
    // TODO: succesive primes
    // TODO: doubling increase
    // pi numbers: [3, 1, 4, 1, 5], [3, 14, 15, 92] ...

}


function getNumberToDateConvertors(birthDate) {

    function buildDateConvertor(code) {
        return function convertor() {
            var args = arguments;

            function shift() {
                return Array.prototype.shift.call(args);
            }

            var nameParts = [];
            var date = new XDate(birthDate);
            var x;
            if (/y/.test(code)) {
                x = shift();
                date.addYears(x);
                nameParts.push(x + ' years');
            }
            if (/m/.test(code)) {
                x = shift();
                date.addMonths(x);
                nameParts.push(x + ' months');
            }
            if (/w/.test(code)) {
                x = shift();
                date.addDays(7 * x);
                nameParts.push(x + ' weeks');
            }
            if (/d/.test(code)) {
                x = shift();
                date.addDays(x);
                nameParts.push(x + ' days');
            }
            if (/h/.test(code)) {
                x = shift();
                date.addHours(x);
                nameParts.push(x + ' hours');
            }
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

    return [
        buildDateConvertor('y'),
        buildDateConvertor('ym'),
        buildDateConvertor('ymw'),
        buildDateConvertor('ymwd'),
        buildDateConvertor('ymwdh'),
        buildDateConvertor('ymd'),
        buildDateConvertor('ymdh'),
        buildDateConvertor('m'),
        buildDateConvertor('mw'),
        buildDateConvertor('mwd'),
        buildDateConvertor('mwdh'),
        buildDateConvertor('md'),
        buildDateConvertor('mdh'),
        buildDateConvertor('w'),
        buildDateConvertor('wd'),
        buildDateConvertor('wdh'),
        buildDateConvertor('d'),
        buildDateConvertor('dh')
    ];

}


function collectSpecialDays(birthDate, fromDate, toDate) {
    var dates = {};
    var numberGenerators = getNumberGenerators();
    var dateConvertors = getNumberToDateConvertors(birthDate);
    dateConvertors.forEach(function (dateConvertor) {
        numberGenerators.forEach(function (numberGenerator) {
            // Call number generator with callback that collects relevant dates.
            numberGenerator(function collect() {
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
        });
    });

    return dates;
}


function main(domSelector) {

    var today = new Date();
    var birthDay = new Date(1980, 1, 20);
    // var birthDay = new Date(2005, 1, 20);
    // var fromDate = new Date(2017, 07, 1);
    var fromDate = new XDate().addMonths(-1);
    // var fromDate = new XDate(birthDay).addMonths(-2);
    // var toDate = new Date(2019, 1, 1);
    var toDate = new XDate().addYears(1);
    // var toDate = new XDate(birthDay).addYears(5);

    var dates = collectSpecialDays(birthDay, fromDate, toDate);


    dates = d3.entries(dates)
        .sort(function (a, b) { return d3.ascending(a.value, b.value);})
        .map(function (d) { return [d.key, d.value];});
    console.log(dates);

    var byMonth = d3.nest()
        .key(function (d) { return d[1].toString('yyyy-MM') })
        .entries(dates)
    ;


    console.log(byMonth);

    var monthSections = d3.select(domSelector).selectAll('div.month-group')
        .data(byMonth)
        .enter()
        .append('div')
        .attr('class', 'month-section')
    ;

    // Year+Month grouping label
    monthSections
        .append('div')
        .attr('class', 'month-label')
        .html(function (d) {
            return (
                '<div class="month">' + d.values[0][1].toString('MMMM') + '</div>'
                + '<div class="year">' + d.values[0][1].toString('yyyy') + '</div>'
            );
        })
    ;

    // Birthdays
    monthSections
        .append('div')
        .attr('class', 'days')
        .selectAll('div.day')
        .data(function (d) {return d.values;})
        .enter()
        .append('div')
        .attr('class', 'birthday')
        .html(function (d) {
            return (
                '<div class="date"><span class="weekday">' + d[1].toString('ddd') + '</span> '
                + '<span class="day">' + d[1].toString('d') + '</span></div> '
                + '<span class="description">' + d[0] + '</span>'
            );
        })


}
