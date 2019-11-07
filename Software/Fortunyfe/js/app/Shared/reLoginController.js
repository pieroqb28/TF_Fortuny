HISShared.controller('reLoginController', ['$cookieStore','$scope','SessionInternal','$route', function($cookieStore,$scope,SessionInternal,$route){

  
           $scope.erroresLoggin="";
           $scope.mismoValor = false;
           $scope.failingLogin = 0;
           $scope.formData = {

             };

         
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


                SessionInternal.authUser().save($scope.token).$promise.then(function(responseMessage) {

                      var payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(responseMessage.JWT.split(".")[1]));
                      if (payloadObj.idUsuario != 0){
                        $tokenInicio = responseMessage.JWT; 
                        localStorage.setItem('sJWT', responseMessage.JWT); 
                         $('#popupError401').modal('hide');  
                        $route.reload();
                         ProfileService.Parametros().get(function(objParametros) {

                              for(i=0;i<objParametros.length;i++)
                              {
                              localStorage.removeItem(objParametros[i].nombreParam);
                              localStorage.setItem(objParametros[i].nombreParam,JSON.stringify(objParametros[i].valorParam) ); 
                              }

                          })




                      }

                      if(responseMessage.Code=="000000"){
                        localStorage["Token"]=payloadObj.token;
                        $window.location.reload();
                      }


                },function(error){



              var status = error.status;
                  if(status==401){
                     $cookieStore.remove('tokenActual');
                      localStorage.removeItem('sJWT');
                   $scope.erroresLoggin="Hubo un error con sus datos, inténtelo nuevamente";
                   $scope.failingLogin ++;
                   if ( $scope.failingLogin > 3) {
                    
                        window.location = '/'
                   }
                 };
                 if(error.data < 0){
                  $scope.erroresLoggin="La cuenta está bloqueada por intentos fallidos. Faltan " + Math.abs(error.data) + " minutos para intentar nuevamente";
                 };
                  if(error.data == -9999){
                   $scope.erroresLoggin="Lo sentimos usted no tiene autorización para ingresar al sistema";
                 };
                  if(error.data == -9998){
                  $scope.erroresLoggin="Usted no podrá ingresar al sistema por una temporada";
                  };

            }); 

         }else{


         }

               
         };



}])