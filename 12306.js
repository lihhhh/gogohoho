//var request=require('superagent');
var querystring = require('querystring');
var cookie = require('cookie');
var config = require('./city');
var users = require('./users');
// var db = require('./db');
var cookieParser = require('cookie-parser');
var express = require('express');
var request = require('request');
var app = express();
var https = require('https');
var _http = require('http');
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ca = fs.readFileSync(__dirname + '/srca.cer.pem');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

io.on('error', function(exc) {
    console.log("ignoring exception: 1111111111" + exc);
});
io.on('connection', function(socket) {
    socket.on('error', function(exc) {
        console.log("ignoring exception: 1111111111" + exc);
    });
    socket.on('goP', function(obj) {
        // /otn/leftTicket/submitOrderRequest
        
    })
    socket.on('msg', function(obj) {
        console.log('收到抢票请求');
        var data = obj.model;
        var cookies = cookie.parse(obj.cookies);
        var ck = cookie.serialize('JSESSIONID', cookies.JSESSIONID);
        ck += ';' + cookie.serialize('BIGipServerotn', cookies.BIGipServerotn);
        // ck += ';' + cookie.serialize('tk', req.cookies.newapptk);
        var data = {
            "leftTicketDTO.train_date": data.start_date,
            "leftTicketDTO.from_station": config.city[data.start_city],
            "leftTicketDTO.to_station": config.city[data.end_city],
            "purpose_codes": "ADULT"
        };
        var options = {
            hostname: 'kyfw.12306.cn',
            path: '/otn/leftTicket/queryO',
            headers: {
                Cookie: ck,
                Referer: "https://kyfw.12306.cn/otn/leftTicket/init"
            },
            ca: [ca]
        };
        console.log('请求车次信息,等待12306返回数据');;
        getHttps(options, data).then(function(_d) {
            // console.log(_d);
            var result;
            if (_d.html) {
                result = JSON.parse(_d.html);
            }
            if (result && result.data && result.data.result) {
                result.data.result = result.data.result.map(function(item) {
                    var arr = item.split('|');
                    arr = arr.map(function(_item) {
                        if (result.data.map[_item]) {
                            return result.data.map[_item];
                        } else {
                            return _item;
                        }
                    })
                    return arr;
                })
            }
            socket.emit('data', { success: true, data: result });
        });
    });
});


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
    if(!encode){
        options.headers["Cache-Control"]= 'no-cache';
        options.headers["Origin"]= 'https://kyfw.12306.cn';
        options.headers["User-Agent"]= 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36';
        options.headers["Content-Type"]= 'application/x-www-form-urlencoded; charset=UTF-8';
    }
    
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
            res.on('data', function(a) {
                chunks.push(a);
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
    if (req.cookies.JSESSIONID) {
        res.sendfile('index.html');
    } else {
        https.get('https://kyfw.12306.cn/otn/login/init', function(ress) {
            var html = '';
            ress.on('data', function(chunk) {
                html += chunk;
            });
            ress.on('end', function() {
                console.log('成功接收数据');
                setCookie(res,ress.headers['set-cookie']);
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
        method: 'POST',
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

// 下订单
app.get('/otnConfirmPassengerConfirmSingleForQueue',function(req,res){
    var ck = req.headers.cookie;
    var params = req.query;
    var model = JSON.parse(params.model);
    var passengers = JSON.parse(params.passengers);
    var seat = JSON.parse(params.seat);

    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/confirmPassenger/getQueueCount',
        headers: {
            Cookie: ck + ';current_captcha_type=Z;_jc_save_wfdc_flag=dc;'
        },
        ca: [ca]
    };
    var data = {
        passengerTicketStr:seat.code + ',0,1,' + passengers.passenger_name + ',' + passengers.passenger_id_type_code + ',' + passengers.passenger_id_no + ',' + passengers.mobile_no + ',N',
        oldPassengerStr:passengers.passenger_name + ',' + passengers.passenger_id_type_code + ',' + passengers.passenger_id_no + ',1_',
        randCode:'',
        purpose_codes:'00',
        key_check_isChange:params.key_check_isChange,
        leftTicketStr:params.data[12],
        train_location:params.data[15],
        choose_seats:'',
        seatDetailType:'000',
        whatsSelect:1,
        roomType:'00',
        dwAll:'N',
        _json_att:'',
        REPEAT_SUBMIT_TOKEN:params.REPEAT_SUBMIT_TOKEN
    };
    getHttps(options,data).then(function(_d){
        setCookie(res,_d.cookies);
        if(_d.html){
            result = JSON.parse(_d.html);
        }
        res.send({ success: true, data:result, lastParams:params });
    })
})

app.get('/otnConfirmPassengerGetQueueCount',function(req,res){
    var ck = req.headers.cookie;
    var params = req.query;
    var model = JSON.parse(params.model);
    var passengers = JSON.parse(params.passengers);
    var seat = JSON.parse(params.seat);

    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/confirmPassenger/getQueueCount',
        headers: {
            Cookie: ck + ';current_captcha_type=Z;_jc_save_wfdc_flag=dc;'
        },
        ca: [ca]
    };
    var data = {
        train_date:new Date(model.start_date).toString(),
        train_no:params.data[2],
        stationTrainCode:params.data[3],
        seatType:seat.code,
        fromStationTelecode:config.city[model.start_city],
        toStationTelecode:config.city[model.end_city],
        leftTicket:params.data[12],
        purpose_codes:'00',
        train_location:params.data[15],
        _json_att:'',
        REPEAT_SUBMIT_TOKEN:params.REPEAT_SUBMIT_TOKEN
    };
    getHttps(options,data).then(function(_d){
        setCookie(res,_d.cookies);
        if(_d.html){
            result = JSON.parse(_d.html);
        }
        res.send({ success: true, data:result, lastParams:params });
    })
})

app.get('/otnConfirmPassengerCheckOrderInfo',function(req,res){
    var ck = req.headers.cookie;
    var params = req.query;
    var model = JSON.parse(params.model);
    var passengers = JSON.parse(params.passengers);
    var seat = JSON.parse(params.seat);

    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/confirmPassenger/checkOrderInfo',
        headers: {
            Cookie: ck + ';current_captcha_type=Z;_jc_save_wfdc_flag=dc;',
            Referer: "https://kyfw.12306.cn/otn/confirmPassenger/initDc"
        },
        ca: [ca]
    };
    var data = {
        cancel_flag: '2',
        bed_level_order_num: '000000000000000000000000000000',
        passengerTicketStr: seat.code + ',0,1,' + passengers.passenger_name + ',' + passengers.passenger_id_type_code + ',' + passengers.passenger_id_no + ',' + passengers.mobile_no + ',N',
        oldPassengerStr: passengers.passenger_name + ',' + passengers.passenger_id_type_code + ',' + passengers.passenger_id_no + ',1_',
        tour_flag: 'dc',
        randCode: '',
        whatsSelect: '1',
        _json_att: '',
        REPEAT_SUBMIT_TOKEN: params.REPEAT_SUBMIT_TOKEN
    };
    getHttps(options, data).then(function(_d) {
        var result;
        setCookie(res,_d.cookies);
        if(_d.html){
            result = JSON.parse(_d.html);
        }
        res.send({ success: true, data:result, lastParams:params });
    })
})

/*获取REPEAT_SUBMIT_TOKEN*/
app.get('/otnConfirmPassengerInitDc',function(req,res){
        var ck = req.headers.cookie;
        var params = req.query;
        var model = JSON.parse(params.model);
        var passengers = JSON.parse(params.passengers);
        var seat = JSON.parse(params.seat);
        var options = {
            hostname: 'kyfw.12306.cn',
            path: '/otn/confirmPassenger/initDc',
            headers: {
                Cookie: ck+';current_captcha_type=Z;_jc_save_wfdc_flag=dc;'
            },
            ca: [ca]
        };
        getHttps(options, {}).then(function(_d) {
            // console.log(_d);
            var result;
            var reg = /CDATA\[\*\/([\s\S]*?)\/\*\]\]/gm;
            var regIs = /key_check_isChange'.*?'(.*?)',/;
            if (_d.html) {
                var arr = reg.exec(_d.html);
                var str = arr ? arr[1] : '';
                var isCarr = regIs.exec(_d.html);
                var key_check_isChange = isCarr ? isCarr[1] : '';
                setCookie(res,_d.cookies);
                if (str) {
                    var spt = {};
                    str = str.replace(/var /g, 'spt.');
                    eval(str);
                    // globalRepeatSubmitToken
                    var REPEAT_SUBMIT_TOKEN = spt.globalRepeatSubmitToken;
                    params.REPEAT_SUBMIT_TOKEN = REPEAT_SUBMIT_TOKEN;
                    params.key_check_isChange = key_check_isChange;
                    res.send({ success: true, lastParams:params });
                }
            } else {
                // 检查登陆状态
            }
            // socket.emit('data', { success: true, data: result });
        });
})

/*余票验证验证*/
app.get('/otnLeftTicketSubmitOrderRequest',function(req,res){
    var ck = req.headers.cookie;
    var params = req.query;
    var model = JSON.parse(params.model);
    var passengers = JSON.parse(params.passengers);
    var seat = JSON.parse(params.seat);
    // 验证登陆状态
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/leftTicket/submitOrderRequest',
        headers: {
            Cookie: ck+';current_captcha_type=Z;_jc_save_wfdc_flag=dc; ',
        },
        // methodL:'POST',
        ca: [ca]
    };
    var data = {
        secretStr: unescape(params.data[0]),
        train_date: model.start_date,
        back_train_date: '2017-12-30',
        tour_flag: 'dc',
        purpose_codes: 'ADULT',
        query_from_station_name:model.start_city,
        query_to_station_name:model.end_city,
        "undefined": ''
    };
    getHttps(options, data).then(function(_d) {
        if(_d.html){
            setCookie(res,_d.cookies);
            res.send({ success: true, data: JSON.parse(_d.html),lastParams:params });
        }
    })
})
/*订单登录验证*/
app.get('/otnLoginCheckUser',function(req,res){
    var ck = req.headers.cookie;
    var params = req.query;
    // 验证登陆状态
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/login/checkUser',
        headers: {
            Cookie: ck+';current_captcha_type=Z;'
        },
        ca: [ca]
    };
    var data = {
        _json_att:''
    };
    getHttps(options, data).then(function(_d) {
        console.log(_d);
        setCookie(res,_d.cookies);
        var result = _d.html?JSON.parse(_d.html):_d.html;
        res.send({ success: true, data: result ,lastParams:params});
    })
})
/*登录验证3*/
app.post('/passportWebAuthUamtk',function(req,res){
    var ck = req.headers.cookie;
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/passport/web/auth/uamtk',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': ck
        },
        ca: [ca]
    };
    var data = {
        appid:'otn'
    };
    getHttps(options,data).then(function(_d){
        var result = JSON.parse(_d.html);
        setCookie(res,_d.cookies);
        // 设置newapptk
        res.cookie('tk', result.newapptk);
        if (result.result_code == 0) {
            res.send({ success: true, data: result });
        }
    })
    
})
/*登录验证2*/
app.post('/otnPassport',function(req,res){
    //
    var ck = req.headers.cookie;
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/passport',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': ck
        },
        ca: [ca]
    };
    var data = {
        redirect:'/otn/login/userLogin'
    };
    getHttps(options,data).then(function(_d){
        setCookie(res, _d.cookies);
        res.send({ success: true, data: _d });
    })
})
/*登录验证1*/
app.post('/verificationUser', function(req, res) {
    var params = req.query;
    var ck = req.headers.cookie;
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
        setCookie(res,_d.cookies);
        res.send({ success: true, data: _d });
    });
});
/*获取联系人*/
app.get('/getPassengers', function(req, res) {
    var ck = req.headers.cookie;
    var data = {
        _json_att: ''
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/passengers/init',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: ck,
            Referer: "https://kyfw.12306.cn/otn/index/initMy12306"
        },
        ca: [ca]
    };

    getHttps(options, data).then(function(_d) {
        setCookie(res,_d.cookies);
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
        setCookie(res, _d.cookies, ['_passport_ct', '_passport_session'])
        res.end(_d.html, 'binary');
    });
});
/*获取车次信息*/
app.get('/getData', function(req, res) {
    var data = req.query;
    var ck = cookie.serialize('JSESSIONID', req.cookies.JSESSIONID);
    ck += ';' + cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    // ck += ';' + cookie.serialize('tk', req.cookies.newapptk);
    var data = {
        "leftTicketDTO.train_date": data.start_date,
        "leftTicketDTO.from_station": config.city[data.start_city],
        "leftTicketDTO.to_station": config.city[data.end_city],
        "purpose_codes": "ADULT"
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/leftTicket/queryO',
        headers: {
            Cookie: ck,
            Referer: "https://kyfw.12306.cn/otn/leftTicket/init"
        },
        ca: [ca]
    };
    console.log('请求车次信息,等待12306返回数据');;
    getHttps(options, data).then(function(_d) {
        // console.log(_d);
        var result;
        if (_d.html) {
            result = JSON.parse(_d.html);
        }
        if (result && result.data && result.data.result) {
            result.data.result = result.data.result.map(function(item) {
                var arr = item.split('|');
                arr = arr.map(function(_item) {
                    if (result.data.map[_item]) {
                        return result.data.map[_item];
                    } else {
                        return _item;
                    }
                })
                return arr;
            })
        }

        res.send({ success: true, data: result });
    });
});

// 验证登录状态
app.get('/sfyz', function(req, res) {
    var ck = cookie.serialize('JSESSIONID', req.cookies.JSESSIONID);
    ck += ';' + cookie.serialize('BIGipServerotn', req.cookies.BIGipServerotn);
    ck += ';' + cookie.serialize('tk', req.cookies.newapptk);
    var data = {
        "tk": req.cookies.newapptk
    };
    var options = {
        hostname: 'kyfw.12306.cn',
        path: '/otn/index/initMy12306',
        // path: '/otn/uamauthclient',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': ck
        },
        method: 'GET',
        ca: [ca]
    };
    httpReq(options, data).then(function(_d) {
        console.log(_d);
        var result;
        var reg = /<script xml:space="preserve">([\s\S]*?)</gm;
        result = reg.exec(_d);
        result = result ? result[1] : '';
        console.log(result);
        var out = {};
        result = result.replace(/var /g, 'out.');
        eval(result);
        console.log(out);

        res.send({ success: true, data: out });
    });
})

app.get('/goPiao', function(req, res) {
    var data = req.query;
    // 获取globalRepeatSubmitToken   也就是 提交订单里面的REPEAT_SUBMIT_TOKEN
    // /otn/confirmPassenger/initDc
});

function setCookie(res, cookies) {
    if(!cookies) return;
    var str = cookies.join(';');
    var ck = cookie.parse(str);
    for (var k in ck) {
        res.cookie(k, ck[k]);
    }
};

http.listen(9000, function() {
    console.log('---------------------');
})