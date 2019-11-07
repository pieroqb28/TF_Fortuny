HISLogin
.controller('loginController', ['$cookieStore','$scope','Session','startPage', function($cookieStore,$scope,Session,startPage){

  var verificandoCookie = $cookieStore.get('tokenActual');
  if(verificandoCookie == null)
  {
       

           $scope.erroresLoggin="";
           $scope.mismoValor = false;

             $scope.formData = {

             };

          $scope.cerrarPupUp=function(){
            $('#popupDatosIncorrectos').modal('hide');
          }
          $scope.submitForm = function (isValid) {
              
              $scope.submitted = true;
             if (isValid){
         
                var oHeader = {alg: 'HS256', typ: 'JWT'};
                var oPayload = {};
                var tNow = KJUR.jws.IntDate.get('now');
                var tEnd = KJUR.jws.IntDate.get('now + 1day');
                oPayload.iss = "http://localhost";
                oPayload.sub = "http://localhost";
                oPayload.exp = tEnd;
                oPayload.usuario = $scope.formData.usuario;
                oPayload.contrasena = $scope.formData.password;
                oPayload.latitud = '10';
                oPayload.longitud = '20';
                oPayload.jti = "id123456";
                oPayload.aud = "http://localhost";


                var sHeader = JSON.stringify(oHeader);
                var sPayload = JSON.stringify(oPayload);
                var sJWT  = KJUR.jws.JWS.sign(null, sHeader, sPayload, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=");
                $scope.token= {};
                $scope.token.jwt= sJWT;
                var param={}
                param.Token=localStorage[sJWT];


                Session.authUser().save($scope.token).$promise.then(function(responseMessage) {
                      var payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(responseMessage.JWT.split(".")[1]));
                      if (payloadObj.idUsuario != 0){
                        $tokenInicio = responseMessage.JWT; 
                        localStorage.setItem('sJWT', responseMessage.JWT); 
                        window.location= startPage;
                      }

                      if(responseMessage.Code=="000000"){
                        localStorage["Token"]=payloadObj.token;
                        $window.location.reload();
                      }


                },function(error){

           

              var status = error.status;
                 
                 $scope.mostrarMensajeError=error.data.err
                 Session.logginPswdIncorrecto();
                 
               

            }); 

         }else{


         }

               
         };


  }else{
         window.location= startPage;
      }  


}])

HISLogin.controller('recupPassController', ['$scope','Session','startPage', function($scope,Session,startPage){
    $scope.formData={}
    $scope.enviarUsuario = function (isValid) 
    {
         $scope.submitted = true;
             if (isValid){

          Session.recuperarPassword().recupPassword({correo:$scope.formData.usuario}, function(result) {
          Session.mensajeEnvioEmail(function(cb){
            window.location= "/#/";
          });
           
          },function (error){

      });
        }
   
    }
     $scope.cerrarPupUp=function(){
            $('#popupEnvioEmail').modal('hide');
    }

}])
HISLogin.controller('nuevoPasswordController', ['$scope','Session','startPage','$routeParams', function($scope,Session,startPage,$routeParams){
 
  $scope.token= $routeParams.idUsuario;
  localStorage.setItem('sJWT', $scope.token); 
  $scope.formData={}
  $scope.cambiarClaveUsuario=function(formData,isValid){
    $scope.submitted=true
    
    if(isValid)
    {  
       if($scope.formData.nuevaClave == $scope.formData.repitaNuevaClave)
          {

            var oHeader = {alg: 'HS256', typ: 'JWT'};
                var oPayload = {};
                var tNow = KJUR.jws.IntDate.get('now');
                var tEnd = KJUR.jws.IntDate.get('now + 1day');
                oPayload.iss = "http://localhost";
                oPayload.sub = "http://localhost";
                oPayload.exp = tEnd;          
                oPayload.claveNueva = $scope.formData.nuevaClave;
                oPayload.jti = "id123456";
                oPayload.aud = "http://localhost";
                var sHeader = JSON.stringify(oHeader);
                var sPayload = JSON.stringify(oPayload);
                 var sJWT  = KJUR.jws.JWS.sign(null, sHeader, sPayload, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=");
                $scope.clave=sJWT;

             Session.CambiarPswd().nuevoPassword({jwt:$scope.clave}, function(result) {
               //      ProfileService.CambiarPassword().updatePassword({id:"566f28f77c7fb4e40d6c81b4"},{jwt:$scope.clave}, function() {
          
                Session.mensajeUpdate(function(cb){                  
                      window.location= "/#/";
                });
                
                },function (error){

                  //  erroresServices.controlError(error.status);

              }); 
               
          }
          else
          {
            $('#contraseniasDesiguales').modal('show') 
            
          }

     
    } 

  }
  $scope.cerrarPupUp=function(){
    
     $('#popupMensajesUpdate').modal('hide');
     $('#contraseniasDesiguales').modal('hide');
  }

}])