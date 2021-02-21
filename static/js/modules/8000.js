/* --- split modules by name '8000.js' --- */
app.modules['8000'] = function() {
    console.log('Module 8000.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['8000']) {
    app.modules['8000']();
}