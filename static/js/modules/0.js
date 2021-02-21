/* --- split modules by name '0.js' --- */
app.modules['0'] = function() {
    console.log('Module 0.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['0']) {
    app.modules['0']();
}