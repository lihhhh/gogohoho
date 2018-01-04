var myapp=angular.module('myApp',['ngRoute']);
myapp.controller('myctrl',["$scope","eventbus","rcGetData",function($scope,eventbus,rcGetData){
	eventbus.subscribe('login.ok',function(e,data){
		console.log('登录状态',data.status);
		if(data.status){
			rcGetData.otnUamauthclient().then(function(_d){
	    		console.log(_d);
	    		if(_d.data&&_d.data.result_code!=0){
	    			// 记录验证登陆失败次数
	    		}else if(_d.data&&_d.data.result_code==0){
	                $scope.userData = _d.data;
	            }else{
	            	$scope.userData = {};
	            }
	    	})
		}
	})
}]);

myapp.config(['$routeProvider', function($routeProvider){
    $routeProvider
    .when('/',{templateUrl:'/login/login.html',controller:'rcLogin'})
    .when('/main',{templateUrl:'/main/main.html',controller:'reMain'})
    .when('/printers',{template:'这是打印机页面'})
    .otherwise({redirectTo:'/login'});
}]);