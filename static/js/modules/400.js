/* --- split modules by name '400.js' --- */
app.modules['400'] = function() {
    console.log('Module 400.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['400']) {
    app.modules['400']();
}