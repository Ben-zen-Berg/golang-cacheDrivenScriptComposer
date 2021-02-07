function splitByModuleName('8') {
    app.modules['8'] = function() {
        console.log('Module 8.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['8']) {
        app.modules['8']();
    }
}