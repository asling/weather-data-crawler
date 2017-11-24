const cheerio = require("cheerio");
const request = require("../util/request");

module.exports = function(link,errHandler){

	const regLink = link.match(/^https:\/\/([\w\.]+)([\/\w\-]+)/);
	const config = {
		hostname: regLink[1],
		path: regLink[2]
	};
	return request(config,errHandler).then( v => {
		const contentArr = [];
		if(typeof v !== 'string') return false;
		const $ = cheerio.load(v);
		const rows = $("#panel-main .drilldown");
		rows.each(function(i, elem) {
		  contentArr.push($(this).attr("data-href"));
		});
		return contentArr;
	}).catch(e => {
		console.log(e);
	});	


}

