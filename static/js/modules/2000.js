/* --- split modules by name '2000.js' --- */
app.modules['2000'] = function() {
    console.log('Module 2000.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['2000']) {
    app.modules['2000']();
}