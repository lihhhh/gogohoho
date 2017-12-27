myapp.controller('reMain',['$scope',"rcGetData","$interval",function($scope,rcGetData,$interval){
	/*页面数据绑定*/
	$scope.model={
		start_date:new Date().toISOString().split('T')[0],
		start_city:'杭州东',
		end_city:'郑州',
		passengers:'',
		passengerTicketStr:'',
		seat_types:{
			swz_num:{
				text:'商务座',
				status:false
			},
			zy_num:{
				text:'一等座',
				status:false
			},
			ze_num:{
				text:'二等座',
				status:false
			},
			rw_num:{
				text:'软卧',
				status:false
			},
			yw_num:{
				text:'硬卧',
				status:false
			},
			rz_num:{
				text:'软座',
				status:false
			},
			yz_num:{
				text:'硬座',
				status:false
			},
			wz_num:{
				text:'无座',
				status:false
			}  
		}
	};
	$scope.train_types=[
		{
			text:'高',
			code:'G',
			status:false,
			color:'#cf973f'
		},
		{
			text:'城',
			code:'C',
			status:false,
			color:'#cf973f'
		},
		{
			text:'动',
			code:'D',
			status:false,
			color:'#03a9f4'
		},
		{
			text:'直',
			code:'Z',
			status:false,
			color:'#a63fcf'
		},{
			text:'特',
			code:'T',
			status:false,
			color:'#3c2e2e'
		},{
			text:'快',
			code:'K',
			status:false,
			color:'#467f45'
		},{
			text:'其',
			code:'Q',
			status:false,
			color:'#8392b5'
		}
	];
	var socket = io.connect('http://192.168.2.35:8089');
	socket.on('msg',function(obj){
			console.log(obj);
		});
	$scope.btnMg="查询";
	$scope.isIndex=true;
	$scope.isQiang=false;
	$scope.reg=new RegExp('([0-9]|有)+');
	/*获取联系人信息*/
	rcGetData.getPassengers().then(function(_d){
		console.log(_d);
		if(_d.success){
			$scope.passengers=eval(_d.data);
		}else{
			$scope.passengers=[];
			window.location.href='http://192.168.2.35:8089/#/';
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
			if(_d.data.status){
				$scope.datas = _d.data.data.result;
				// _d.data.map(function(item){
				// 	item.isQiang=false;
				// });
				// $scope.train_types.map(function(item){
				// 	item.status=false;
				// });
				// for(var key in $scope.model.seat_types){
				// 	$scope.model.seat_types[key].status=false;
				// }
				// $scope.datas=_d.data;
			}
		});
	};
	$scope.search();
	/*复选框点击事件 点击对应的车次类型 下方车次信息出现抢或取消抢*/
	$scope.checkStatus=function(code,status){
		var reg=new RegExp('[0-9+]');
		if(!$scope.datas) return;
		$scope.datas.map(function(item){
			var CODE=item.queryLeftNewDTO.station_train_code.substring(0,1);
			if(code==CODE){
				item.isQiang=status;
			}else if(code=='Q'&&reg.test(CODE)){
				item.isQiang=status;
			}
			return item;
		});
	};
	/*下方车次信息点击事件 例：本页所有高字头的车次全部被选中 对应的上方高字复选框被自动勾选*/
	$scope.checkQiang=function(data){
		console.log(data);
		data.isQiang=!data.isQiang;
		var bool=true;
		code=data.queryLeftNewDTO.station_train_code.substring(0,1);
		$scope.datas.map(function(item){
			var CODE=item.queryLeftNewDTO.station_train_code.substring(0,1);
			if(code==CODE&&item.isQiang==false){
				bool=false;
			}
			return item;
		});
		if(/([0-9]|[a-z])/.test(code)){
			code='Q';
		};
		for(var key in $scope.train_types){
			if($scope.train_types[key].code==code){
				$scope.train_types[key].status=bool;
			}
		}
	};
	/*相应回车事件*/
	$scope.keyDown=function(event){
		if(event.keyCode==13){
			$scope.search();
		}
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
	/*开始抢票点击事件*/
	$scope.goSocket=function(){
		socket.emit('msg',{
			cookies:document.cookie,
			model:$scope.model
		});
	}
}])