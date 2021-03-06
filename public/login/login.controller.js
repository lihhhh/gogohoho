myapp.controller('rcLogin',['$scope',"rcLoginUp",function($scope,rcLoginUp){
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
						$scope.user.codeData=[];
						$scope.user.code='';
						console.log(_d);
						if(_d.data.result_code=='0'){
							window.location.href='http://127.0.0.1:8089/#/main';
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