module.exports = function (db, cb) {
  global.db.define("personal_tecnico_cotizacion_servicio", {

 	nombre_personal_tecnico: {
	      type: 'text'
	},
	cantidad: {
	      type: 'text'
	},
	cotizacion_detalle_id: {
	      type: 'text'
	}

 }, {
    	cache   : false
	});
  
   return cb();
};

