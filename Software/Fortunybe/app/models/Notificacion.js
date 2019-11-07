module.exports = function (db, cb) {
  global.db.define("notificacion", {

 	titulo: {
	      type: 'text'
	},
	descripcion: {
	      type: 'text'
	},
	link:{
		type: 'text'
	},
	usuario_id:{
		type: 'number'
	},
	fecha:{
		type: 'date'
	}
	

 }, {
    	cache   : false
	});
  
   return cb();
};

