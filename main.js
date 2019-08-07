const { getLinksOnPage, getBackLinksOnPage } = require("./wikiApi.js");

if(process.argv.length <= 2)
{
    console.error("Need a title to search for!")
    return;
}

let pageToLookup = process.argv[2]

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