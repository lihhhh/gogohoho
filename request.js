//https GET请求
var getHttps=function(options,data,encode,callback){
	i++;
	if(typeof encode=='function'){
		callback=encode;
		encode='';
	}
	if(typeof data == 'function'){
		callback=data;
		data={};
	};
	//options.headers['Accept']='text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
	//options.headers['Accept-Encoding']='gzip, deflate, sdch, br';
	//options.headers['Accept-Language']='zh-CN,zh;q=0.8';
	if(i==1){
		options.headers['Cache-Control']='max-age=0';
	}
	
	//options.headers['Connection']='keep-alive';
	//options.headers['Host']='kyfw.12306.cn';
	//options.headers['Upgrade-Insecure-Requests']=1;
	//options.headers['User-Agent']='Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36';
	//options.headers['Referer']='https://kyfw.12306.cn/otn/';
	data=querystring.stringify(data);
	options.path+=data!=''?'?'+data:options.path;
	console.log(data);
	https.get(options, function(res){ 
		res.setEncoding(encode); 
		var html='';
	    res.on('data',function(chunk){
	    	html+=chunk;
	    });
	    res.on('end',function(){
	    	if(i==1){
	    		//console.log(res);
	    	}
	    	if(encode=='binary'){
	    		var fileName=new Date().getTime()+'.png';
	    		fs.writeFile('images/'+fileName,html,'binary',function(err,data){
	    			if(err) {
					    console.log(err);
					    return;
					}
					console.log('保存成功!'+fileName);
					getPixels('images/'+fileName, function(err, pixels) {
					  if(err) {
					    console.log("Bad image path")
					    return
					  }
					  console.log(pixels);
					});
	    		})
	    		
	    	}
	    	callback({html:html,cookies:res.headers['set-cookie']});
	    })
	});
};

module.exports={
	getHttps
}