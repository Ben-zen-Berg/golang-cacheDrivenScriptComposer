function splitByModuleName('4') {
    app.modules['4'] = function() {
        console.log('Module 4.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['4']) {
        app.modules['4']();
    }
}