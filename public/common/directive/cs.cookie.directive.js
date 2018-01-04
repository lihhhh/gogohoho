(function(){
  "use strict";
  myapp.service("rsCookie",["$http",'$q',function($http,$q){
    var _this=this;
    this.setCookie=function(name,value){
      var cookieDate=new Date();
      cookieDate.setDate(cookieDate.getDate()+30);
      document.cookie = name + "="+ value + ";path=/;expires=" +cookieDate.toGMTString();
    };
    this.getCookie=function(name){
      var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
      if(arr=document.cookie.match(reg)){
        return unescape(arr[2]);
      }else{
        return null;
      }
    };
    this.deleteCookie=function(name){
        var cookieDate=new Date();
        cookieDate.setDate(cookieDate.getDate()-30);
        var cval=_this.getCookie(name);
        if(cval!=null){
          document.cookie = name + "="+ cval + ";path=/;expires=" +cookieDate.toGMTString();
        }
    }
  }]);
})();