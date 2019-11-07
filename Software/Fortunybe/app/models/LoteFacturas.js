module.exports = function (db, cb) {
  global.db.define("lote_facturas", {

  	despacho_id: {
	      type: 'number',
	      required: true
	},
	facturas_creadas: {
	      type: 'number',
	},

	facturas_impresas: {
	      type: 'number',
	},

  }, {
    	cache   : false
	});
  
   return cb();
};