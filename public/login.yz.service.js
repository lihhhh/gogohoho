+function(){
	"use strict";
	var myapp=angular.module('myApp');
	myapp.service('rsLoginYz',function($http){
		this.loginYz = function(){
			var promise = new Promise(function(resolve,reject){
				$http({
					method:'get',
					url:'/sfyz'
				}).success(function(_d){
					resolve(_d);
				})
			})
			return promise;
		}
	})
}()