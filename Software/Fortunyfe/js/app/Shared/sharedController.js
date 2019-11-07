//HISShared.controller('menuController', ['$scope', '$filter', '$rootScope', 'menuService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC','fpshotkeys', function ($scope, $filter, $rootScope, menuService, ProfileService, $cookieStore, sharedFormateoUsaSVC, Hotkeys) {
HISShared.controller('menuController', ['$scope', '$filter', '$rootScope', 'menuService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC', 'Hotkeys', 'getFEVersion' ,function ($scope, $filter, $rootScope, menuService, ProfileService, $cookieStore, sharedFormateoUsaSVC, Hotkeys,getFEVersion) {
    $scope.ini = function () {
        // Create simple hotkey object 
var hotkey = Hotkeys.createHotkey({
    key: 'f8',
    callback: function () {
      $scope.mostrarPopUpReportes("3");
    }
});
    getFEVersion.checkVersion().query(function (result){
        if (result.version !=  getFEVersion.actualVersion()){
            $('#popupMensajesVersion').modal('show');
        }

    });

    
// Register the hotkey object 
Hotkeys.registerHotkey(hotkey);

         menuService.listarMenu().query(function (result) {
             console.log(result);
            $scope.modulos = [];
           for (i = 0; i < result.length; i++) {
                var agregado = false;
                for (j = 0; j < $scope.modulos.length; j++) {
                    if (result[i].modulo === $scope.modulos[j].nombre) {
                        
                        $scope.modulos[j].funcionalidades.push(result[i]);
                        agregado = true;
                    }
                    if (agregado)
                        break;
                       
                }
                console.log("menuuuuuuu");
               
                if (agregado == false) {
                    var itemModulo = {};
                    itemModulo.nombre = result[i].modulo;
                    itemModulo.funcionalidades = [];
                    itemModulo.funcionalidades.push(result[i]);
                    $scope.modulos.push(itemModulo);
                }
            }
            var FuncionalidadesOpciones = JSON.parse(localStorage.getItem('funcionalidadesOpciones'));

            for (i = 0; i < FuncionalidadesOpciones.length; i++) {
                if (FuncionalidadesOpciones[i] == "Solo Lectura") {
                    $scope.soloLectura = true
                }
            }
         })

    }
    $scope.ini()

    $scope.cerrarSesion = function () {
        $cookieStore.remove('tokenActual');
        localStorage.removeItem('sJWT');
         localStorage.removeItem('funcionalidades');
            window.location = "/#/";

      /*  ProfileService.Perfil().delete({}, function () {
            localStorage.removeItem('sJWT');
            window.location = "/#/";
        }, function (error) {
            localStorage.removeItem('sJWT');
            localStorage.removeItem('funcionalidades');
            window.location = "/#/";
            erroresServices.controlError(error.status);
        });*/
    };
    $scope.mostrarPopUpReportes = function (valorTipoReporte) {
        $scope.tipoReporte = valorTipoReporte;
        $scope.$broadcast('eventPopupReportes', { tipoReporte: valorTipoReporte }); // se conecta con el controlador anidado reportesController en la carpeta js/app/Reportes
    }
    $scope.tipoCambioActualizar = function () {
        $scope.actualizarTC_fecha = {}
        $scope.actualizarTC_fecha.moneda = "USD"
        $scope.actualizarTC_fecha.valor_tipo_cambio = 0
        var fechaHoy = new Date()
        $scope.actualizarTC_fecha.fecha = $filter('date')(new Date(), 'dd/MM/yyyy');
        $scope.traerTipoCambio()
        $('#popupactualizarTipoCambio').modal('show');
    }
    $scope.grabarTipoCambio = function () {
        if (!$scope.actualizarTC_fecha.idExistente) {
            var grabarTipoCambio = {
                cambio: $scope.actualizarTC_fecha.valor_tipo_cambio,
                moneda: $scope.actualizarTC_fecha.moneda,
                fecha: sharedFormateoUsaSVC.fechaUsa($scope.actualizarTC_fecha.fecha)
            }

            menuService.tipoCambio().save(grabarTipoCambio, function () {
                $scope.mostrarMensajeAviso = true
                setTimeout(function () {
                    $scope.mostrarMensajeAviso = false;

                    $scope.$apply();

                }, 1000);
            })
        }
        else {
            menuService.tipoCambio().update({ id: $scope.actualizarTC_fecha.idExistente }, { cambio: $scope.actualizarTC_fecha.valor_tipo_cambio }, function () {
                $scope.mostrarMensajeAviso = true
                setTimeout(function () {
                    $scope.mostrarMensajeAviso = false;

                    $scope.$apply();

                }, 1000);
            })
        }
    }
    $scope.traerTipoCambio = function () {
        menuService.tipoCambio().query({ fecha: $scope.actualizarTC_fecha.fecha, moneda: $scope.actualizarTC_fecha.moneda }, function (resultTipoCambio) {

            if (resultTipoCambio.length > 0) {
                $scope.actualizarTC_fecha.valor_tipo_cambio = resultTipoCambio[0].cambio
                $scope.actualizarTC_fecha.idExistente = resultTipoCambio[0].id
            }
            else {
                $scope.actualizarTC_fecha.idExistente = null
                $scope.actualizarTC_fecha.valor_tipo_cambio = 0
            }


        })
    }
}])
HISShared.controller('notificacionController', ['$scope', '$filter', '$rootScope', 'menuService', 'ProfileService', 'NotificacionService', '$cookieStore', function ($scope, $filter, $rootScope, menuService, ProfileService, NotificacionService, $cookieStore) {
    $scope.updateNotifications = function () {
        $scope.notificaciones = [];
        NotificacionService.notificacionesUsuario().get(function (result) {
            for (var i = 0; i < result.length; i++) {
                $scope.notificaciones.push(result[i]);
            }
        });
    }
    $scope.updateNotifications();
    $scope.notificationAction = function (notificacionObj) {
        NotificacionService.notificacion().delete({ id: notificacionObj.id }, function (result) {
            $scope.updateNotifications();
        });
        window.location = notificacionObj.link;
    }
}])
HISShared.controller('directivaMostrarAgregarDatosController', ['$scope', '$filter', '$rootScope', 'directivaMostrarAgregarDatosServices', function ($scope, $filter, $rootScope, directivaMostrarAgregarDatosServices) {
    $scope.existe = true;
    $scope.datosContactos = {}
    $scope.cargarDatos = function () {
        $scope.datosContactos = directivaMostrarAgregarDatosServices.directivaAgregar($scope.modelo.modelo).query($scope.modelo.filtro, function (result) {
        });
    }
    $scope.validarExistencia = function () {
        $scope.existe = false;
        for (i = 0; i < $scope.datosContactos.length; i++) {
            if ($scope.datosMostrarContacto[$scope.modelo.placeholder] == $scope.datosContactos[i].nombre) {
                $scope.existe = true;
                break;
            };
        };
    }
    $scope.crearNuevoValor = function () {
        $scope.datosGuardar = {
            nombre: $scope.datosMostrarContacto[$scope.modelo.placeholder],
            tipo: $scope.modelo.placeholder
        };
        directivaMostrarAgregarDatosServices.directivaAgregar($scope.modelo.modelo).save($scope.datosGuardar, function () {
            $scope.existe = true;
            $scope.cargarDatos();
        });
    }
    $scope.cargarDatos();
}])
HISShared.controller('directivaFcaturasVencidas', ['$scope', '$rootScope', 'facturasVencidasService', function ($scope, $rootScope, facturasVencidasService) {
    $scope.ini = function () {
        $scope.regs;
        $scope.mostrarFiltros = false;
        $scope.registrationsFactVencidas = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    options.success($scope.regsFactVencidas);
                }
            },
            schema: {
                model: {
                    fields: {
                        num_factura: { type: "string", editable: false },
                        nombre_cliente: { type: "string", editable: false },
                        fecha_vencimiento: { type: "date", editable: false },
                        total_cotizacion: { type: "number", editable: false }
                    }
                }
            },
            pageSize: 10,
            Paging: true
        });
        $scope.registrationsColumnsFactVencidas = [{
            field: "num_factura",
            title: "Número"
        }, {
            field: "nombre_cliente",
            title: "Cliente"
        },
        {
            field: "fecha_vencimiento",
            title: "Fecha de Vencimiento",
            type: "date",
            format: "{0:dd/MM/yyyy}"
        }, {
            field: "total_factura",
            title: "Total"
        }, {
            command: [{ text: " ", template: '<kendo-button sprite-css-class="\'k-icon k-i-pencil\'" ng-click="mostrarFacturaVencidas(dataItem)"></kendo-button>' }]
        }
        ];
        $scope.gridOptionsFactVencidas = {
            height: 570,
            filterable: {
                mode: "row",
                operators: {
                    date: {
                        eq: "Igual a",
                        neq: "Diferente a",
                        gte: "Mayor o igual a",
                        gt: "Mayor a",
                        lte: "Menor o igual a",
                        lt: "Menor a"
                    },
                    number: {
                        eq: "Igual a",
                        neq: "Diferente a",
                        gte: "Mayor o igual a",
                        gt: "Mayor a",
                        lte: "Menor o igual a",
                        lt: "Menor a"
                    },
                    string: {
                        startswith: "Inicia con",
                        endswith: "Termina con",
                        eq: "Es igual a",
                        neq: "Es diferente a",
                        contains: "Contiene",
                        doesnotcontain: "No Contiene"
                    }
                },
                messages: {
                    and: "Y",
                    or: "O",
                    filter: "Filtrar",
                    clear: "Limpiar",
                    info: "Mostrar los valores que sean"
                }
            },
            sortable: true,
            reorderable: true,
            resizable: true,
            editable: true,
            columnMenu: {
                messages: {
                    sortAscending: "Ordenar Ascendentemente",
                    sortDescending: "Ordenar Descendentemente",
                    columns: "Columnas",
                    filter: "Filtro Especial",
                }
            },
            pageable: {
                messages: {
                    display: "{0} - {1} de {2} Registros",
                    empty: "No existen datos",
                    page: "Página",
                    of: "de {0}",
                    itemsPerPage: "Páginas",
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último",
                    refresh: "Refrescar"
                }
            }
        }
        $scope.regsFactVencidas = facturasVencidasService.factVencidas().get(function (result) {
            $("#gridFacturasVencidas .k-filter-row").hide();
            $scope.registrationsFactVencidas.read();
        }, function (error) {
        });
    }
    $scope.mostrarFacturaVencidas = function (dataItem) {
        $scope.formGrabar = {
            id: dataItem._id
        };
        window.location = "#/facturas/" + dataItem.id;
    };
    $scope.ini()
    $scope.mostrarOcultarFiltrosFactVenc = function () {
        if ($scope.mostrarFiltros) {
            $("#gridFacturasVencidas .k-filter-row").hide();
            $scope.mostrarFiltros = false;
        } else {
            $("#gridFacturasVencidas .k-filter-row").show();
            $scope.mostrarFiltros = true;
        }
    }
}])
HISShared.controller('tipoCambioController', ['$scope', '$filter', 'tipoCambioServices', 'sharedFormateoUsaSVC', function ($scope, $filter, tipoCambioServices, sharedFormateoUsaSVC) {
    $scope.$on('eventPopupTipoCambio', function (e) {
        $scope.$parent.tipo_cambio = $scope.iniTipoCambio();
    });
    $scope.iniTipoCambio = function () {
        
        if($scope.tipo_cambio_fechaII)
        {            
            $scope.tipo_cambio_fecha =$scope.tipo_cambio_fechaII 
        }
        
        $scope.tipo_cambio_fecha = $filter('date')($scope.tipo_cambio_fecha, 'dd/MM/yyyy');
        var fechaHoy = $filter('date')(new Date(), 'dd/MM/yyyy');
        
        if (fechaHoy == $scope.tipo_cambio_fecha) {
            $scope.fechaCambiarTipo = "Hoy"
        }
        else {
            $scope.fechaCambiarTipo = $scope.tipo_cambio_fecha
        }
        $scope.tipo_cambio_fecha = sharedFormateoUsaSVC.fechaUsa($scope.tipo_cambio_fecha)
        
        
        tipoCambioServices.tipoCambio().query({ moneda: $scope.tipo_cambio_moneda, fecha: $scope.tipo_cambio_fecha }, function (tipoCambioResultados) {
            if (tipoCambioResultados.length == 0) {
                $scope.existe_tipo_cambio = false
                $scope.valor_tipo_cambio = ""
                $('#popupTipoCambio').modal('show');
            }
            else {
                $scope.existe_tipo_cambio = true
                $scope.tipo_cambio_bd = tipoCambioResultados[0].cambio
            }
        })
    }
    $scope.grabarTipoCambio = function () {
        if (!$scope.valor_tipo_cambio) {
            $scope.tipo_cambio_vacio = true
        }
        else {
            tipoCambioServices.tipoCambio().save({ moneda: $scope.tipo_cambio_moneda, cambio: $scope.valor_tipo_cambio, fecha: $scope.tipo_cambio_fecha }, function (tipoCambioResultados) {
                $scope.existe_tipo_cambio = true
                $scope.tipo_cambio_bd = parseFloat(tipoCambioResultados.cambio)
                $('#popupTipoCambio').modal('hide');
            })
        }
    }
}])
HISShared.controller('widgetAprobacionesPendientesController', ['$scope','aprobacionesPendientesService', 'ProfileService',function ($scope,aprobacionesPendientesService,ProfileService) {
    $scope.regs;        
    $scope.registrationsPendientes = new kendo.data.DataSource({

        transport: {
            read: function (options) {
                options.success($scope.regsPendientes);
            }
        },
        schema: {
            model: {

                fields: {
                    id: { type: "number", editable: false },                    
                    numero: { type: "string", editable: false },
                    documento: { type: "string", editable: false },     
                    ruta: { type: "string", editable: false },

                }
            }
        },
        pageSize: 20,
        Paging: true,
    });

    $scope.registrationsColumnsPendientes = [
        
        {
            field: "numero",
            title: "Número"
        },
        {
            field: "documento",
            title: "documento"
        },
        
        
        {
            command: [{ text: " ", template: '<kendo-button sprite-css-class="\'k-icon k-i-arrowhead-e\'" ng-click="mostrardocumentoAPR(dataItem.ruta,dataItem.id)"></kendo-button>' }]
        }

    ];

    $scope.gridOptionsPendientes = {
        height: 250,
        filterable: {
            mode: "row",
            operators: {
                date: {
                    eq: "Igual a",
                    neq: "Diferente a",
                    gte: "Mayor o igual a",
                    gt: "Mayor a",
                    lte: "Menor o igual a",
                    lt: "Menor a"
                },
                number: {
                    eq: "Igual a",
                    neq: "Diferente a",
                    gte: "Mayor o igual a",
                    gt: "Mayor a",
                    lte: "Menor o igual a",
                    lt: "Menor a"
                },
                string: {
                    startswith: "Inicia con",
                    endswith: "Termina con",
                    eq: "Es igual a",
                    neq: "Es diferente a",
                    contains: "Contiene",
                    doesnotcontain: "No Contiene"
                }

            },
            messages: {
                and: "Y",
                or: "O",
                filter: "Filtrar",
                clear: "Limpiar",
                info: "Mostrar los valores que sean"
            }
        },
        sortable: true,
        reorderable: true,
        resizable: true,
        editable: true,
        columnMenu: {
            messages: {
                sortAscending: "Ordenar Ascendentemente",
                sortDescending: "Ordenar Descendentemente",
                columns: "Columnas",
                filter: "Filtro Especial",
            }
        },
        pageable: {
            messages: {
                display: "{0} - {1} de {2} Registros",
                empty: "No existen datos",
                page: "Página",
                of: "de {0}",
                itemsPerPage: "Páginas",
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último",
                refresh: "Refrescar"
            }
        }, dataBound: function (e) {
            $("#loading").fadeOut(200);
            setTimeout(
                function () {
                    $('[data-toggle="tooltip"]').tooltip();
                }
                , 100)

        }
    }

    
    $scope.regsPendientes = aprobacionesPendientesService.listaPendientes().get(function (result) {
        $("#griAprobacionesPendientes .k-filter-row").hide();
        $scope.registrationsPendientes.read();
        
    });
    $scope.validarAprobador = function (){
        var valor = 'Aprobados'
        if (localStorage.getItem("funcionalidades") === null) {
            ProfileService.Parametros().get(function(objParametros) {            
                for (i = 0; i < objParametros.length; i++) {
                    var texto = JSON.stringify(objParametros[i].valorParam)
                    localStorage.setItem(objParametros[i].nombreParam, texto);
                      var funcionPermitida = false;
                        var paramFuncionalidades = JSON.parse(localStorage.getItem('funcionalidades'));
                        for (i = 0; i < paramFuncionalidades.length; i++) {
                            if (paramFuncionalidades[i] == valor) {
                                funcionPermitida = true;
                                break;
                            }
                        }
                }
            })


        }else{

           
                var funcionPermitida = false;
                var paramFuncionalidades = JSON.parse(localStorage.getItem('funcionalidades'));
                for (i = 0; i < paramFuncionalidades.length; i++) {
                    if (paramFuncionalidades[i] == valor) {
                        funcionPermitida = true;
                        break;
                    }
                }
        }

               
           


         return funcionPermitida;
    };

    $scope.mostrardocumentoAPR=function(ruta,idDocumento)
    {
        window.location = "#ordenCompra/detalle/"+  idDocumento;
    }
}])