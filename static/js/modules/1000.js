/* --- split modules by name '1000.js' --- */
app.modules['1000'] = function() {
    console.log('Module 1000.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['1000']) {
    app.modules['1000']();
}