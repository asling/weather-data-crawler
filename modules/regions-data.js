const request = require("./request-wrapper");
// const config = {
// 	'hostname': 'www.accuweather.com',
// 	'path': '/en/browse-locations',
// }
const cheerio = require("cheerio");
module.exports = function(config,errHandler){
	return request(config,errHandler).then( v => {
		const contentArr = [];
		if(typeof v !== 'string') return false;
		const $ = cheerio.load(v);
		const rows = $("#panel-main .drilldown");
		rows.each(function(i, elem) {
		  contentArr.push($(this).attr("data-href"));
		});
		return contentArr;
	});
}