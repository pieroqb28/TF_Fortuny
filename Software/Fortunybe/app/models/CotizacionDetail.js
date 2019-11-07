module.exports = function (db, cb) {
  	global.db.define("cotizacion_detalle", {

	  	cotizacion_id: {
		      type: 'number',
		      required: true
		},

		posicion: {
		      type: 'number',
		      required: true
		},
		articulo_id: {
		      type: 'number',
		      //required: true
		},
		cantidad: {
		      type: 'number',
		     // required: true
		},
		precio_unitario: {
		      type: 'number',
		     // required: true
		},
		sub_total: {
		      type: 'number',
		      required: true
		},
		precio_unitario_factor: {
		      type: 'number',
		      //required: true
		},
		sub_total_factor: {
		      type: 'number',
		      //required: true
		},
		fecha_entrega: {
		      type: 'date'
		},
		estado_aceptacion: {
		      type: 'number'
		},
		/*lugar_servicio :{
			type: 'text'
		},	
		fecha_inicio_servicio:{
			type: 'date'
		},
		fecha_fin_servicio:{
			type: 'date'
		},
		tiempo_estimado_servicio:{
			type: 'text'
		},
		solicitud_pedido_servicio:{
			type: 'text'
		},
		orden_compra_servicio :{
			type: 'text'
		},
		embarcacion_servicio:{
			type: 'text'
		},
		supervisor_servicio:{
			type: 'text'
		},*/
		descripcion_servicio:{
			type: 'text'
		},

		bloqueado:
		{
			type: 'number',
		}

	}, {
    	cache   : false
	});

	return cb();
};
