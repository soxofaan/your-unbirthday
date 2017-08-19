function getNumberGenerators() {
    return [
        // 1, 2, 3, ... 99, 100
        function (f) {
            for (var i = 1; i <= 100; i++) {
                f(i);
            }
        },
        // Generate numbers 1, 2, ..., 9, 10, 20, ..., 90, 100, 200, ...
        function (f) {
            var x = 0;
            var b = 1;
            while (true) {
                x += 1;
                if (x >= 10) {
                    x = 0;
                    b *= 10;
                }
                f(x * b);
            }
        },
        // '1213456789' form
        function (f) {
            f(123);
            f(1234);
            f(12345);
            f(123456);
            f(1234567);
            f(12345678);
            f(123456789);
        },
        // '987654321' form
        function (f) {
            f(987);
            f(9876);
            f(98765);
            f(987654);
            f(9876543);
            f(98765432);
            f(987654321);
        },
        // 111, 222, 333, ..., 1111, 2222, ..., 11111, ....
        function (f) {
            var b = 111;
            while (true) {
                for (var n = 1; n < 10; n++) {
                    f(n * b);
                }
                b = b * 10 + 1;
            }
        }
    ];

}


function getNumberToDateConvertors(birthDate) {
    // Straightforward convertors
    var convertors = {
        'add seconds': function (x) {
            return ['add ' + x + ' seconds', (new XDate(birthDate)).addSeconds(x)];
        },
        'add minutes': function (x) {
            return ['add ' + x + ' minutes', (new XDate(birthDate)).addMinutes(x)];
        },
        'add hours': function (x) {
            return ['add ' + x + ' hours', (new XDate(birthDate)).addHours(x)];
        },
        'add days': function (x) {
            return ['add ' + x + ' days', (new XDate(birthDate)).addDays(x)];
        },
        'add weeks': function (x) {
            return ['add ' + x + ' weeks', (new XDate(birthDate)).addDays(7 * x)];
        },
        'add months': function (x) {
            return ['add ' + x + ' months', (new XDate(birthDate)).addMonths(x)];
        },
        'add years': function (x) {
            return ['add ' + x + ' years', (new XDate(birthDate)).addYears(x)];
        }
    };

    // Multiple term convertors
    function getConvertor(year, month, week, day) {

        function convertor(x) {
            var name = 'add';
            var d = new XDate(birthDate);
            if (year) {
                d.addYears(x);
                name += ' ' + x + ' years'
            }
            if (month) {
                d.addMonths(x);
                name += ' ' + x + ' months'
            }
            if (week) {
                d.addDays(7 * x);
                name += ' ' + x + ' weeks'
            }
            if (day) {
                d.addDays(x);
                name += ' ' + x + ' days'
            }
            return [name, d];
        }

        return convertor;
    }

    convertors['add years and months'] = getConvertor(1, 1);
    convertors['add years, months and weeks'] = getConvertor(1, 1, 1);
    convertors['add years, months, weeks and days'] = getConvertor(1, 1, 1, 1);
    convertors['add years, months and days'] = getConvertor(1, 1, 0, 1);
    convertors['add months and weeks'] = getConvertor(0, 1, 1, 0);
    convertors['add months, weeks and days'] = getConvertor(0, 1, 1, 1);
    convertors['add months and days'] = getConvertor(0, 1, 0, 1);
    convertors['add weeks and days'] = getConvertor(0, 0, 1, 1);


    return convertors;
}

function DateOverflow(d) { this.message = "Date overflow: " + d }

function collectSpecialDays(birthDate, fromDate, toDate) {


    var dates = [];

    function wrapToCollect(f) {
        return function () {
            var x = f.apply(null, arguments);
            if (x[1] > toDate) {
                throw new DateOverflow(x)
            }
            if (x[1] > fromDate) {
                dates.push(x);
            }
        }
    }


    var numberGenerators = getNumberGenerators();
    var dateConvertors = getNumberToDateConvertors(birthDate);
    console.info(numberGenerators);


    for (var dKey in dateConvertors) {
        if (dateConvertors.hasOwnProperty(dKey)) {
            var dateConvertor = dateConvertors[dKey];

            numberGenerators.forEach(function (numberGenerator) {

                console.info(numberGenerator);

                try {
                    numberGenerator(wrapToCollect(dateConvertor));
                }
                catch (err) {
                    // console.debug(err)
                }


            });
        }
    }

    return dates;

}


function main(domSelector) {

    var birthDay = new Date(1980, 1, 20);
    var fromDate = new Date(2016, 0, 1);
    var toDate = new Date(2019, 11, 31);

    var dates = collectSpecialDays(birthDay, fromDate, toDate)
    console.log(dates);

    d3.select(domSelector)
        .selectAll('p')
        .data(dates)
        .enter()
        .append('p')
        .text(function (d) {return d[0] + ': ' + d[1].toString();})

}
