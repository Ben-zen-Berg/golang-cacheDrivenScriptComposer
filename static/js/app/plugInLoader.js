(function (app) {
  app.plugInLoader = {
    clearScript: function (name) {
      if (app.plugInLoader[name]) {
        var vacantScript = document.createElement('script');
        document.head.replaceChild(vacantScript, app.plugInLoader[name]);
        app.plugInLoader[name] = vacantScript;
      }
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
      }
      catch(e) {
        app.plugInLoader.load('js/modules/0.js');
      };
    },
    load: function (url) {
      fetch(url)
      .then(response => {
        if (response.ok) {
            response.text()
            .then(text => {
              app.plugInLoader.clearScript('tempInstantActionScript');
              var splitedCode = text.split(app.plugInLoader.delimiter.action);
              if (splitedCode[0].match(app.plugInLoader.delimiter.module)) {
                var moduleChunks = splitedCode[0].split(app.plugInLoader.delimiter.module);
                for (var i in moduleChunks) {
                  if (moduleChunks[i].trim() == '') {
                    continue;
                  }
                  app.plugInLoader.clearScript('installerScript');
                  var moduleChunk = moduleChunks[i];
                  var name = moduleChunk.match(/^\(['|"]?[^'|"|\)]*/)[0].replace(/^\(['|"]?/, '');
                  if (!app.modules[name]) {
                    app.plugInLoader.installerScript.innerHTML = '(function(app)' + moduleChunk.replace(RegExp('^\\([\'|\"]?' + name + '[\'|\"]?\\)'), '') + ')((window.app = window.app || {}))';
                  }
                }
              } else {
                app.plugInLoader.clearScript('installerScript');
                app.plugInLoader.installerScript.innerHTML = splitedCode[0];
              }
              if (splitedCode[1]) {
                app.plugInLoader.tempInstantActionScript.innerHTML = '(function(app)' + splitedCode[1] + ')((window.app = window.app || {}))';
              }
            })
          }
        }
      )
    },
    installerScript: document.createElement('script'),
    tempInstantActionScript: document.createElement('script'),
    delimiter: {
      action: 'function tempInstantAction()',
      module: 'function splitByModuleName',
    },
  };
  app.modules = {};
  var appScript = document.querySelector('script[src*="js/app/plugInLoader.js"]');
  document.head.insertBefore(app.plugInLoader.installerScript, appScript);
  document.head.insertBefore(app.plugInLoader.tempInstantActionScript, appScript);
  app.plugInLoader.load('js/modules/0.js');
})((window.app = window.app || {}));