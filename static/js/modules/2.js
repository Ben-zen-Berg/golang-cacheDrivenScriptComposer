function splitByModuleName('2') {
    app.modules['2'] = function() {
        console.log('Module 2.js was istalled.');
    };
}
function tempInstantAction() {
    app.modules['2']();
}