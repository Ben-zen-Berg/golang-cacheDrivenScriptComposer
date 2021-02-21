/* --- split modules by name '4.js' --- */
app.modules['4'] = function() {
    console.log('Module 4.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['4']) {
    app.modules['4']();
}