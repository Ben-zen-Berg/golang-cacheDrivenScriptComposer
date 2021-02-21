/* --- split modules by name '4000.js' --- */
app.modules['4000'] = function() {
    console.log('Module 4000.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['4000']) {
    app.modules['4000']();
}