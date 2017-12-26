var myapp=angular.module('myApp',['ngRoute']);
myapp.controller('myctrl',["$scope",function($scope){
}]);

myapp.config(['$routeProvider', function($routeProvider){
        $routeProvider
        .when('/',{templateUrl:'/login/login.html',controller:'rcLogin'})
        .when('/main',{templateUrl:'/main/main.html',controller:'reMain'})
        .when('/printers',{template:'这是打印机页面'})
        .otherwise({redirectTo:'/login'});
    }]);