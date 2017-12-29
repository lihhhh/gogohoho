var myapp=angular.module('myApp',['ngRoute']);
myapp.controller('myctrl',["$scope","eventbus","rsLoginYz",function($scope,eventbus,rsLoginYz){
	eventbus.subscribe('login.ok',function(e,data){
		console.log('登录状态',data.status);
		if(data.status){
			rsLoginYz.loginYz().then(function(_d){
				console.log(_d);
				if(_d.success){
					$scope.userData = _d.data;
				}else{
					$scope.userData = {};
				}
			});
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