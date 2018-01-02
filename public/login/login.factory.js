myapp.factory('rcLoginUp',function($http,$q){
	var loginUp=function(_d){
		var deferred = $q.defer(); 
		$http({method:'GET',url:'/loginUp',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var verificationUser=function(_d){
		var deferred = $q.defer(); 
		$http({method:'POST',url:'/verificationUser',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var otnPassport = function(_d){
		var deferred = $q.defer(); 
		$http({method:'POST',url:'/otnPassport',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	var passportWebAuthUamtk = function(_d){
		var deferred = $q.defer(); 
		$http({method:'POST',url:'/passportWebAuthUamtk',params:_d}).success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	return {
		loginUp:loginUp,
		verificationUser:verificationUser,
		otnPassport:otnPassport,
		passportWebAuthUamtk:passportWebAuthUamtk
	};
});