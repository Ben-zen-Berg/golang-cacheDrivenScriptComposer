(function(app) {
    if (typeof app.msg === 'undefined') {
        app.msg = {};
    }
    app.msg.offline = function() {
        alert('No internet connection.');
    };
})((window.app = window.app || {}));
function tempInstantAction() {
    app.msg.offline();
}