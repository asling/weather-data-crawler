const request = require("../util/request");
const breakpointJson = require("../logs/breakpoint.json");
const path = require.resolve("../logs/breakpoint.json");
const fs = require("fs-extra");
module.exports = function(config,errorHandler){
	const file = errorHandler.file;
	return request(config).catch( err => {
		if(!err.status){
			// console.log('err',err);
			fs.writeJsonSync(path,{
				...err,
				file: file,
				date: new Date().getTime(),
			})
		}
	})
}