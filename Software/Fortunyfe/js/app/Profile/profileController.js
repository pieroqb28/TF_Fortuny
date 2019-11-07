HISProfile.controller('ProfileCambiarPassController',['$scope','$rootScope','ProfileService','$routeParams','erroresServices','mensajesData',function($scope,$rootScope,ProfileService,$routeParams,erroresServices,mensajesData){
	$scope.formData = {

        };       
                   $scope.submitted = false;

        $scope.cambiarClaveUsuario = function (isValid) {
                   $scope.submitted = true;

          if (isValid){



          

        	if($scope.formData.nuevaClave == $scope.formData.repitaNuevaClave)
        	{
                                 $scope.submitted = false;

        	 	var oHeader = {alg: 'HS256', typ: 'JWT'};
                var oPayload = {};
                var tNow = KJUR.jws.IntDate.get('now');
                var tEnd = KJUR.jws.IntDate.get('now + 1day');
                oPayload.iss = "http://localhost";
                oPayload.sub = "http://localhost";
         //       oPayload.nbf = tNow;
          //      oPayload.iat = tNow;
                oPayload.exp = tEnd;
                oPayload.claveVieja = $scope.formData.claveAnterior;
                oPayload.claveNueva = $scope.formData.nuevaClave;
                oPayload.jti = "id123456";
                oPayload.aud = "http://localhost";
                var sHeader = JSON.stringify(oHeader);
                var sPayload = JSON.stringify(oPayload);
                 var sJWT  = KJUR.jws.JWS.sign(null, sHeader, sPayload, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=");
                $scope.clave=sJWT;
                $scope.enviar={
                  jwt:$scope.clave
                }
          ProfileService.CambiarPassword().updatePassword($scope.enviar, function(result) {
          mensajesData.mensajeUpdate(function(cb){
              $scope.formData={}
              window.location= "#/main/chart";
          });
			     
			    },function (error){

			        erroresServices.controlError(error.status);

			    });
       	 };

       	 if($scope.formData.nuevaClave != $scope.formData.repitaNuevaClave)
       	 {
           $('#popupDatosIncorrectos').modal('show');
                    setTimeout(function(){
                    $('#popupDatosIncorrectos').modal('hide');
                    },3000);


       	 	 /* $scope.errorTittle ="Cambio de contraseña";
              $scope.errorMensaje ="La confirmación de contraseña no es correcta";
              $scope.errorFuncion= "ningunaFuncion";
              $('#popupErrores').modal('show'); */
       	 };


       }
       };
       $scope.cerrarPupUp=function(){
        $('#popupMensajesUpdate').modal('hide');
       }
	}])