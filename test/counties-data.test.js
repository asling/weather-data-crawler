const link = 'https://www.accuweather.com/en/browse-locations/eur';

const countiesData = require('./counties-data');

countiesData(link).then( v => {

	console.log(v);
})