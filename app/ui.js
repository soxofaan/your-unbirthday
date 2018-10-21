define(['lib/d3', 'lib/xdate', 'app/generator'], function (d3, XDate, generator) {

    function setupForm(initialDate) {

        var initialYear = initialDate.getFullYear();
        var initialMonth = initialDate.getMonth();
        var initialDay = initialDate.getDate();

        var form = d3.select('#date-form').append('form');
        var day = form.append('select');
        day.selectAll('option')
            .data(d3.range(1, 32))
            .enter()
            .append('option')
            .attr('value', function (d) {return d;})
            .text(function (d) {return d;})
            .filter(function (d) {return d === initialDay; })
            .attr('selected', 'selected')
        ;

        var month = form.append('select');
        month.selectAll('option')
            .data(d3.range(0, 12))
            .enter()
            .append('option')
            .attr('value', function (d) {return d;})
            .text(function (d) {return (new XDate(2000, d, 1)).toString('MMMM');})
            .filter(function (d) { return d === initialMonth; })
            .attr('selected', 'selected')
        ;
        var year = form.append('select');
        year.selectAll('option')
            .data(d3.range((new Date()).getFullYear(), 1920, -1))
            .enter()
            .append('option')
            .attr('value', function (d) {return d;})
            .text(function (d) {return d;})
            .filter(function (d) { return d === initialYear; })
            .attr('selected', 'selected')
        ;


        form.append('button')
            .attr('type', 'button')
            .on('click', function () {
                var date = new XDate(year.property('value'), month.property('value'), day.property('value'));
                window.location.hash = '#' + date.toString('yyyy-MM-dd');
                showDates(date)

            })
            .text('Go!');

    }

    function showDates(birthDay) {
        var now = new XDate();
        var today = now.toString('yyyy-MM-dd');
        var fromDate = new XDate().addDays(-7);
        var toDate = new XDate().addMonths(12);

        var dates = generator.collect(birthDay, fromDate, toDate);

        dates = d3.entries(dates)
            .sort(function (a, b) { return d3.ascending(a.value, b.value);})
            .map(function (d) { return [d.key, d.value];});

        var byMonth = d3.nest()
            .key(function (d) { return d[1].toString('yyyy-MM') })
            .entries(dates)
        ;

        var monthSections = d3.select('#calendar').selectAll('div.month-section')
            .data(byMonth, function (d) {return d.key;});

        monthSections.exit().remove();

        var newMonthSections = monthSections.enter()
            .append('div')
            .attr('class', 'month-section')
        ;

        // Year+Month grouping label
        newMonthSections
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
        newMonthSections
            .append('div')
            .attr('class', 'days');

        var days = newMonthSections.merge(monthSections)
            .select('.days').selectAll('div.birthday')
            .data(function (d) {return d.values;});

        days.exit().remove();

        days.enter()
            .append('div')
            .merge(days)
            .attr('class', function (d) {
                return d[1].toString('yyyy-MM-dd') === today ? 'birthday birthday-today'
                    : (d[1] < now ? 'birthday birthday-past' : 'birthday birthday-future');
            })
            .html(function (d) {
                return (
                    '<div class="date"><span class="weekday">' + d[1].toString('ddd') + '</span> '
                    + '<span class="day">' + d[1].toString('d') + '</span></div> '
                    + '<span class="description">' + d[0] + '</span>'
                );
            })
        ;
        // TODO: gray out past days

    }

    function setup() {
        // Get initial date from URL fragment.
        var initialDate = new Date(window.location.hash.substring(1));
        if (isNaN(initialDate.getTime())) {
            setupForm((new XDate()).addYears(-25));
        }
        else {
            setupForm(initialDate);
            showDates(initialDate);
        }
    }

    return {
        setup: setup
    };


});
