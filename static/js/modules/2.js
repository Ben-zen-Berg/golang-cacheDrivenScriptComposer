/* --- split modules by name '2.js' --- */
app.modules['2'] = function() {
    console.log('Module 2.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['2']) {
    app.modules['2']();
}