HISShared.factory('connStringSVC', function () {
    //var serviciosBase = "http://192.168.0.35:8051";
   var serviciosBase = "http://157.245.86.94:8052";
   // var serviciosBase = "http://buy.pronos.pe:8052";
   
    //var serviciosBase = "http://man.holinsys.net:8091";
    //var serviciosBase = "http://man.holinsys.net:8051";
    //var serviciosBase="http://olimpo.holinsys.net:8091";
    return {
        urlBase: function () {
            return serviciosBase;
        },
        getToken: function () {
            return localStorage.getItem('sJWT');
        }
    }
})
HISShared.factory('loadingCounts', function () {
    return {
        enable_count: 0,
        disable_count: 0
    }
});
HISShared.factory('getFEVersion', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        checkVersion: function () {
            return $resource(connStringSVC.urlBase() + '/VersionFE', {}, {
                query: { method: 'GET', isArray: false, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
            });
        },
        actualVersion: function () {
            return  xxversionFEActualxx;
        }
    }

    
}]);
HISShared.factory('sharedValidationsSVC', function () {
    return {
        validarRangoFecha: function (fechaInicio, fechaFin) {
            /* Extracción de los dias meses y años de cada fecha*/
            var valDiaInicio = fechaInicio.substring(0, 2);
            var valMesInicio = fechaInicio.substring(3, 5);
            var valAnioInicio = fechaInicio.substring(6, 10);
            var valDiaFin = fechaFin.substring(0, 2);
            var valMesFin = fechaFin.substring(3, 5);
            var valAnioFin = fechaFin.substring(6, 10);
            /* Fin de Extracción de los dias meses y años de cada fecha*/
            var validacionFecha = false
            if (valDiaInicio <= valDiaFin && valMesInicio <= valMesFin && valAnioInicio <= valAnioFin) {
                validacionFecha = true
            }
            return validacionFecha;
        },
        validarDinero: function (dinero) {
            var validacionDinero = true
            if (dinero <= 0) {
                validacionDinero = false
            }
            return validacionDinero;
        }
    }
});
HISShared.factory('sharedFormateoUsaSVC', function () {
    return {
        fechaUsa: function (fecha) {
            console.log(fecha)
            var valDia = fecha.substring(8, 10);console.log(valDia)
            var valMes = fecha.substring(5, 7);console.log(valMes)
            var valAnio = fecha.substring(0, 4);console.log(valAnio)
            // var fechaFormatoUsa=valMes+'/'+valDia+'/'+valAnio;
            var fechaFormatoUsa = valAnio + '-' + valMes + '-' + valDia;
            return fechaFormatoUsa
        },
        fechaFormato: function (fecha) {
            console.log(fecha)
            var valDia = fecha.getDate();
            var valMes = fecha.getMonth() + 1;
            var valAnio = fecha.getFullYear();
            var valHora = fecha.valHora(); 
            console.log("hora" , valHora)
            var fechaFormatoUsa = valAnio + '-' + valMes + '-' + valDia;
            return fechaFormatoUsa;
        }
    }
});
HISShared.factory('menuService', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        listarMenu: function () {
            return $resource(connStringSVC.urlBase() + '/HS_Menu/:id', { id: '@_id' }, {
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
            });
        },
        tipoCambio: function () {
            return $resource(connStringSVC.urlBase() + '/TipoCambio/:id', { id: '@id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
            });
        },
    }
}]);
HISShared.factory('conceptoServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        concepto: function () {
            return $resource(connStringSVC.urlBase() + '/CMConceptos/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('tipoCambioServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        tipoCambio: function () {
            return $resource(connStringSVC.urlBase() + '/TipoCambio/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('facturasVencidasService', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        factVencidas: function () {
            return $resource(connStringSVC.urlBase() + '/FacturasVencidas/:id', { id: '@_id' }, {
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
            });
        },
    }
}]);
HISShared.factory('erroresServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        controlError: function (status) {
            /* if(status==500){
            // Pop up de error de servicio generico
            }else if(status==401){
            window.location= "login.html";
            };*/
        },
    }
}]);
HISShared.factory('contactosServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        contactos: function () {
            return $resource(connStringSVC.urlBase() + '/HS_Contactos/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('bancosServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        bancos: function () {
            return $resource(connStringSVC.urlBase() + '/cmBancos/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('directivaMostrarAgregarDatosServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        directivaAgregar: function (modelo) {
            return $resource(connStringSVC.urlBase() + '/' + modelo + '/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('fileAppServices', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        obtenerArchivos: function (modelo) {
            return $resource(connStringSVC.urlBase() + '/upload/:id', { id: '@_id' }, {
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('mensajesData', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        mensajeSave: function (cb) {
            $('#popupMensajesSave').modal('show');
            setTimeout(function () {
                $('#popupMensajesSave').modal('hide');
                setTimeout(function () {
                    return cb(200);
                }, 800);
            }, 2000);
        },
        mensajeDelete: function (cb) {
            $('#popupMensajesDelete').modal('show');
            setTimeout(function () {
                $('#popupMensajesDelete').modal('hide');
                setTimeout(function () {
                    return cb(200);
                }, 800);
            }, 2000);
        },
        mensajeUpdate: function (cb) {
            $('#popupMensajesUpdate').modal('show');
            setTimeout(function () {
                $('#popupMensajesUpdate').modal('hide');
                setTimeout(function () {
                    return cb(200);
                }, 800);
            }, 2000);
        },
        mensajeErrorCheque: function (cb) {
            $('#popupMensajesErrorCheque').modal('show');
            setTimeout(function () {
                $('#popupMensajesErrorCheque').modal('hide');
                setTimeout(function () {
                    return cb(200);
                }, 800);
            }, 2000);
        },
    }
}]);
HISShared.factory('NotificacionService', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        notificacionesUsuario: function () {
            return $resource(connStringSVC.urlBase() + '/Notificacion', {}, {
                //el id del get es el id del usuario para mostrar todas las notificaciones del usuario
                get: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
        notificacion: function () {
            return $resource(connStringSVC.urlBase() + '/Notificacion/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                //los id del update y delete deben ser de la notificacion
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        }
    }
}]);
HISShared.factory('numeroSerieService', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        numeroSerie: function () {
            return $resource(connStringSVC.urlBase() + '/NumeroSerie/:id', { id: '@_id' }, {
                save: { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                query: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                get: { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                update: { method: 'PUT', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
                delete: { method: 'DELETE', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('grupoParametrosService', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        grupo: function () {
            return $resource(connStringSVC.urlBase() + '/HISParamGroup', {}, {
                query: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);
HISShared.factory('aprobacionesPendientesService', ['$resource', 'connStringSVC', function ($resource, connStringSVC) {
    return {
        listaPendientes: function () {
            return $resource(connStringSVC.urlBase() + '/listaAprobacionesPendientes', {}, {
                get: { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } }
            });
        },
    }
}]);