function splitByModuleName('200') {
    app.modules['200'] = function() {
        console.log('Module 200.js was istalled.');
    };
}
function tempInstantAction() {
    if (app && app.modules && app.modules['200']) {
        app.modules['200']();
    }
}