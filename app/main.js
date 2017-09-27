requirejs.config({
    baseUrl: '.',
    shim: {
        'lib/xdate': {
            exports: 'XDate'
        }
    }
});

require(['app/ui'], function (ui) {
    ui.setup();
});