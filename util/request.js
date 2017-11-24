const https = require("https");
const iconv = require('iconv-lite'); 
const BufferHelper = require('bufferhelper');

/*
	&config: {
		'hostname': String,
		'path':  String,
	}
*/

module.exports = function(config) {

	function checkStatus(response) {
		// console.log('statusCode',response.statusCode);
		if (response.statusCode >= 200 && response.statusCode < 300) {
		    return true;
		}else{
		  	return false;
		}
	}

	return new Promise( (resolve,reject) => {
		const req = https.request(config, (res) => {
		 	var bufferhelper = new BufferHelper();
		 	if(checkStatus(res)){
		 		res.on('data', function (chunk) { 
			 		// console.log('BODY: ' + chunk); 
			 		bufferhelper.concat(chunk);
				});
				res.on("end", function(){
					resolve(iconv.decode(bufferhelper.toBuffer(),'UTF8'))
				});
		 	}else{
		 		// console.log(1111);
		 		reject(res.statusMessage);
		 	}
		 	
		});

		req.setTimeout(20000, () =>{
			const error = {
				status: false,
				type: 'timeout',
				msg: 'timeout',
			};
			reject(error);

		} )

		req.on('error', function(e) {
			const error = {
				status: false,
				type: 'error',
				msg: e.message,
			};
			reject(error);
		}); 

		req.end();  

		
	});
}
