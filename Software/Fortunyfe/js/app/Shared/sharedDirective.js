HISShared.directive('popupMensaje', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpMensaje.html'

    };
}),
HISShared.directive('menuInicio', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/menu.html'

    };
}),
HISShared.directive('directivaTipocambio', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpTipoCambio.html',
     controller:'tipoCambioController',     
    };
}),
HISShared.directive('confirmarEliminacion', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUps/popUpEliminar.html'

    };
}),
HISShared.directive('mensajeSaveData', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpMensajeSave.html'

    };
}),
HISShared.directive('mensajeDeleteData', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpMensajeDelete.html'

    };
}),
/*HISShared.directive('mensajeVersion', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpMensajeVersion.html',
    };
}),
*/
HISShared.directive('mensajeUpdateData', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpMensajeUpdate.html'

    };
}),
HISShared.directive('mensajeErrorCheque', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUpMensajeErrorCheque.html'

    };
}),
HISShared.directive('mensajesErroresGlobales', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/popUps/popUpErroresGlobales.html'

    };
}),

HISShared.directive('uploadFiles', function() {
    return {
     restrict : 'E',
     scope: {
            
              entidad:'=entidad'

          },
     templateUrl : 'js/app/Shared/upload.html'

    };
}),

HISShared.directive('facturasPendientes', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Facturacion/facturasVencidasView.html',
     controller:'directivaFcaturasVencidas'

    };
}),
HISShared.directive('widgetListadoCarpetas', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/widgets/widgetCarpetaImportacion.html',
     controller:'widgetCarpetaController'

    };
}),
HISShared.directive('widgetListadoCotizacion', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/widgets/widgetCotizacion.html',
     controller:'widgetCotizacionController'

    };
}),
HISShared.directive('widgetPendienteAprobacion', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/widgets/widgetAprobacionesPendientes.html',
     controller:'widgetAprobacionesPendientesController'

    };
}),
HISShared.directive('widgetPendienteSolicitud', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/widgets/widgetSolicitudesPendientes.html',
     controller:'widgetSolicitudesPendientesController'

    };
}),
HISShared.directive('widgetPendienteCompras', function() {
    return {
     restrict : 'E',
     templateUrl : 'js/app/Shared/widgets/widgetComprasPendientes.html',
     controller:'widgetComprasPendientesController'

    };
}),
HISShared.directive("loadingIndicator", function (loadingCounts, $timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.$on("loading-started", function (e) {
                loadingCounts.enable_count++;
                //only show if longer than one sencond
                $timeout(function () {
                    if (loadingCounts.enable_count > loadingCounts.disable_count) {
                        element.css({ "display": "" });
                    }
                }, 10);
            });
            scope.$on("loading-complete", function (e) {
                loadingCounts.disable_count++;
                if (loadingCounts.enable_count == loadingCounts.disable_count) {
                    element.css({ "display": "none" });
                }
            });
        }
    };
});



HISShared.directive('mostrarAgregarDatos', function() {
    
	template = 

         '<div ng-controller="directivaMostrarAgregarDatosController">'+ 
         
					'<input class="form-control" type="text" ng-change="validarExistencia()" name="dpd{{modelo.placeholder}}" list="{{modelo.placeholder}}" placeholder="Ingrese un {{modelo.placeholder}}" ng-model="datosMostrarContacto[modelo.placeholder]" required/>'+
					'<datalist  id="{{modelo.placeholder}}">'+
					      '<option ng-repeat="datosContactos in datosContactos"> {{datosContactos.nombre}} </option>'+
				        
					'</datalist>'+
      //    '<label ng-click="crearNuevoValor()" ng-if="!existe && datosMostrarContacto.contacto != null" style="cursor: pointer;">Agregar {{datosMostrarContacto.placeholder}}</label>'+
          '<label ng-click="crearNuevoValor()" ng-if="!existe " style="cursor: pointer;">Agregar {{datosMostrarContacto.placeholder}}</label>'+
                  '</div>'

 
    return {
     restrict : 'EA',
     scope: {
              
              datosMostrarContacto:'=dato',
              modelo:'=modelo'

          },
     
     template: template
     

    };
})
