
const detailFilter = require("./weather-detail-filter");
detailFilter('https://www.accuweather.com/en/xk/bajgora/1569471/weather-forecast/1569471',{country:'china',city:'guangzhou',year:'2016',month:'1'}).then( v => {
	console.log(v);
});

