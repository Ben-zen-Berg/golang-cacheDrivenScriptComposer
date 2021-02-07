function splitByModuleName('20') {
    app.modules['20'] = function() {
        console.log('Module 20.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['20']) {
        app.modules['20']();
    }
}