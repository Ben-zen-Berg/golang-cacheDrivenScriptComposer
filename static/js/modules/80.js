/* --- split modules by name '80.js' --- */
app.modules['80'] = function() {
    console.log('Module 80.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['80']) {
    app.modules['80']();
}