const chalk = require("chalk");
const fs = require("fs-extra");
const xlsx = require("node-xlsx");
const regionsData = require('./modules/regions-data');
const countiesData = require("./modules/counties-data");
const provincesData = require("./modules/provinces-data");
const citiesData = require("./modules/cities-data");
const weatherData = require("./modules/weather-detail-filter");
const packageJson = require("./package.json");
const makeFileName = require("./util/makeFileName");
const breakpointJson = require("./logs/breakpoint.json");
const start = '1/1/2016';
const end = '12/1/2017';
const fileHeader = ['国家','城市','日期','最高温','最低温','降水','雪'];
const fileName = packageJson['fileName'] + makeFileName();
function writeFile(row){
	let filePath = breakpointJson && breakpointJson["file"] ? breakpointJson["file"] : fileName + '.xlsx';
	fs.ensureFileSync(filePath);
	// console.log("filePath",filePath);
	let file = xlsx.parse(filePath);
	let fileData = file && file[0] && file[0].data;
	// console.log(file);
	const rowsAfter = row.map( v => {
		return [
			v[0],
			v[1],
			v[2],
			v[3]['value']+v[3]['unit'],
			v[4]['value']+v[4]['unit'],
			v[5]['value']+v[5]['unit'],
			v[6]['value']+v[6]['unit'],
		]
	});
	if(fileData && fileData.length > 0){
		fileData = [
			...fileData,
			...rowsAfter,
		];
	}else{
		fileData = [
			fileHeader,
			...rowsAfter,
		]
	}
	const buffer = xlsx.build([{name: "weathers", data: fileData}]);
	fs.writeFileSync(filePath, buffer, 'binary');
}

function dateFormat(date){
	return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
}

function* gen(){
	// const regions = yield  regionsData();
	const country = {
		country_url: 'https://www.accuweather.com/en/browse-locations/eur/fr',
		country_name: 'france',
	}
	// console.log('counties',JSON.stringify(counties));
	const provinces = yield provincesData(country.country_url,{file:fileName});
				// console.log('provinces',JSON.stringify(provinces));
				if(provinces && provinces.length > 0){
					for(let province of provinces){
						const cities = yield citiesData(province,{file:fileName});
						// console.log("cities",JSON.stringify(cities));
						if(cities && cities.length > 0){
							for(let city of cities){
								let nowDate = new Date(start);
								while(dateFormat(nowDate) !== end){
									const data = {
										year: nowDate.getFullYear(),
										month: nowDate.getMonth()+1,
										country: country.country_name,
										city: city.city_name,
									};
									const weathers = yield weatherData(city.city_url,data,{file:fileName});
									// console.log('weathers',JSON.stringify(weathers));
									writeFile(weathers);
									// console.log(weathers);
									while(nowDate.getMonth()+1 <= data.month && nowDate.getFullYear() <= data.year){
										nowDate = new Date(nowDate.getTime() + 24*3600000);
									}
								}
								
							}
						}
				}
			}
	

	
} 

const output = [];
// const gen = arr[Symbol.iterator](); 

function run(gen){
	var g = gen();

	function next(result){
		const {value, done} = g.next(result);
		if(done){
			console.log(chalk.cyan(output));
			return value;
		}
		if(value instanceof Promise){
			value.then( v => {
				next(v);
			});
		}else{
			next(value);
		}
	}
	next();
}

run(gen);

