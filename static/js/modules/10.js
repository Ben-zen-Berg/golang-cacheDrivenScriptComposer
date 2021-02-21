/* --- split modules by name '10.js' --- */
app.modules['10'] = function() {
    console.log('Module 10.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['10']) {
    app.modules['10']();
}