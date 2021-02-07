function splitByModuleName('4000') {
    app.modules['4000'] = function() {
        console.log('Module 4000.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['4000']) {
        app.modules['4000']();
    }
}