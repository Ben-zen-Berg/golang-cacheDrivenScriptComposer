function splitByModuleName('100') {
    app.modules['100'] = function() {
        console.log('Module 100.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['100']) {
        app.modules['100']();
    }
}