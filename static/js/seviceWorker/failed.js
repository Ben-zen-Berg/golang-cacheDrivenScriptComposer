(function(app) {
    if (typeof app.msg === 'undefined') {
        app.msg = {};
    }
    app.msg.failed = function() {
        alert('Somesting went wrong.');
    };
})((window.app = window.app || {}));
function tempInstantAction() { 
    app.msg.failed();
}