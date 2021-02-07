function splitByModuleName('1000') {
    app.modules['1000'] = function() {
        console.log('Module 1000.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['1000']) {
        app.modules['1000']();
    }
}