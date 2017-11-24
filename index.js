const chalk = require("chalk");
const fs = require("fs-extra");
const xlsx = require("node-xlsx");
const regionsData = require('./modules/regions-data');
const countiesData = require("./modules/counties-data");
const provincesData = require("./modules/provinces-data");
const citiesData = require("./modules/cities-data");
const getWeatherData = require("./modules/weather-detail-filter");
const packageJson = require("./package.json");
const makeFileName = require("./util/makeFileName");
const breakpointJson = require("./logs/breakpoint.json");
const start = '1/1/2016';
const end = '12/1/2017';
const fileHeader = ['国家','城市','日期','最高温','最低温','降水','雪'];
const fileName = packageJson['fileName'] + makeFileName();
const {
	connect,
	findDocuments,
	findDocByQuery,
	insertDocuments,
	removeDocument,
	updateDocument,
} = require('./db/mongo');

const dbName = 'weatherProject';
const collectionName = 'weathers';
const feedbackCollection = 'feedbacks';

function dateFormat(date){
	return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
}

function* checkFeedback(dbObj,collectionName,queryObj){
	let feedbackInDb = yield findDocByQuery(dbObj,collectionName,queryObj); //{symbol: rawData.symbol}
    let dateTime = new Date().getTime();
    console.log("dateTime",dateTime);
    let feedbackStatus,updateStatus = false;
    if(!feedbackInDb.findByQueryDocs || feedbackInDb.findByQueryDocs.length <= 0){
      feedbackStatus = true;
    }else{
          if(feedbackInDb.findByQueryDocs[0] && parseInt(dateTime) > parseInt(feedbackInDb.findByQueryDocs[0]['date_added'])){
            feedbackStatus = true;
            updateStatus = true;
          }else{
            feedbackStatus = false;
          }
    }
    return {
    	feedbackStatus,
    	updateStatus,
    	dateTime,
    };
}

function* gen(){
	// const regions = yield  regionsData();
	const country = {
		country_url: 'https://www.accuweather.com/en/browse-locations/eur/fr',
		country_name: 'france',
	}
	// console.log('counties',JSON.stringify(counties));
	const provinces = yield provincesData(country.country_url);
	console.log('provinces',JSON.stringify(provinces));
	const dbObj =  yield connect(dbName);
	console.log('dbObj',JSON.stringify(dbObj));
				if(provinces && provinces.length > 0){
					for(let province of provinces){
						let provinceFeedback = yield checkFeedback(dbObj,feedbackCollection,{type:'province',name:province});
						if(provinceFeedback.feedbackStatus){

							const cities = yield citiesData(province);
							// console.log("cities",JSON.stringify(cities));
							if(cities && cities.length > 0){
								for(let city of cities){

									let cityFeedback = yield checkFeedback(dbObj,feedbackCollection,{type: 'city',name:city});
									if(cityFeedback.feedbackStatus){

										let nowDate = new Date(start);
										while(dateFormat(nowDate) !== end){
											const data = {
												year: nowDate.getFullYear(),
												month: nowDate.getMonth()+1,
												country: country.country_name,
												city: city.city_name,
											};
											/*
												[contury,city,date,max,min,rain,snow];
											*/
											const weathers = yield getWeatherData(city.city_url,data);
											// console.log('weathers',JSON.stringify(weathers));
											// writeFile(weathers);

											const recordInDb = yield findDocByQuery(dbObj,collectionName,{country:data.country,province,city:data.city});

											if(!recordInDb || recordInDb.findByQueryDocs.length < 0){
												let insertResult = yield insertDocuments(dbObj,collectionName,{
													country: data.country,
													city: data.city,
													province,
													date: weathers[2],
													min: weathers[4],
													max: weathers[3],
													rain: weathers[5],
													snow: weathers[6],
												});
												console.log('added');
											}else{
												console.log("skip");
											}
											// console.log(weathers);
											while(nowDate.getMonth()+1 <= data.month && nowDate.getFullYear() <= data.year){
												nowDate = new Date(nowDate.getTime() + 24*3600000);
											}
										}

										if(cityFeedback.updateStatus){
											let updateResult = yield updateDocument(dbObj,feedbackCollection,{type:'city',name:city},{
												name:city,
												type: 'city',
												msg: 'updated',
												date_added: new Date().getTime(),
											});
											console.log(chalk.blue(`updated complete ${city}`));
										}else{
											let insertResult = yield insertDocuments(dbObj,feedbackCollection,{
												name:city,
												type: 'city',
												msg: 'added',
												date_added: new Date().getTime(),
											});
											console.log(chalk.blue(`added complete ${city}`));
										}

									}

									
									
								}

								if(provinceFeedback.updateStatus){
									let updateResult = yield updateDocument(dbObj,feedbackCollection,{type:'province',name:province},{
										name:province,
										type: 'province',
										msg: 'updated',
										date_added: new Date().getTime(),
									});
									console.log(chalk.blue(`updated complete ${province}`));
								}else{
									let insertResult = yield insertDocuments(dbObj,feedbackCollection,{
										name:province,
										type: 'province',
										msg: 'added',
										date_added: new Date().getTime(),
									});
									console.log(chalk.blue(`added complete ${province}`));
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

