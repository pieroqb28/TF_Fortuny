HISProfile.factory('ProfileService',['$resource','$q','$http','connStringSVC','$cookieStore',function($resource,$q,$http,connStringSVC,$cookieStore){


return{


  Perfil:function(){
    return $resource(connStringSVC.urlBase() + '/HS_Perfil/:id', { id: '@_id' }, {
         save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         get:     { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
            update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
            delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }}
      });
      
    
  },

  CambiarPassword:function(){
  	return $resource(connStringSVC.urlBase() + '/HS_Usuario/:id', { id: '@_id' }, {
         save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         get:     { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
         update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
         updatePassword:   { url: connStringSVC.urlBase() + '/HS_Usuario/password/' , method: 'POST',headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }}
      });

  },
  Parametros:function(){
    return $resource(connStringSVC.urlBase() + '/HISParam/:id', { id: '@_id' }, {
         save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         get:     { method: 'GET',  isArray: true,headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
         update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
         updatePassword:   { url: connStringSVC.urlBase() + '/HS_Usuario/password/' , method: 'POST',headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
         delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }}
      });

  },

  

}

}])