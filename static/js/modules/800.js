function splitByModuleName('800') {
    app.modules['800'] = function() {
        console.log('Module 800.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['800']) {
        app.modules['800']();
    }
}