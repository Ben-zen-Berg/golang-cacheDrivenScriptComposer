(function (app) {
  var plugInLoader = document.querySelector('script[src*="js/app/plugInLoader.js"]');
  if (plugInLoader) {
    app.modules = app.modules || {};
    app.plugInLoader = {
      installModule: function (jsContent) {
        var vacantScript = document.createElement('script');
        document.head.replaceChild(vacantScript, app.plugInLoader.installerScript);
        app.plugInLoader.installerScript = vacantScript;
        app.plugInLoader.installerScript.innerHTML = jsContent;
      },
      installBaseModules: function () {
        try {
          fetch('install_all_base_modules')
            .then(response => {
              if (response.ok) {
                response.json()
                  .then(baseModules => {
                    for (var i in baseModules) {
                      app.plugInLoader.load(baseModules[i]);
                    }
                  })
              } else {
                app.plugInLoader.load('js/modules/0.js');
              }
            })
        } catch (e) {
          app.plugInLoader.load('js/modules/0.js');
        };
      },
      load: function (url) {
        fetch(url)
          .then(response => {
            if (response.ok) {
              response.text()
                .then(text => {
                  app.plugInLoader.installModule(text);
                })
            }
          })
      },
      installerScript: document.createElement('script'),
    };
    document.head.insertBefore(app.plugInLoader.installerScript, plugInLoader);
  }
})((window.app = window.app || {}));