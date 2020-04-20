browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        let searchEngines = Object.keys(SEARCH_ENGINE_URLS);
        let balancedSearchEngineDistrib = computeBalancedDistribution(searchEngines);
        console.log('Default ditribution :', balancedSearchEngineDistrib);
        browser.storage.local.set({
            'search_engine_distrib_store': balancedSearchEngineDistrib
        });

        browser.storage.local.set({'do_redirect': true});
    }

});

browser.omnibox.onInputEntered.addListener(function (text) {
    browser.storage.local.get('search_engine_distrib_store', function (data) {
        let searchEngineDistrib = data.search_engine_distrib_store;
        let searchEngineDomains = {};
        let totalWeight = 0;

        for (const [engine, weight] of Object.entries(searchEngineDistrib)) {
            let domainStart = totalWeight;
            let domainEnd = domainStart + weight;
            searchEngineDomains[engine] = [domainStart, domainEnd];
            totalWeight += weight;
        }

        console.log(searchEngineDomains);
        let rand = Math.random() * 100;
        let selectedEngine = getEngineFromRand(searchEngineDomains, rand);
        let searchURL = SEARCH_ENGINE_URLS[selectedEngine] + encodeURIComponent(text);
        console.log('Rand :', rand, '- selected engine:', selectedEngine);
        browser.tabs.update({url: searchURL});
    });
});
