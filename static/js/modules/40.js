/* --- split modules by name '40.js' --- */
app.modules['40'] = function() {
    console.log('Module 40.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['40']) {
    app.modules['40']();
}