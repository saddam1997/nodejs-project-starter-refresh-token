
let axios = require('axios').default;
// const cheerio = require('cheerio');
var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');


temp = async () => {

    let webdata = await axios.get('https://news.ycombinator.com/news');
    // console.log("webdata  ", webdata.data);
    const $ = cheerio.load(webdata.data);
    // let tempdata=cheerio.text($('tbody'));
    // $("body > center > table > tbody > tr > td > table > tbody").
    $(".title").
    each((index, element) => {
        console.log($(element).text());
      });



// first logic
   /*  let tempdata = cheerio.text($('.itemlist'));
    let items = tempdata.split('\n');
    items.forEach((e) => {
        if (e) {
            console.log(e.replace(/(\s+)/g, ' '));
        }
    }); */


// Second Logic

    /* cheerioTableparser($);
    var data = $(".itemlist").parsetable(true, true, true);
    console.log("data", data); */
    // let items = data.split(' ');
    // console.log("datadatadata", items);

}

temp();