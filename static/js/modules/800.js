/* --- split modules by name '800.js' --- */
app.modules['800'] = function() {
    console.log('Module 800.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['800']) {
    app.modules['800']();
}