function splitByModuleName('8000') {
    app.modules['8000'] = function() {
        console.log('Module 8000.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['8000']) {
        app.modules['8000']();
    }
}