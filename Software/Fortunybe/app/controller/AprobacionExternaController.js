
//var SolicitudCotizacionController     = require('../controller/SolicitudCotizacionController');
//var SolicitudClienteController     = require('../controller/SolicitudClienteController');
var SolicitudOrdenCompraController     = require('../controller/SolicitudOrdenCompraController');


module.exports = function () {

	return {

		responderSolictudAprobacion: function (datosAprobacion, cb) {
            bodySolicitudAprobacion={}
            bodySolicitudAprobacion.solicitud_id=datosAprobacion.idSolicitud
            bodySolicitudAprobacion.usuario_id=datosAprobacion.idUsuario
            bodySolicitudAprobacion.aprobar=Number(datosAprobacion.estado) // 0 si se rechaza 1 si se aprueba
            if(datosAprobacion.razonRechazo)
            {
                bodySolicitudAprobacion.razonRechazo=datosAprobacion.razonRechazo;
            }
			console.log('APRU');
            switch(datosAprobacion.entidad) {
               /* case 'Cotizacion':
                    {              
                        bodySolicitudAprobacion.cotizacion_id=datosAprobacion.idEntidad
                        SolicitudCotizacionController().update(datosAprobacion.idUsuario, '', datosAprobacion.idEntidad, bodySolicitudAprobacion, '', function(status,respuesta){
                            if(status!=200)
                            {
                                cb(status,respuesta);
                                
                            }
                            else
                            {
                                cb(200);
                                
                            }
                        })

                        break;
                    }*/
                case 'OrdenCompra':
                    {
                        
                        bodySolicitudAprobacion.orden_compra_id=datosAprobacion.idEntidad;
                        SolicitudOrdenCompraController().update(datosAprobacion.idUsuario, '', datosAprobacion.idEntidad, bodySolicitudAprobacion, '', function(status,respuesta){
                            if(status!=200)
                            {

                                cb(status,respuesta);
                                
                            }
                            else
                            {
                                cb(200);
                                
                            }
                        })
                        
                        break;
                    }
               /* case 'Clientes':
                    {
                        
                        bodySolicitudAprobacion.cliente_id=datosAprobacion.idEntidad
                        SolicitudClienteController().update(datosAprobacion.idUsuario, '', datosAprobacion.idEntidad, bodySolicitudAprobacion, '', function(status,respuesta){
                            if(status!=200)
                            {
                                cb(status,respuesta);
                                
                            }
                            else
                            {
                                cb(200);
                                
                            }
                        })
                        
                        break;
                    }*/ 
            }

            
            
		}
	}
};
