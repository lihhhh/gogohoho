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
    socket.on('isLogin', function(obj) {
        var cks = socket.client.request.headers.cookie;
        // 验证登陆状态
        var cookies = cookie.parse(obj.cookies);
        var ck = cookie.serialize('JSESSIONID', cookies.JSESSIONID);
        ck += ';' + cookie.serialize('BIGipServerotn', cookies.BIGipServerotn);
        ck += ';' + cookie.serialize('tk', cookies.tk);
        var options = {
            hostname: 'kyfw.12306.cn',
            path: '/otn/login/checkUser',
            headers: {
                Cookie: cks+';current_captcha_type=Z;_jc_save_wfdc_flag=dc;',
            },
            method:'POST',
            ca: [ca]
        };
        var data = {
            _json_att:''
        };
        httpReq(options, data).then(function(_d) {
            console.log(_d);
        })
    })
    socket.on('goP', function(obj) {
        // /otn/leftTicket/submitOrderRequest
        console.log(obj);
        var cookies = socket.client.request.headers.cookie;
        var seat = obj.seat;
        var passengers = obj.passengers;
        var ck = cookies;
        var options = {
            hostname: 'kyfw.12306.cn',
            path: '/otn/leftTicket/submitOrderRequest',
            headers: {
                Cookie: ck+';current_captcha_type=Z;_jc_save_wfdc_flag=dc; ',
            },
            ca: [ca]
        };
        var data = {
            secretStr: obj.data[0],
            train_date: obj.model.start_date,
            back_train_date: '2017-12-30',
            tour_flag: 'dc',
            purpose_codes: 'ADULT',
            query_from_station_name:obj.model.start_city,
            query_to_station_name:obj.model.end_city,
            "undefined": ''
        };

        getHttps(options, data).then(function(yzxx) {
            console.log(yzxx);
            var options = {
                hostname: 'kyfw.12306.cn',
                path: '/otn/confirmPassenger/initDc',
                headers: {
                    Cookie: cookies,
                },
                ca: [ca]
            };
            getHttps(options, {}).then(function(_d) {
                // console.log(_d);
                var cks = _d.cookies.join(';');
                var cookieObj = cookie.parse(cks);
                cookies = cookies.replace(/JSESSIONID.*?;/g,'');
                cookies+=';'+'JSESSIONID='+cookieObj['JSESSIONID'];
                var result;
                var reg = /CDATA\[\*\/([\s\S]*?)\/\*\]\]/gm;
                if (_d.html) {
                    var arr = reg.exec(_d.html);
                    var str = arr ? arr[1] : '';

                    if (str) {
                        var spt = {};
                        str = str.replace(/var /g, 'spt.');
                        eval(str);
                        // globalRepeatSubmitToken
                        var REPEAT_SUBMIT_TOKEN = spt.globalRepeatSubmitToken;
                        var options = {
                            hostname: 'kyfw.12306.cn',
                            path: '/otn/confirmPassenger/checkOrderInfo',
                            headers: {
                                Cookie: cookies + ';current_captcha_type=Z;_jc_save_wfdc_flag=dc;',
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
                            REPEAT_SUBMIT_TOKEN: REPEAT_SUBMIT_TOKEN
                        };
                        getHttps(options, data).then(function(_data) {
                            console.log(_data);
                        })
                    }
                } else {
                    // 检查登陆状态
                }
                // socket.emit('data', { success: true, data: result });
            });
        })
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
                var str = ress.headers['set-cookie'].join(';');
                var ck = cookie.parse(str);
                res.cookie('BIGipServerotn', ck.BIGipServerotn);
                // debugger
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
        var result = JSON.parse(_d.html);
        if (result.result_code == 0) {
            // 获取newapptk   查看联系人需要传tk
            options.path = '/passport/web/auth/uamtk';
            var str = _d.cookies.join(';');
            var cks = cookie.parse(str);
            ck = 'uamtk=' + cks.uamtk;
            options.headers.Cookie = ck;
            setCookie(res, _d.cookies, ['uamtk']);
            data = {
                appid: 'otn'
            };
            getHttps(options, data).then(function(__d) {
                var tkyz = JSON.parse(__d.html);
                // 设置newapptk
                res.cookie('newapptk', tkyz.newapptk);
                res.cookie('tk', tkyz.newapptk);
                setCookie(res, __d.cookies);
                if (tkyz.result_code == 0) {
                    // db.find({ JSESSIONID: req.cookies.JSESSIONID }).then(function(___d) {
                    // if (___d.length < 1) {
                    // var savedata = {
                    //     'JSESSIONID': req.cookies.JSESSIONID,
                    //     'BIGipServerotn': req.cookies.BIGipServerotn,
                    //     'userName': params.userName,
                    //     'password': params.password
                    // };
                    // db.save(savedata).then(function(__d) {
                    //     console.log(__d);
                    // });
                    // } else {}
                    res.cookie('userName', params.userName);
                    res.send({ success: true, data: result });
                    // });
                }
            });
        };

    });
});
/*获取联系人*/
app.get('/getPassengers', function(req, res) {
    var ck = cookie.serialize('tk', req.cookies.newapptk);
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
    var str = cookies.join(';');
    var ck = cookie.parse(str);
    for (var k in ck) {
        res.cookie(k, ck[k]);
    }
};

http.listen(9000, function() {
    console.log('---------------------');
})