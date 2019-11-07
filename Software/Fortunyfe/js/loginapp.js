var app = angular.module('HIS', ['ngRoute',

  'kendo.directives' ,
  'ngCookies',
  'globalErrors',
  'ngResource',  
  'HIS.Login'
  ])


app.config(function($provide, $httpProvider, $compileProvider) {
        var elementsList = $();

      
      });


app.config(['$routeProvider',function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl : 'js/app/Login/loginView.html',
            controller  : 'loginController'
        })
        
         .when('/recuperarClave', {
            templateUrl : 'js/app/Login/recuperarPasswordView.html',
            controller  : 'recupPassController'
        })
        .when('/recuperarClave/nuevaContrasenia/:idUsuario', {
            templateUrl : 'js/app/Login/cambiarPassView.html',
            controller  : 'nuevoPasswordController'
        })
}])