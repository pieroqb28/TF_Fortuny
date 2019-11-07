module.exports = function (db, cb) {
  global.db.define("documento_anulado", {

 	numero: {
	      type: 'text',
	},
	serie: {
	      type: 'text',
	},
	fecha: {
	      type: 'date',
	},
	usuario_id: {
	      type: 'number',
	},
	causa: {
	      type: 'text',
	},
	tipo_documento: {
	      type: 'text',
	}
 }, {
    	cache   : false
	});
  
   return cb();
};

