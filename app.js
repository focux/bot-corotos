const cheerio = require('cheerio');
const request = require('request');
const beep = require('beepbeep');

const query = "/apple_watch";
const url = "https://www.corotos.com.do/republica_dominicana";
const secondsInterval = 30
const maxPrice = 15000;

let titles;
let prices;
let lastTitle;
let items;

const logTemplate = (title, price) => `TITULO: ${title} PRECIO: ${price}`;

const retrieveItems = () => {
  request(url + query, (error, response, html) => {
    if (error) {
      return console.log('Hay problemas con la conexion.');
    }
    const $ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: true
  });
    const parent = $('.item-info');
    titles = parent.children('h2').map(((i, el) => {
      return $(el).text();
    })).get();
    prices = parent.children('.item-params').children('.price').map((i, el) => {
      return $(el).text().trim().match(/(?<!\S)(?=.)(0|([1-9](\d*|\d{0,2}(,\d{3})*)))?(\.\d*[1-9]$)?(?!\S)/g);
    }).get();
    items = [...titles].map((v, k) => {
      return {
        title: v,
        price: parseInt(prices[k].replace(',', ''))
      }
    });
    if (!lastTitle) {
      items.forEach((v) => console.log(logTemplate(v.title, v.price)));
      lastTitle = items[0].title;
      console.log('---------------------------- UPDATES -----------------------------------');
    } else if (lastTitle !== items[0].title && items[0].price <= maxPrice) {
      console.log(logTemplate(items[0].title, items[0].price));
      lastTitle = items[0].title;
      beep(6);
    }
});
}
retrieveItems();
setInterval(retrieveItems, secondsInterval*1000);