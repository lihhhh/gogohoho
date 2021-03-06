//var request=require('superagent');
var querystring = require('querystring');
var cookie = require('cookie');
var config = require('./city');
var users = require('./users');
var db=require('./db');
var cookieParser = require('cookie-parser');
var express = require('express');
var request = require('request');
var app = express();
var https = require('https');
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ca = fs.readFileSync(__dirname + '/srca.cer.pem');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// io.on('error', function(exc) {
//     console.log("ignoring exception: 1111111111" + exc);
// });
// io.on('connection', function(socket) {
//     socket.on('error', function(exc) {
//         console.log("ignoring exception: 1111111111" + exc);
//     });
//     socket.on('msg', function(obj) {
//         var cookies = cookie.parse(obj.cookies);
//         if (cookies == {} || !cookies.userName) {
//             io.emit('msg', '请重新登录');
//         } else {
//             var finddata = { userName: cookies.userName, JSESSIONID: cookies.JSESSIONID };
//             var updata = {
//                 start_city: obj.model.start_city,
//                 start_date: obj.model.start_date,
//                 end_city: obj.model.end_city,
//                 seat_types: obj.model.seat_types
//             };
//             db.find(finddata).then(function(_d) {
//                 return Promise.resolve(_d);
//             }).then(function(_d) {
//                 if (_d.length >= 1) {
//                     db.update(finddata, updata).then(function(__d) {
//                         console.log(__d);
//                     });
//                 };
//             });
//         };
//     });
// });


/*设置静态文件服务*/
app.use(express.static(__dirname + '/public'));

/*设置cookie中间件*/
app.use(cookieParser());
//https GET请求
function getHttps(options, data, encode) {
    data = data || {};
    encode = encode || '';
    data = querystring.stringify(data);
    options.path += data != '' ? '?' + data : '';
    var promise = new Promise(function(resolve, reject) {
        https.get(options, function(res) {
            res.setEncoding(encode);
            var html = '';
            res.on('data', function(chunk) {
                html += chunk;
            });
            res.on('end', function() {
                return resolve({ html: html, cookies: res.headers['set-cookie'] });
            });
            res.on('error', function(err) {
                console.log(err);
            });
        });
    });
    return promise;
};

function httpReq(options, data) {
	var promise = new Promise(function(resolve, reject) {
        var req = https.request(options, function(res) {
	        var chunks = [];
	        res.on('data', function(chunk) {
	            chunks.push(chunk);
	        })
	        res.on('end', function() {
	            //console.log(Buffer.concat(chunks).toString());
	            resolve(Buffer.concat(chunks).toString());
	        })
	    });
	    req.on('error', function(err) {
	        console.log(err);
	    })
	    req.write(JSON.stringify(data));
	    req.end();
    });
    return promise;
}

/*首页*/
app.get('/', function(req, res) {
    console.log('等待12306返回数据...');
    if(req.cookies.JSESSIONID){
    	res.sendfile('index.html');
    }else{
    	https.get('https://kyfw.12306.cn/otn/login/init', function(ress) {
	        var html = '';
	        ress.on('data', function(chunk) {
	            html += chunk;
	        });
	        ress.on('end', function() {
	            console.log('成功接收数据');
	            var str = ress.headers['set-cookie'].join(';');
	            var ck = cookie.parse(str);
	            res.cookie('BIGipServerotn', ck.BIGipServerotn);
	            debugger
	            res.cookie('JSESSIONID', ck.JSESSIONID);
	            res.sendfile('index.html');
	        });
	    });
    }
    
});
app.get('/main', function(req, res) {
    res.send();
});
/*验证码验证*/
app.get('/loginUp', function(req, res) {
    var params = req.query;
    var ck = cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    ck += ';' + cookie.serialize('_passport_session', req.cookies._passport_session);
    ck += ';' + cookie.serialize('_passport_ct', req.cookies._passport_ct);
    var data = {
        answer: params.code,
        rand: 'sjrand',
        login_site: 'E'
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/passport/captcha/captcha-check',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': ck
        },
        method:'POST',
        ca: [ca]
    };
    getHttps(options, data).then(function(_d) {
    	var result = JSON.parse(_d.html);
    	console.log(result);
    	/*返回验证码验证结果*/
        res.send({ success: true, msg: result });
    })
    // httpReq(options, data).then(function(_d) {
    	
    //     /*返回验证码验证结果*/
    //     res.send({ success: true, msg: JSON.parse(_d.html) });
    // });
});
/*登录验证*/
app.post('/verificationUser', function(req, res) {
    var params = req.query;
    var ck = cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    ck += ';' + cookie.serialize('_passport_session', req.cookies._passport_session);
    ck += ';' + cookie.serialize('_passport_ct', req.cookies._passport_ct);
    var data = {
        "username": params.userName,
        "password": params.password,
        appid: 'otn'
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/passport/web/login',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': ck
        },
        ca: [ca]
    };
    getHttps(options, data).then(function(_d) {
    	var  result = JSON.parse(_d.html);
        if (result.result_code==0) {
        	// 获取newapptk   查看联系人需要传tk
        	options.path = '/passport/web/auth/uamtk';
        	var str = _d.cookies.join(';');
            var cks = cookie.parse(str);
        	ck = 'uamtk=' + cks.uamtk;
        	options.headers.Cookie = ck;
        	getHttps(options,{}).then(function(_d){
        		db.find({ JSESSIONID: req.cookies.JSESSIONID }).then(function(__d) {
	                if (__d.length < 1) {
	                    var savedata = {
	                        'JSESSIONID': req.cookies.JSESSIONID,
	                        'BIGipServerotn': req.cookies.BIGipServerotn,
	                        'userName': params.userName,
	                        'password': params.password
	                    };
	                    db.save(savedata).then(function(_d) {
	                        console.log(_d);
	                    });
	                } else {}
	                res.cookie('userName', params.userName);
	                res.send({success:true,data:result});
	            });
        	});
        };

    });
});
/*获取联系人*/
app.get('/getPassengers', function(req, res) {
    var ck = cookie.serialize('JSESSIONID', req.cookies.JSESSIONID);
    ck += ';' + cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    var data = {
        _json_att: ''
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/passengers/init',
        headers: {
        	'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: ck,
            Referer:"https://kyfw.12306.cn/otn/index/initMy12306"
        },
        ca: [ca]
    };

    httpReq(options, data).then(function(_d) {
        if (_d.html) {
            var data = _d.html.match(/\[{'passenger_type_name(.*);/)[0];
            res.send({ success: true, data: data });
        } else {
            res.send({ success: false, data: [] });
        }
    });
})
/*获取验证码*/
app.get('/getImage', function(req, res) {
    // res.writeHead(200, { "Content-type": 'image/jpeg' });
    var ck = cookie.serialize('JSESSIONID', req.cookies.JSESSIONID);
    ck += ';' + cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    var data = {
        module: 'login',
        rand: 'sjrand',
        '': Math.random() * 1
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/passport/captcha/captcha-image',
        ca: [ca],
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': ck + ';current_captcha_type=Z;'
        },
        //rejectUnauthorized: false  // 忽略安全警告
    };
    getHttps(options, data, 'binary').then(function(_d) {
    	var str = _d.cookies.join(';');
        var ck = cookie.parse(str);
        res.cookie('_passport_ct', ck._passport_ct);
        res.cookie('_passport_session', ck._passport_session)
        .end(_d.html, 'binary');
    });
});
/*获取车次信息*/
app.get('/getData', function(req, res) {
    var data = req.query;
    var ck = cookie.serialize('JSESSIONID', req.cookies.JSESSIONID);
    ck += ';' + cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    var data = {
        "leftTicketDTO.train_date": data.start_date,
        "leftTicketDTO.from_station": config.city[data.start_city],
        "leftTicketDTO.to_station": config.city[data.end_city],
        "purpose_codes": "ADULT"
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/leftTicket/queryZ',
        headers: {
            Cookie: ck + ';current_captcha_type=Z;'
        },
        ca: [ca]
    };
    console.log('请求车次信息,等待12306返回数据');
    getHttps(options, data).then(function(_d) {
        console.log('接收到返回数据');
        res.send(_d.html);
    });
});

app.get('/goPiao', function(req, res) {
    var data = req.query;
});

http.listen(8089, function() {
    console.log('---------------------');
})