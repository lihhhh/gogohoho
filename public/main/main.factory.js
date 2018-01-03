myapp.factory('rcGetData',function($http,$q){
	var getData=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/getData',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var getPassengers=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/getPassengers',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnLoginCheckUser=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnLoginCheckUser',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnLeftTicketSubmitOrderRequest=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnLeftTicketSubmitOrderRequest',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnConfirmPassengerInitDc=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnConfirmPassengerInitDc',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnConfirmPassengerCheckOrderInfo=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnConfirmPassengerCheckOrderInfo',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnConfirmPassengerGetQueueCount=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnConfirmPassengerGetQueueCount',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnConfirmPassengerConfirmSingleForQueue=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnConfirmPassengerConfirmSingleForQueue',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnConfirmPassengerQueryOrderWaitTime=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnConfirmPassengerQueryOrderWaitTime',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnUamauthclient=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/otnUamauthclient',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	return {
		getData:getData,//车次查询
		getPassengers:getPassengers,//获取联系人
		otnLoginCheckUser:otnLoginCheckUser,//登录验证
		otnLeftTicketSubmitOrderRequest:otnLeftTicketSubmitOrderRequest,//是否可以进入车票预订
		otnConfirmPassengerInitDc:otnConfirmPassengerInitDc,//
		otnConfirmPassengerCheckOrderInfo:otnConfirmPassengerCheckOrderInfo,
		otnConfirmPassengerGetQueueCount:otnConfirmPassengerGetQueueCount,//查询排队情况
		otnConfirmPassengerConfirmSingleForQueue:otnConfirmPassengerConfirmSingleForQueue,//下订单
		otnConfirmPassengerQueryOrderWaitTime:otnConfirmPassengerQueryOrderWaitTime,//查看下单出票结果
		otnUamauthclient:otnUamauthclient
	};
});