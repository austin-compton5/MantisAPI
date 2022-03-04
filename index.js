const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const Nightmare = require('nightmare')
const nightmare = Nightmare({show: true})
const jquery = require('jquery');
const { empty } = require('cheerio/lib/api/manipulation');
const puppeteer = require('puppeteer')

const PORT = process.env.PORT || 4000 
const app = express()

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

let projects = []

let solanaLinks = []
let solanaProjects = []

async function puppeteerScrape(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://rarity.tools/upcoming/", {waitUntil: 'domcontentloaded'})
    const scrape =  page.evaluate(() => {
        let searchedLinks = []
        let searchedItems = []
        const results =  document.querySelectorAll('.text-lg')
        const anchorTags = document.querySelectorAll('td.block.float-left')

        results.forEach(function(result) {
            let row = {
                'title':result.innerText,
                'platform': 'Eth'
                }
                searchedItems.push(row);
            });

            anchorTags.forEach(function(tag){
                let result = []
                let children = tag.childNodes
                children.forEach(child => {
                    if(child.href){
                        result.push(child.href)
                    }
                })
                searchedLinks.push(result)
            })

            for(i=0; i<searchedItems.length; i++){
                searchedItems[i]["links"] = searchedLinks[i]
            }

            return searchedItems
    })
    .then(data => {
        projects = data 
        console.log(data)
    }).catch(function(e){
        console.log(e)
    })
    await browser.close()

    getSolanaNfts()

    res.json(projects.slice(0, 25).concat(solanaProjects.slice(0, 25)))
}
function getSolanaNfts(){
    
   axios.get('https://howrare.is/drops')
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            $('a > span', html).each(function(){
                const title = $(this).text().replace(/\s+/g, "")
                solanaProjects.push({title})
            })

        }).catch(err => {
            console.log(err)
        })


    axios.get('https://howrare.is/drops')
        .then((response) => {

            const html = response.data
            const $ = cheerio.load(html)

        $('div.all_coll_col.drop_links').each(function(i, el){

           let alltagsForDiv = []

           $(el).find('a').each(function(i, el){
                let href = $(el).attr('href')
                alltagsForDiv.push(href)
            })

            solanaLinks.push(alltagsForDiv)
         })
        })

        for(i=0; i<solanaProjects.length; i++){
            
            solanaProjects[i]['links'] = solanaLinks[i]
            solanaProjects[i]['platform'] = 'solana' 

        }

        return solanaProjects
}

// app.get('/', (req, res) => {

//  nightmare
//     .goto('https://rarity.tools/upcoming/')
//     .wait(2000)
//     .evaluate(function() {
//             let searchedLinks = []
//             let searchedItems = []
//             const results =  document.querySelectorAll('.text-lg')
//             const anchorTags = document.querySelectorAll('td.block.float-left')

//             results.forEach(function(result) {
//                 let row = {
//                     'title':result.innerText,
//                     'platform': 'Eth'
//                     }
//                     searchedItems.push(row);
//                 });

//             anchorTags.forEach(function(tag){
//                 let result = []
//                 let children = tag.childNodes
//                 children.forEach(child => {
//                     if(child.href){
//                         result.push(child.href)
//                     }
//                 })
//                 searchedLinks.push(result)
//             })

//             for(i=0; i<searchedItems.length; i++){
//                 searchedItems[i]["links"] = searchedLinks[i]
//             }

//            return searchedItems

//         })
//         .end()
//         .then(data => {   
//               projects = data
//         })
//         .catch(function(e){
//             console.log(e);
//         });

//         getSolanaNfts()

//      res.json(projects.slice(0, 25).concat(solanaProjects.slice(0, 25)))
// })  


app.get('/solana', (req, res) => {

    axios.get('https://howrare.is/drops')
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            $('a > span', html).each(function(){
                const title = $(this).text().replace(/\s+/g, "")
                solanaProjects.push({title})
            })

        }).catch(err => {
            console.log(err)
        })


    axios.get('https://howrare.is/drops')
        .then((response) => {

            const html = response.data
            const $ = cheerio.load(html)

        $('div.all_coll_col.drop_links').each(function(i, el){

           let alltagsForDiv = []

           $(el).find('a').each(function(i, el){
                let href = $(el).attr('href')
                alltagsForDiv.push(href)
            })

            solanaLinks.push(alltagsForDiv)
         })
        })

        for(i=0; i<solanaProjects.length; i++){
            
            solanaProjects[i]['links'] = solanaLinks[i]
            solanaProjects[i]['platform'] = 'solana' 

        }


        res.json(solanaProjects)
})

app.get('/', async (req, res) => {
    const browser = await puppeteer.launch({'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })
    const page = await browser.newPage()
    await page.goto("https://rarity.tools/upcoming/", {waitUntil: 'domcontentloaded'})
    await page.waitForSelector('.text-lg')
    const scrape =  page.evaluate(() => {
        let searchedLinks = []
        let searchedItems = []
        const results =  document.querySelectorAll('.text-lg')
        const anchorTags = document.querySelectorAll('td.block.float-left')
        console.log(results)
        results.forEach(function(result) {
            let row = {
                'title':result.innerText,
                'platform': 'Eth'
                }
                searchedItems.push(row);
            });

            anchorTags.forEach(function(tag){
                let result = []
                let children = tag.childNodes
                children.forEach(child => {
                    if(child.href){
                        result.push(child.href)
                    }
                })
                searchedLinks.push(result)
            })

            for(i=0; i<searchedItems.length; i++){
                searchedItems[i]["links"] = searchedLinks[i]
            }

            return searchedItems
    })
    .then(data => {
        projects = data 
        console.log(data)
    }).catch(function(e){
        console.log(e)
    })
    await browser.close()

    getSolanaNfts()

    res.json(projects.slice(0, 25).concat(solanaProjects.slice(0, 25)))
})

app.listen(PORT, console.log(`running on port ${PORT}`))






