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
    delimiter: {
        action: 'function tempInstantAction()',
        module: 'function splitByModuleName',
        notFound: /\/\* --- Module ([1|2|4|8]0*)\.js not found\. --- \*\//g,
        serverErr: /\/\* --- Error while processing ([1|2|4|8]0*)\.js\. --- \*\//g,
    },
    tempContentStore: {},
    serverErrors: {},
    setTempContentStoreObject: function(key, obj) {
        if (!helper.tempContentStore[key]) {
            helper.tempContentStore[key] = {
                modules: '',
                action: '',
            };
        }
        if (obj) {
            for (var i in obj) {
                helper.tempContentStore[key][i] = obj[i];
            }
        }
    },
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
        var keys = {
            server: 0,
            client: 0
        };
        var bit = 1;
        var int = parseInt(key.split('.')[0], 16);
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
        while (bit < int) {
            if (bit & int) {
                moduleCollection.push(bit.toString(16) + '.js');
            }
            bit = bit << 1;
        }
        return moduleCollection;
    },
    composer: function(event, key) {
        var modules = helper.moduleDetection(key);
        var fileName = !modules.server && modules.client ? 'reload_' + key : key;
        var scriptContent = helper.delimiter.action + '{ window.setTimeout(app.plugInLoader.load, ' + helper.delay + ', "js/modules/' + fileName + '.js"); }';
        var init = !modules.server && !modules.client && !helper.tempContentStore[key];
        if (init || modules.server || modules.client) {
            if (helper.tempContentStore[key]) {
                if (helper.tempContentStore[key].modules !== '') {
                    if (!helper.tempContentStore[key].counter || helper.tempContentStore[key].counter == helper.tempContentStore[key].children) {
                        scriptContent = helper.tempContentStore[key].modules + helper.tempContentStore[key].action;
                        delete helper.tempContentStore[key];
                    }
                } else if (modules.client) {
                    helper.getCachedModulesCollection(key);
                }
            } else {
                var url = 'js/modules/' + modules.server.toString(16).toUpperCase() + '.js';
                var requestedUrl = 'js/modules/' + event.request.url.split('js/modules/')[1];
                if (modules.server || init) {
                    helper.getRemoteModulesCollection(url, requestedUrl);
                } else {
                    helper.getCachedModulesCollection(key);
                }
            }
            event.respondWith(
                new Response(scriptContent, {
                    headers: {'Content-Type': 'application/javascript'}
                })
            );
        } else {
            helper.request(event);
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
    removeFromCachedModulesKey: function(module) {
        helper.cachedModulesKey &= ~parseInt(module, 16);
    },
    serverErrorHandler: function(content) {
        var matches = content.match(helper.delimiter.serverErr)
        for (var i in matches) {
            content = content.replace(matches[i], '');
            var module = matches[i].replace(helper.delimiter.serverErr, '$1');
            helper.cachedModulesKey |= parseInt(module, 16);
            helper.serverErrors[module] = helper.serverErrors[module] ? helper.serverErrors[module]++ : 1;
            if (helper.serverErrors[module] <= 3) {
                self.setTimeout(helper.removeFromCachedModulesKey, 1000, module);
            }
        }
        return content.trim()
    },
    missingModulesCheck: function(content) {
        content = helper.serverErrorHandler(content);
        var matches = content.match(helper.delimiter.notFound)
        for (var i in matches) {
            content = content.replace(matches[i], '');
            var module = matches[i].replace(helper.delimiter.notFound, '$1');
            helper.cachedModulesKey |= parseInt(module, 16);
        }
        return content.trim()
    },
    getRemoteModulesCollection: function(url, requestedUrl) {
        fetch(url)
        .then(response => {
            if (response.ok) {
                response.text()
                .then(text => {
                    caches.open(staticModuleCacheName)
                    .then(cache => {
                        var splitedCode = text.split(helper.delimiter.action);
                        splitedCode[0] = helper.missingModulesCheck(splitedCode[0]);
                        if (splitedCode[0].match(helper.delimiter.module)) {
                            var moduleChunks = splitedCode[0].split(helper.delimiter.module);
                            for (var i in moduleChunks) {
                                if (moduleChunks[i].trim() == '') {
                                    continue;
                                }
                                var moduleChunk = moduleChunks[i];
                                var fileName = moduleChunk.match(/^\(['|"]?[^'|"|\)]*/)[0].replace(/^\(['|"]?/,'');
                                var moduleContent = helper.delimiter.module + moduleChunk;
                                helper.cachedModulesKey |= parseInt(fileName, 16);
                                cache.put('js/modules/' + fileName + '.js', 
                                    new Response(moduleContent, {
                                        headers: {'Content-Type': 'application/javascript'}
                                    })
                                );
                                helper.cachedModulesKey |= parseInt(fileName, 16);
                            }
                        }
                        if (splitedCode[1]) {
                            var key = helper.filterKeyFromUrl(requestedUrl);
                            helper.setTempContentStoreObject(key, {
                                action: helper.delimiter.action + splitedCode[1],
                            });
                        }
                    })
                }).catch(() => {
                    return caches.match(failed);
                });
            } else {
                return response;
            }
        }).catch(() => {
            return caches.match(failed);
        })
    },
    getCachedModulesCollection: function(key) {
        var moduleCollection = helper.getModuleCollectionFromKey(key);
        caches.open(staticModuleCacheName)
        .then(cache => {
            for (var i in moduleCollection) {
                cache.match('js/modules/' + moduleCollection[i])
                .then(response => {
                    if (typeof response !== 'undefined' && response.ok) {
                        response.text()
                        .then(text => {
                            if (helper.tempContentStore[key]) {
                                helper.tempContentStore[key].modules += text+'\n';
                                if (helper.tempContentStore[key].counter) {
                                    helper.tempContentStore[key].counter += 1;
                                }
                            } else {
                                helper.setTempContentStoreObject(key, {
                                    modules: text+'\n',
                                    action: helper.delimiter.action + '{ console.log("Pure local response!"); }',
                                    counter: 1,
                                    children: moduleCollection.length,
                                });
                            }
                        })
                    }
                });
            }
        })
    },
};

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
        var key = helper.filterKeyFromUrl(event.request.url);
        if (!helper.cachedModulesKey) {
            helper.setCachedModulesKey();
        }
        helper.composer(event, key);
    }
});