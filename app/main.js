requirejs.config({
    baseUrl: '.',
    shim: {
        'lib/xdate': {
            exports: 'XDate'
        }
    }
});

require(['app/generator', 'app/ui'], function (generator, ui) {
    ui.setupForm();
});