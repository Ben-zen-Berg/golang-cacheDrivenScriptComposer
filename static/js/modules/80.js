function splitByModuleName('80') {
    app.modules['80'] = function() {
        console.log('Module 80.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['80']) {
        app.modules['80']();
    }
}