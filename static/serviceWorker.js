const failed = 'js/seviceWorker/failed.js';
const offline = 'js/seviceWorker/offline.js';
const staticModuleCacheName = 'js-modules-v1';

const scriptsToCache = [
    'js/app/plugInLoader.js',
    'js/modules/0.js',
    failed,
    offline,
];

const helper = {
    delay: 200,
    delimiters: {
        action: '/* --- temp instant action start --- */',
        module: /\/\* --- split modules by name '([1|2|4|8]0*|0)\.js\' --- \*\//g,
    },
    errors: {
        notFound: /\/\* --- Module ([1|2|4|8]0*)\.js not found\. --- \*\//g,
        serverErr: /\/\* --- Error while processing ([1|2|4|8]0*)\.js\! --- \*\//g,
    },
    tempModuleStore: {},
    serverErrors: {},
    fileNotFound: 0,
    filterKeyFromUrl: function(url) {
        var fileName = url.split('/').pop();
        return fileName.replace('reload_', '').split('.')[0];
    },
    cachedModulesKey: 0,
    setCachedModulesKey: function() {
        caches.open(staticModuleCacheName)
        .then(cache => {
            cache.keys()
            .then(keys => {
                int = 0;
                keys.forEach((request) => {
                    if (request.url.match(/js\/modules\/[1|2|4|8|0]+\.js$/)) {
                        int += parseInt('0x' + helper.filterKeyFromUrl(request.url));
                    }
                });
                helper.cachedModulesKey = int;
            })
        });
    },
    getAllBaseModules: function() {
        var i = 0;
        var arr = []
        while (scriptsToCache[i]) {
            var url = scriptsToCache[i++];
            if (url.indexOf('/modules/') != -1) {
                arr.push(url);
            }
        }
        return JSON.stringify(arr);
    },
    moduleDetection: function(key) {
        var int = parseInt(key.split('.')[0], 16);
        int &= ~helper.fileNotFound;
        var keys = {
            server: 0,
            client: 0
        };
        var bit = 1;
        while (bit < int) {
            if (bit & int) {
                keys[helper.cacheOrRemote(bit)] |= bit;
            }
            bit = bit << 1;
        }
        return keys;
    },
    cacheOrRemote: function(bit) {
        return (helper.cachedModulesKey & bit) ? 'client' : 'server';
    },
    getModuleCollectionFromKey: function(key) {
        var bit = 1;
        var int = parseInt(key, 16);
        var moduleCollection = [];
        if (key === '0') {
            moduleCollection.push('0.js');
        }
        while (bit < int) {
            if (bit & int) {
                moduleCollection.push(bit.toString(16) + '.js');
            }
            bit = bit << 1;
        }
        return moduleCollection;
    },
    composer: async function(event, key) {
        var distributedKeys = tempModuleStore.state[key].distributedKeys;
        if (!tempModuleStore.inited || distributedKeys.server || distributedKeys.client) {
            if (distributedKeys.server || !tempModuleStore.inited) {
                tempModuleStore.inited = true;
                await helper.getRemoteModulesCollection(key);
                var remoteContentLoaded = true;
            }
            if (distributedKeys.client) {
                await helper.getCachedModulesCollection(key);
                var cachedContentLoaded = true;
            }
            if (remoteContentLoaded || cachedContentLoaded) {
                var scriptContent = 'window.setTimeout(app.plugInLoader.load, ' + helper.delay + ', "js/modules/reload_' + key + '.js");';
                event.respondWith(
                    new Response(scriptContent, {
                        headers: {'Content-Type': 'application/javascript'}
                    })
                );
            }
        }
    },
    request: function(event) {
        event.respondWith(
            caches.match(event.request)
            .then(response => {
                if (typeof response !== 'undefined') {
                    return response;
                } else {
                    return fetch(event.request)
                    .then(response => {
                        if (!response.ok) {
                            return caches.match(failed);
                        }
                        return caches.open(staticModuleCacheName)
                        .then(cache => {
                            cache.put(event.request.url, response.clone());
                            return response;
                        })
                    }).catch(err => {
                        return caches.match(failed);
                    })
                }
            }).catch(() => {
                return caches.match(offline);
            })
        );
    },
    removeFromFileNotFoundKey: function(module) {
        helper.fileNotFound &= ~parseInt(module, 16);
    },
    logger: function(key, msg, err) {
        var regEx = /(\/?\*\/?| --- )/g;
        var logLine = 'console.log("' + msg.replace(regEx, '') + '");';
        if (key) {
            tempModuleStore.attachContent(key, 'action', logLine);
        } else {
            return logLine;
        }
    },
    serverErrorHandler: function(content, key) {
        var matches = content.match(helper.errors.serverErr)
        for (var i in matches) {
            helper.logger(key, matches[i]);
            var module = matches[i].replace(helper.errors.serverErr, '$1');
            helper.fileNotFound |= parseInt(module, 16);
            helper.serverErrors[module] = helper.serverErrors[module] ? helper.serverErrors[module] + 1 : 1;
            if (helper.serverErrors[module] <= 2) {
                self.setTimeout(helper.removeFromFileNotFoundKey, 1000, module);
            }
        }
    },
    missingModulesCheck: function(content, key) {
        var matches = content.match(helper.errors.notFound)
        for (var i in matches) {
            helper.logger(key, matches[i]);
            var module = matches[i].replace(helper.errors.notFound, '$1');
            helper.fileNotFound |= parseInt(module, 16);
        }
    },
    getRemoteModulesCollection: async function(key) {
        fetch(tempModuleStore.state[key].urls.remote)
        .then(response => {
            if (response.ok) {
                response.text()
                .then(async text => {
                    tempModuleStore.handleRemoteResponse(key, text);
                });
            }
        })
    },
    getCachedModulesCollection: function(key) {
        caches.open(staticModuleCacheName)
        .then(async cache => {
            var moduleCollection = tempModuleStore.state[key].modules;
            for (var i in moduleCollection) {
                cache.match('js/modules/' + moduleCollection[i])
                .then(response => {
                    if (typeof response !== 'undefined' && response.ok) {
                        response.text()
                        .then(text => {
                            var splitedCode = text.split(helper.delimiters.action);
                            tempModuleStore.attachContent(key, 'modules', splitedCode[0]);
                            tempModuleStore.attachContent(key, 'action', splitedCode[1]);
                        })
                    }
                });
            }
        });
    },
};

const tempModuleStore = {
    state: {},
    // settempModuleStoreObject
    initiateOrComplete: function(event) {
        var key = helper.filterKeyFromUrl(event.request.url);
        if (!tempModuleStore.state[key]) { 
            var distributedKeys = helper.moduleDetection(key);
            var obj = {
                content : {
                    modules: '',
                    action: '',
                },
                urls: {
                    remote: 'js/modules/' + distributedKeys.server.toString(16).toUpperCase() + '.js',
                    cache: 'js/modules/' + event.request.url.split('js/modules/')[1],
                },
                distributedKeys: distributedKeys,
                modules: helper.getModuleCollectionFromKey(key),
            };
            tempModuleStore.state[key] = obj
            return key;
        } else if (event.request.url.indexOf('reload_' + key) != -1) {
            var scriptContent = tempModuleStore.getScriptContent(key);
            event.respondWith(
                new Response(scriptContent, {
                    headers: {'Content-Type': 'application/javascript'}
                })
            );
        }
    },
    handleRemoteResponse: async function(key, text) {
        await caches.open(staticModuleCacheName)
        .then(async cache => {
            var splitedCode = text.split(helper.delimiters.action);
            helper.missingModulesCheck(splitedCode[0], key);
            helper.serverErrorHandler(splitedCode[0], key);
            if (splitedCode[0].match(helper.delimiters.module)) {
                var moduleChunks = splitedCode[0].split(helper.delimiters.module);
                var i = 1;
                while (moduleChunks[i]) {
                    var moduleKey = moduleChunks[i++];
                    if (String(Number(moduleKey)) === moduleKey) {
                        var content = moduleChunks[i++].replace(helper.errors.notFound, '').replace(helper.errors.serverErr, '').trim();
                        tempModuleStore.attachContent(key, 'modules', content)
                        if (content != '') {
                            await cache.put('js/modules/' + moduleKey + '.js', 
                                new Response(content, {
                                    headers: {'Content-Type': 'application/javascript'}
                                })
                            );
                            helper.cachedModulesKey |= parseInt(moduleKey, 16);
                        }
                    }
                }
            }
            if (splitedCode[1]) {
                tempModuleStore.attachContent(key, 'action', splitedCode[1]);
            }
            if (key === "0") {
                helper.logger(key, 'Base module installed!');
            }
        })
    },
    attachContent: function(key, type, content) {
        if (content && content.trim() !== "") {
            if (tempModuleStore.state[key].content[type]) {
                tempModuleStore.state[key].content[type] += '\n' + content;
            } else {
                tempModuleStore.state[key].content[type] = content;
            }
        }
    },
    getScriptContent: function(key) {
        tempModule = tempModuleStore.state[key];
        delete tempModuleStore.state[key];
        if (tempModule.content.modules + tempModule.content.action  === '') {
            return helper.logger(false, 'No modules get collected!');
        }
        if (tempModule.content.modules  !== '' && tempModule.content.action  === '' && tempModule.distributedKeys.server == 0) {
            tempModule.content.action += '\n' + helper.logger(false, 'Pure local response!');
        }
        return tempModule.content.modules + '\n\n' + helper.delimiters.action + '\n' + tempModule.content.action;
    },
}

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(staticModuleCacheName)
        .then(cache => {
            cache.addAll(scriptsToCache)
            .then(() => {
                return true;
            })
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.match(/\/js\/app\/plugInLoader\.js$/)) {
        helper.request(event);
    }
    if (event.request.url.match(/\/(modules|plugins)\/.*\.js$/)) {
        if (!helper.cachedModulesKey) {
            helper.setCachedModulesKey();
        }
        var key = tempModuleStore.initiateOrComplete(event);
        if (key) {
            helper.composer(event, key)
        }
    }
});