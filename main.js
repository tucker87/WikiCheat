const { getLinksOnPage, getBackLinksOnPage, getLinksHereOnPage, getRandomPages } = require("./wikiApi.js")
const { validateInput } = require('./utils.js')

let command = process.argv[2]

let pageToLookup = process.argv[3]

switch (command) {
    case "full":
        getLinksOnPage(pageToLookup).then(async links => {
            let results = []
            let errors = []
            console.log(links.length)

            while (links.length > 0) {
                let set = links.splice(0, Math.min(links.length, 250))
                console.log(`Starting set ${set[0]}`)
                var calls = set.map(async link => {
                    try {
                        const linkLinks = await getLinksOnPage(link);
                        const linkBackLinks = await getBackLinksOnPage(link);

                        results.push({ title: link, count: linkLinks.length, backLinks: linkBackLinks.length });
                    }
                    catch (e) {
                        console.error(`${link} failed`);
                        errors.push(e);
                    }
                })
                await Promise.all(calls)
            }

            console.log('done!')
            console.log(errors)
            let filteredResults = results
                .filter(r => r.count < 500)
                .sort((a, b) => b.count - a.count)

            console.table(filteredResults)
        })
        break;
    case "links":
        validateInput(pageToLookup)
        getLinksOnPage(pageToLookup).then(links => console.log(links.length))
        break;
    case "backLinks":
        validateInput(pageToLookup)
        getBackLinksOnPage(pageToLookup).then(bl => console.log(bl.length))
        break;
    case "linksHere":
        validateInput(pageToLookup)
        getLinksHereOnPage(pageToLookup).then(lh => console.log(lh.count))
        break;
    case "rand":
        getRandomPages().then(async links => {
            let linkData = []
            let tasks = links.map(async link => {
                let links = await getLinksOnPage(link)
                linkData.push({ link, linkCount: links.length })
            })
            await Promise.all(tasks)
            console.table(linkData.sort((a, b) => a.linkCount - b.linkCount))
        })
        break;
    default:
        console.warn("WAT?")
}