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
	return {
		getData:getData,
		getPassengers:getPassengers
	};
});