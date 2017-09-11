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
                    x = 1;
                    b *= 10;
                }
                f(x * b);
            }
        },
        function (f) {
            [123, 1234, 12345, 123456, 1234567, 12345678, 123456789].forEach(f);
        },
        function (f) {
            [987, 9876, 98765, 987654, 9876543, 98765432, 987654321].forEach(f)
        },
        function (f) {
            [12321, 1234321, 123454321, 12345654321].forEach(f)
        },
        // Fibonnaci (above 100)
        function fibonnaci(f) {
            var ab = [89, 144];
            while (true) {
                f(ab[1]);
                ab = [ab[1], ab[0] + ab[1]];
            }
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
        'N years': function (x) { return [x + ' years', (new XDate(birthDate)).addYears(x)]; },
        'N months': function (x) { return [x + ' months', (new XDate(birthDate)).addMonths(x)]; },
        'N weeks': function (x) { return [x + ' weeks', (new XDate(birthDate)).addDays(7 * x)]; },
        'N days': function (x) { return [x + ' days', (new XDate(birthDate)).addDays(x)]; },
        'N hours': function (x) { return [+x + ' hours', (new XDate(birthDate)).addHours(x)]; },
        'N minutes': function (x) { return [x + ' minutes', (new XDate(birthDate)).addMinutes(x)]; },
        'N seconds': function (x) { return [x + ' seconds', (new XDate(birthDate)).addSeconds(x)]; }
    };

    // Multiple term convertors
    function getConvertor(year, month, week, day, hour) {

        function convertor(x) {
            var name;
            var ns = [];
            var d = new XDate(birthDate);
            if (year) {
                d.addYears(x);
                ns.push(x + ' years');
            }
            if (month) {
                d.addMonths(x);
                ns.push(x + ' months');
            }
            if (week) {
                d.addDays(7 * x);
                ns.push(x + ' weeks');
            }
            if (day) {
                d.addDays(x);
                ns.push(x + ' days');
            }
            if (hour) {
                d.addHours(x);
                ns.push(x + ' hours');
            }
            if (ns.length > 1) {
                name = ns.slice(0, ns.length - 1).join(', ') + ' and ' + ns[ns.length - 1]
            }
            else {
                name = ns[0];
            }
            return [name, d];
        }

        return convertor;
    }

    convertors['N years and N months'] = getConvertor(1, 1);
    convertors['N years, N months and N days'] = getConvertor(1, 1, 0, 1);
    convertors['N years, N months and N weeks'] = getConvertor(1, 1, 1);
    convertors['N years, N months, N weeks and N days'] = getConvertor(1, 1, 1, 1);
    convertors['N months and N weeks'] = getConvertor(0, 1, 1, 0);
    convertors['N months and N days'] = getConvertor(0, 1, 0, 1);
    convertors['N months, N weeks and N days'] = getConvertor(0, 1, 1, 1);
    convertors['N weeks and N days'] = getConvertor(0, 0, 1, 1);

    convertors['N years, N+1 months, N+2 days'] = function (x) {
        return [
            x + ' years, ' + (x + 1) + ', months and ' + (x + 2) + ' days',
            (new XDate(birthDate)).addYears(x).addMonths(x + 1).addDays((x + 2))
        ];
    };
    convertors['N years, N+1 months, N+2 weeks'] = function (x) {
        return [
            x + ' years, ' + (x + 1) + ', months and ' + (x + 2) + ' weeks',
            (new XDate(birthDate)).addYears(x).addMonths(x + 1).addDays(7 * (x + 2))
        ];
    };
    convertors['N years, N+1 months, N+2 weeks, N+3 days'] = function (x) {
        return [
            x + ' years, ' + (x + 1) + ', months ' + (x + 2) + ', weeks and ' + (x + 3) + ' days',
            (new XDate(birthDate)).addYears(x).addMonths(x + 1).addDays(7 * (x + 2) + (x + 3))
        ];
    };

    return convertors;
}

function DateOverflow(d) { this.message = "Date overflow: " + d }

function collectSpecialDays(birthDate, fromDate, toDate) {

    var dates = {};

    function wrapToCollect(f, dates) {
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
    for (var dKey in dateConvertors) {
        if (dateConvertors.hasOwnProperty(dKey)) {
            dates[dKey] = [];
            var dateConvertor = dateConvertors[dKey];

            numberGenerators.forEach(function (numberGenerator) {
                try {
                    numberGenerator(wrapToCollect(dateConvertor, dates[dKey]));
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

    var today = new Date();
    var birthDay = new Date(1980, 1, 20);
    // var fromDate = new Date(2017, 07, 1);
    var fromDate = new XDate().addMonths(-2);
    // var fromDate = new XDate(birthDay).addMonths(-2);
    // var toDate = new Date(2019, 1, 1);
    var toDate = new XDate().addYears(1);
    // var toDate = new XDate(birthDay).addYears(5);

    var dates = collectSpecialDays(birthDay, fromDate, toDate);


    var width = 960;
    var height = 400;
    var margin = {top: 32, bottom: 10, left: 0, right: 0};


    var svg = d3.select(domSelector).append('svg')
        .attr("width", width)
        .attr("height", height);


    var xScale = d3.scaleTime().domain([fromDate, toDate]).range([margin.left, width - margin.right]);
    var yScale = d3.scalePoint().domain(d3.keys(dates)).range([margin.top, height - margin.bottom]);


    svg.append('g')
        .attr('class', 'time-axis')
        .attr('transform', 'translate(0,20)')
        .call(d3.axisTop(xScale));

    var tooltip = d3.select("body")
        .append("div")
        .attr('class', 'tooltip');
    var tooltipDate = tooltip.append('div').attr('class', 'date');
    var tooltipDescription = tooltip.append('div').attr('class', 'description');

    var families = svg.selectAll('g.family')
        .data(d3.entries(dates))
        .enter()
        .append('g')
        .attr('class', 'family')
        .attr('transform', function (d) { return 'translate(0,' + yScale(d.key) + ")"; })
    ;
    families.append('line')
        .attr('class', 'family-background')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', width).attr('y2', 0)
        .append('title')
        .text(function (d) {return d.key;})
    ;
    families.append('line')
        .attr('class', 'family')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', width).attr('y2', 0)
    ;

    var circles = families.selectAll('circle')
        .data(function (d) {return d.value})
        .enter()
        .append('circle')
        .attr('cx', function (d) {return xScale(d[1])})
        .attr('r', 5)

        .on("mouseover", function (d) {
            d3.select(this).transition().duration(100).attr('r', 10);
            tooltip.style("visibility", "visible");
            tooltipDate.text(d[1].toString('yyyy-MM-dd'));
            tooltipDescription.text(d[0]);
            tooltip.style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).transition().duration(500).attr('r', 5);
            tooltip.style("visibility", "hidden");
        });


    svg.append('rect')
        .attr('height', height)
        .attr('width', xScale(today))
        .attr('class', 'today')
    ;
    svg.append('line')
        .attr('x1', xScale(today)).attr('y1', 0)
        .attr('x2', xScale(today)).attr('y2', height)
        .attr('class', 'today')
    ;
}
