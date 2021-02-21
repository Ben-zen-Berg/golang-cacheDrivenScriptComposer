/* --- split modules by name '200.js' --- */
app.modules['200'] = function() {
    console.log('Module 200.js was istalled.');
};

/* --- temp instant action start --- */
if (app && app.modules && app.modules['200']) {
    app.modules['200']();
}