function splitByModuleName('1') {
    app.modules['1'] = function() {
        console.log('Module 1.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['1']) {
        app.modules['1']();
    }
}