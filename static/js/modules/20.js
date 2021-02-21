/* --- split modules by name '20.js' --- */
app.modules['20'] = function() {
    console.log('Module 20.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['20']) {
    app.modules['20']();
}