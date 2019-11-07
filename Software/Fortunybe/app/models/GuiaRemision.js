module.exports = function (db, cb) {
  global.db.define("guia_remision", {

  	codigo: {
	      type: 'text',
	      required: true
	},

	factura_id: {
		type: 'number'
	},

	despacho_id: {
	      type: 'number',
	      required: true
	},
	cotizacion_id: {
	      type: 'text',
	      required: true
	},
	fecha_entrega: {
	      type: 'date'
  	},
  	serie: {
	      type: 'text',
	      required: true
	},
	numero_pedido: {
	      type: 'text',
	      required: true
	},
	punto_llegada: {
	      type: 'text',
	      
	},
	punto_partida: {
	      type: 'text',
	      
	},
	transporte_rs: {
	      type: 'text',
	      
	},
	transporte_ruc: {
	      type: 'text',
	      
	},

  }, {
    	cache   : false
	});

   return cb();
};