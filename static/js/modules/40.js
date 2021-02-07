function splitByModuleName('40') {
    app.modules['40'] = function() {
        console.log('Module 40.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['40']) {
        app.modules['40']();
    }
}