const link = 'https://www.accuweather.com/en/browse-locations/eur/xk';

const citiesData = require('./cities-data');

citiesData(link).then( v => {

	console.log(v);
})