var globalErrors = new angular
    .module('globalErrors', [])
    .config(function($provide, $httpProvider, $compileProvider) {
        var elementsList = $();
        console.log('Aism');
        var showMessage = function(data,mensaje) {      

            $('#mensajeError').text(mensaje);
            $('#popupErroresGlobales').modal('show');
            setTimeout(function(){
                $('#popupErroresGlobales').modal('hide');              
            },2200);

        };


        $httpProvider.interceptors.push(function($q) {
            return {

                'responseError': function(rejection) {
                    console.log('Mole');
                                        console.log(rejection);

                    showMessage(rejection.data,rejection.data.message);
                    return $q.reject(rejection);
                }
            };
        });

        
    })

