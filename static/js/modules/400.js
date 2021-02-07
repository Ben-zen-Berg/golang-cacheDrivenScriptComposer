function splitByModuleName('400') {
    app.modules['400'] = function() {
        console.log('Module 400.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['400']) {
        app.modules['400']();
    }
}