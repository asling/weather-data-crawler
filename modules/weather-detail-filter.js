const cheerio = require("cheerio");
const fs = require("fs-extra");
const packageJson = require("../package.json");
const fileName = packageJson['fileName'];
const request = require("./request-wrapper");
process.on('exit', function () {
　　setTimeout(function () {
　　　　console.log('This will not run');
　　}, 100);
　　console.log('Bye.');
});

module.exports = function(link,others,errHandler){
	const regLink = link.match(/^https:\/\/([\w\.]+)([\/\w\-]+\/(\d+)\/)weather-forecast/);
	const config = {
		hostname: regLink[1],
		path: `${regLink[2]}november-weather/${regLink[3]}?monyr=${others.month}/1/${others.year}&view=table`
	};
	// const config = {
	// 	'hostname': 'www.accuweather.com',
	// 	'path': '/zh/se/stockholm/314929/november-weather/314929?monyr=1/1/2016&view=table'
	// }
	return request(config,errHandler).then( data => {
		const contentArr = [];
		if(typeof data !== 'string') return false;
		const $ = cheerio.load(data);
		const rows = $(".calendar-list tbody tr");
		rows.each(function(i, elem) {
		  contentArr.push(filter($(this)));
		});

		// console.log(contentArr);
		return contentArr;
		function filter(row){
			const date = row.find("th time").text().split(/\//)[1];
			const result = [others.country,others.city,new Date(`${others.month}/${date}/${others.year}`)]
			// console.log(result);
			const cellResult = {};
			const cells = row.find("td");
			cells.each( function(i,elem){
				let text = $(this).text();
				let regRes;
				if(i === 1){
					regRes = text.match(/\d+/);
					cellResult.rain = {
						value: regRes && regRes[0],
						unit: $(this).find("span").text(),
					};
				}else if(i === 2){
					regRes = text.match(/\d+/);
					cellResult.snow = {
						value: regRes && regRes[0],
						unit: $(this).find("span").text(),
					};
				}else if(i === 4){
					regRes = text.match(/([^°]+)°\/([^°]+)°/);
					cellResult.min = {
						value: regRes && regRes[2],
						unit: 'C'
					};
					cellResult.max = {
						value: regRes && regRes[1],
						unit: 'C'
					};
				}
				
			});
			return result.concat([cellResult.max,cellResult.min,cellResult.rain,cellResult.snow]);
		}	
	});

	
	

}

