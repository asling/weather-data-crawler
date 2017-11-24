const wrapper = require("../modules/request-wrapper");
const config = {
		hostname: 'www.abc.cs',
		path: '/index.html'
	};
wrapper(config).then((v) => {
	console.log(v);
});