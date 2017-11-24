const start = '1/1/2016';
const end = '12/1/2017';

								while(dateFormat(nowDate) !== end){
									const data = {
										year: nowDate.getFullYear(),
										month: nowDate.getMonth()+1,
									};
									while(nowDate.getMonth()+1 <= data.month && nowDate.getFullYear() <= data.year){
										nowDate = new Date(nowDate.getTime() + 24*3600000);
									}
									console.log(dateFormat(nowDate));
								}
function dateFormat(date){
	return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
}