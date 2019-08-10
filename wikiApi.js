const fetch = require("node-fetch");

let api = 'https://en.wikipedia.org/w/api.php?'

let callType = {
    links: {
        actionUrlBuilder: (api, title, cont) => `${api}action=query&prop=links&format=json&redirects=1&titles=${encodeURIComponent(title)}&pllimit=500${cont}`,
        continueGetter: json => json.continue.plcontinue,
        continueBuilder: cont => `&plcontinue=${cont}`,
        dataGetter: json => Object.values(json.query.pages)[0].links.map(l => l.title)
    },
    backLinks: {
        actionUrlBuilder: (api, title, cont) => `${api}action=query&list=backlinks&format=json&redirects=1&bltitle=${encodeURIComponent(title)}&bllimit=500${cont}`,
        continueGetter: json => json.continue.blcontinue,
        continueBuilder: cont => `&blcontinue=${cont}`,
        dataGetter: json => json.query.backlinks.map(l => l.title)
    },
    linksHere: {
        actionUrlBuilder: (api, title, cont) => `${api}action=query&prop=linkshere&format=json&redirects=1&titles=${encodeURIComponent(title)}&lhimit=500${cont}`,
        continueGetter: json => json.continue.lhcontinue,
        continueBuilder: cont => `&lhcontinue=${cont}`,
        dataGetter: json => Object.values(json.query.pages)[0].linkshere.map(l => l.title)
    },
    rand: {
        actionUrlBuilder: (api) => `${api}action=query&format=json&list=random&rnnamespace=0&rnlimit=500`,
        continueGetter: json => json.continue.rncontinue,
        continueBuilder: cont => `&rncontinue=${cont}`,
        dataGetter: json => json.query.random.map(l => l.title)
    }
}

const callWiki = async (callType, title, getAll) => {
    let buildUrl = buildUrlBuilder(callType.actionUrlBuilder, callType.continueBuilder)
    let isMore = true
    let cont = null
    let values = [];
    do {
        let url = buildUrl(title, cont)
        let response = await fetch(url);
        if (!response.ok)
            throw Error(`${url} || ${response.statusText}`)

        let json = await response.json()
        isMore = json.continue != null
        if (isMore) {
            cont = callType.continueGetter(json)
        }
        let currentValues = callType.dataGetter(json)

        values = values.concat(currentValues)
    } while (isMore && getAll)

    return values
}

const buildUrlBuilder = (actionUrlBuilder, continueBuilder) => (title, cont) => {
    let continueString = ''
    if (cont)
        continueString = continueBuilder(cont)

    return actionUrlBuilder(api, title, continueString)
}

const getLinksOnPage = async title => callWiki(callType.links, title, true)
const getBackLinksOnPage = async title => callWiki(callType.backLinks, title, true)
const getLinksHereOnPage = async title => callWiki(callType.linksHere, title, true)
const getRandomPages = async () => callWiki(callType.rand, null, false)

module.exports = {
    getLinksOnPage,
    getBackLinksOnPage,
    getLinksHereOnPage,
    getRandomPages
}