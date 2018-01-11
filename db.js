var mongoose=require('mongoose');

var db = mongoose.createConnection('47.97.161.209','12306');
var dbData=db.model('users',{
	JSESSIONID:String,
	BIGipServerotn:String,
	userName:String,
	password:String,
	name:String,
	ip:String,
	loginDate:Date,
	start_city:String,
	start_date:String,
	end_city:String,
	seat_types:Object
});

function find(data){
	console.log('data------------------->'+data);
	
	var promise=new Promise(function(resolve,reject){
		dbData.find(data,function(err,data){
			if(err){
				console.log(err);
				return reject(err);
			}
			return resolve(data);
		});
	});

	return promise;
}
function save(data){
	console.log({'savedata':data});
	var _data=new dbData(data);
	var promise=new Promise(function(resolve,reject){
		_data.save(function(err,data){
			if(err){
				console.log(err);
				return reject(err);
			}
			return resolve(data);
		});
	});
	
	return promise;
}
function update(finddata,data){
	var promise=new Promise(function(resolve,reject){
		dbData.update(finddata,{$set:data},function(err,data){
			if(err){
				console.log(err);
				return reject(err);
			}
			return resolve(data);
		});
	});
	
	return promise;
}
module.exports={
	save:save,
	find:find,
	update:update
}