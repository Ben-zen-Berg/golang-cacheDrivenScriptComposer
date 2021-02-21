/* --- split modules by name '1.js' --- */
app.modules['1'] = function() {
    console.log('Module 1.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['1']) {
    app.modules['1']();
}