myapp.controller('rcLogin',['$scope',"rcLoginUp","eventbus",function($scope,rcLoginUp,eventbus){
	$scope.random=Math.random()*1;//随机数
	$scope.user={
		userName:'',
		password:'',
		codeData:[],
		code:''
	};
	$scope.changeRandom=function(){
		$scope.random=Math.random()*1;
		$scope.user.codeData=[];
		$scope.user.code='';
	};
	$scope.loginUp=function(){
		rcLoginUp.loginUp($scope.user).then(function(_d){
			if(_d.success){
				if(_d.msg.result_code==4){
					rcLoginUp.verificationUser($scope.user).then(function(_d){
						return rcLoginUp.otnPassport($scope.user);
					}).then(function(){
						return rcLoginUp.passportWebAuthUamtk($scope.user);
					}).then(function(___d){
						if(___d.success){
							$scope.user.codeData=[];
							$scope.user.code='';
							eventbus.broadcast('login.ok',{status:true});
							window.location.href='/#/main';
						}else{
							alert('账号或密码错误！');
							$scope.random=Math.random()*1;
							$scope.user.code='';
							$scope.user.codeData=[];
						}
						
					});
				}else{
					$scope.random=Math.random()*1;
					$scope.user.code='';
					$scope.user.codeData=[];
				}
			};
			
		});
	};

	$scope.goMain = function(){
		window.location.href='/#/main';
	};
	$scope.getCoordinate=function(event){
		console.log(event);
		if($scope.user.code){
			$scope.user.code+=','+event.offsetX+','+event.offsetY;
		}else{
			$scope.user.code=event.offsetX+','+event.offsetY;
		}
		$scope.user.codeData.push({
			offsetX:event.offsetX,
			offsetY:event.offsetY,
		});
	}
}]);