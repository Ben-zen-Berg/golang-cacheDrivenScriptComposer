/* --- split modules by name '100.js' --- */
app.modules['100'] = function() {
    console.log('Module 100.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['100']) {
    app.modules['100']();
}