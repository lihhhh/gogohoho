myapp.controller('reMain',['$scope',"rcGetData","$interval",function($scope,rcGetData,$interval){
	$scope.datas=[];
	/*页面数据绑定*/
	$scope.model={
		start_date:new Date().toISOString().split('T')[0],
		start_city:'杭州',
		end_city:'郑州',
		passengers:'',
		passengerTicketStr:'',
		seat_types:{
			swz_num:{
				text:'商务座',
				status:false,
				index:32,
				code:'9'
			},
			zy_num:{
				text:'一等座',
				status:false,
				index:31,
				code:'M'
			},
			ze_num:{
				text:'二等座',
				status:false,
				index:30,
				code:'O'
			},
			rw_num:{
				text:'软卧',
				status:false,
				index:23,
				code:'4'
			},
			yw_num:{
				text:'硬卧',
				status:false,
				index:28,
				code:'3'
			},
			rz_num:{
				text:'软座',
				status:false,
				// index:32,
				code:'2'
			},
			yz_num:{
				text:'硬座',
				status:false,
				index:29,
				code:'1'
			},
			wz_num:{
				text:'无座',
				status:false,
				index:26,
				code:'1'
			}  
		}
	};
	$scope.train_types=[
		{
			text:'高',
			code:'G',
			status:true,
			color:'#cf973f'
		},
		{
			text:'城',
			code:'C',
			status:true,
			color:'#cf973f'
		},
		{
			text:'动',
			code:'D',
			status:true,
			color:'#03a9f4'
		},
		{
			text:'直',
			code:'Z',
			status:true,
			color:'#a63fcf'
		},{
			text:'特',
			code:'T',
			status:true,
			color:'#3c2e2e'
		},{
			text:'快',
			code:'K',
			status:true,
			color:'#467f45'
		},{
			text:'其',
			code:'Q',
			status:true,
			color:'#8392b5'
		}
	];
	var socket = io.connect('http://127.0.0.1:9000');
	socket.on('msg',function(obj){
			console.log(obj);
		});
	$scope.btnMg="查询";
	$scope.isIndex=true;
	$scope.isQiang=false;
	$scope.reg=new RegExp('([0-9]|有)+');
	/*获取联系人信息*/
	rcGetData.getPassengers().then(function(_d){
		
		if(_d.success){
			$scope.passengers=eval(_d.data);
			console.log($scope.passengers);
		}else{
			$scope.passengers=[];
			// window.location.href='http://192.168.2.35:8089/#/';
		}
	});
	/*查询*/
	$scope.search=function(){
		$scope.timer=$interval(function(){
			if($scope.btnMg.length==5){
				$scope.btnMg="查询";
			}else{
				$scope.btnMg+="·";
			}
		},400);
		rcGetData.getData($scope.model).then(function(_d){
		    $interval.cancel($scope.timer);
			$scope.btnMg="查询";
			console.log(_d);
			if(_d.data&&_d.data.status){
				$scope.datas = _d.data.data.result;
			}
		});
	};
	$scope.search();
	/*复选框点击事件 点击对应的车次类型 下方车次信息出现抢或取消抢*/
	$scope.checkStatus=function(train_type){
		train_type.status=!train_type.status;
		updateView();
	};
	// 更新车次列表的显示项
	function updateView(){
		var reg=new RegExp('[0-9+]');
		if(!$scope.datas) return;
		$scope.datas.map(function(item){
			item.hide = false;
		});
		$scope.train_types.map(function(type){
			$scope.datas.map(function(item){
				var CODE=item[3].substring(0,1);
				if(type.code==CODE){
					item.hide = !type.status;
				}else if(type.code=='Q'&&reg.test(CODE)){
					item.hide = !type.status;
				}
			});
		})
	}
	updateView();
	/*下方车次信息点击事件 例：本页所有高字头的车次全部被选中 对应的上方高字复选框被自动勾选*/
	$scope.checkQiang=function(data){
		console.log(data);
		data.isQiang=!data.isQiang;
		// var bool=true;
		// code=data.queryLeftNewDTO.station_train_code.substring(0,1);
		// $scope.datas.map(function(item){
		// 	var CODE=item.queryLeftNewDTO.station_train_code.substring(0,1);
		// 	if(code==CODE&&item.isQiang==false){
		// 		bool=false;
		// 	}
		// 	return item;
		// });
		// if(/([0-9]|[a-z])/.test(code)){
		// 	code='Q';
		// };
		// for(var key in $scope.train_types){
		// 	if($scope.train_types[key].code==code){
		// 		$scope.train_types[key].status=bool;
		// 	}
		// }
	};
	/*相应回车事件*/
	$scope.keyDown=function(event){
		if(event.keyCode==13){
			$scope.search();
		}
	}

	/*获取勾选的车次*/
	$scope.getCc = function(){
		var out = [];
		$scope.datas.map(function(item){
			if(item.isQiang){
				out.push(item[3]);
			}
		})
		return out;
	}
	
	/*复选框车次类型 和对应的颜色*/
	$scope.trainType=function(text){
		text=text.substring(0,1);
		switch(text){
			case 'G':
				return {
					text:'高',
					color:'#cf973f'
				};
				break;
			case 'C':
				return {
					text:'城',
					color:'#cf973f'
				};
				break;
			case 'D':
				return {
					text:'动',
					color:'#cf973f'
				};
				break;
			case 'Z':
				return {
					text:'直',
					color:'#a63fcf'
				};
				break;
			case 'T':
				return {
					text:'特',
					color:'#3c2e2e'
				};
				break;
			case 'K':
				return {
					text:'快',
					color:'#467f45'
				};
				break;
			default :
				return {
					text:'其',
					color:'#8392b5'
				};
				break;
		}
	};
	/*鼠标移入车次信息 对应行变色*/
	$scope.changeBack=function(index){
		$scope.isIndex=index;
	};
	$scope.goPtimer={
		timer:'',
		goP:false
	};

	function getPassengers(){
		var out = [];
		$scope.passengers.map(function(item){
			if(item.status){
				out.push(item);
			}
		})
		return out;
	};

	function isYp(datas){
		console.log(datas);
		var seat_types = $scope.model.seat_types;
		var reg = /^[\d有]+$/g;
		// 获取抢票车次
		var cc = $scope.getCc();
		cc.map(function(it){
			datas.map(function(data){
				if(it==data[3]){
					for(var k in seat_types){
						if(seat_types[k].status&&reg.test(data[seat_types[k].index])&&data[seat_types[k].index]!=0){
							alert(data[seat_types[k].index]);
							// 首先验证登陆状态
							socket.emit('isLogin',{
								cookies:document.cookie
							});
							// socket.emit('goP',{
							// 	cookies:document.cookie,
							// 	data:data,
							// 	seat:seat_types[k],
							// 	passengers:getPassengers()[0],
							// 	model:$scope.model
							// })
						}
					}
				}
			})
		})
	};
	/*开始抢票点击事件*/
	$scope.goSocket=function(){
		if($scope.goPtimer.goP){
			$interval.cancel($scope.goPtimer.timer);
			$scope.goPtimer.goP=false;
		}else{
			$scope.goPtimer.timer = $interval(function(){
				socket.emit('msg',{
					cookies:document.cookie,
					model:$scope.model
				});
			},3000);
			$scope.goPtimer.goP=true;
		}
	}
	socket.on('data',function(_d){
		if(_d.data&&_d.data.status){
			// $scope.datas = _d.data.data.result;
			isYp(_d.data.data.result);
		}
	})
}])