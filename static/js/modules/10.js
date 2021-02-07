function splitByModuleName('10') {
    app.modules['10'] = function() {
        console.log('Module 10.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['10']) {
        app.modules['10']();
    }
}