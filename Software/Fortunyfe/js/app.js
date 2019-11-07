var app = angular.module('HIS', ['ngRoute',


    'kendo.directives',
    'ngCookies',
    'ngResource',
    'globalErrors',
    'ui.bootstrap',
    'HIS.Principal',
    'HIS.Shared',
    'HIS.Profile',
    //'HIS.Setup',

    //FORTUNY
    'HIS.Network',
    'HIS.Analitycs',
    'HIS.List',
    'angucomplete-alt'
    

])

app.run(['$rootScope', '$cookieStore', 'ProfileService', function($rootScope, $cookieStore, ProfileService) {


    if (localStorage.getItem("sJWT") === null) {

        if ($cookieStore.get('tokenActual') === null || !$cookieStore.get('tokenActual')) {
            window.location = "index.html";
        } else {
            localStorage.setItem('sJWT', $cookieStore.get('tokenActual'));

        }

    } else
    if (localStorage.getItem("funcionalidades") === null) {
        ProfileService.Parametros().get(function(objParametros) {            
            for (i = 0; i < objParametros.length; i++) {
                var texto = JSON.stringify(objParametros[i].valorParam)
                localStorage.setItem(objParametros[i].nombreParam, texto);
            }
        })


    }

}]);

app.config(['$routeProvider', function($routeProvider) {



    EvaluarAcceso = function(valor) {
        if (localStorage.getItem("funcionalidades") != null) {
            var funcionPermitida = false;
            var paramFuncionalidades = JSON.parse(localStorage.getItem('funcionalidades'));
            for (i = 0; i < paramFuncionalidades.length; i++) {
                if (paramFuncionalidades[i] == valor) {
                    funcionPermitida = true;
                    break;
                }
            }

            if (!funcionPermitida) {
                console.log(valor + ": funcion no permitida");
                window.location = "/";
            }
        }
    };


    $routeProvider

    

    

       
    .when('/cambiarContrasenia', {
            templateUrl: 'js/app/Profile/cambiarPasswordView.html',
            controller: 'ProfileCambiarPassController',
            resolve: {
                "check": function() { EvaluarAcceso('Cambiar Contraseña') }
            }

        })
        .when('/network', {
            templateUrl: 'js/app/Network/networkView.html',
            controller: 'networkController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }
        
            
        })
        .when('/network/influencer/:username', {
            templateUrl: 'js/app/Network/networkDetailsView.html',
            controller: 'networkDetailsController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }

        })  
        .when('/network/influencer', {
            templateUrl: 'js/app/Influencer/influencerView.html',
            controller: 'influencerController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }

        })
        .when('/network/list/:id', {
            templateUrl: 'js/app/List/listView.html',
            controller: 'listController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }

        }) 
        .when('/analitycs', {
            templateUrl: 'js/app/Analitycs/analitycsView.html',
            controller: 'analitycsController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }
            

        })
        .when('/analitycs/:id', {
            templateUrl: 'js/app/Analitycs/analitycsDetailsView.html',
            controller: 'analitycsDetailsController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }
            

        })
        .when('/', {
            templateUrl: 'js/app/Network/networkView.html',
            controller: 'networkController',
            resolve: {
               /* "check": function() { EvaluarAcceso('Cambiar Contraseña') }*/
            }

        })

    .otherwise({
        redirectTo: '/'
    });


}])
