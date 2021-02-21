/* --- split modules by name '8.js' --- */
app.modules['8'] = function() {
    console.log('Module 8.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['8']) {
    app.modules['8']();
}