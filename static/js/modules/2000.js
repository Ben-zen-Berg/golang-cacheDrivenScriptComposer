function splitByModuleName('2000') {
    app.modules['2000'] = function() {
        console.log('Module 2000.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['2000']) {
        app.modules['2000']();
    }
}