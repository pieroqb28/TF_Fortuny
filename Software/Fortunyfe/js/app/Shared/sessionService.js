
HISShared.factory('SessionInternal',['$resource','connStringSVC',function($resource,connStringSVC){


return {

  authUser:function(){
    return $resource(connStringSVC.urlBase() + '/HS_Autenticar',{}, {
      update: {
        method: 'PUT'
      }
      });
    
  }
}
}])
