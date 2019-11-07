module.exports = function (db, cb) {
  global.db.define("req_compra_detalle", {  

	req_compra_id: {
	      type: 'number',
	      required: true
	},
	numero: {
	      type: 'text',
	      //required: true
	},
	pos: {
	      type: 'text',
	      //required: true
	},
	articulo_id: {
	      type: 'number',	      
	},
	descripcion: {
	      type: 'text',
	      //required: true
	},
	cantidad: {
	      type: 'number',
	      //required: true
	},
	precio_unitario: {
	      type: 'number',
	      //required: true
	},
	precio_total: {
	      type: 'number',
	      //required: true
	},	

  }, {
    	cache   : false
	});
     return cb();
};

