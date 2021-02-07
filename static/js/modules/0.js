function splitByModuleName('0') {
    app.modules['0'] = function() {
        console.log('Module 0.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['0']) {
        app.modules['0']();
    }
}