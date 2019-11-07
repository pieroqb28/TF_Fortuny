module.exports = function (db, cb) {
  global.db.define("carpeta_importacion_documento_detalle", {

  	documento_id: {
	      type: 'number',
	},
 	detalle: {
	      type: 'text',
	},
	total: {
	      type: 'number',
	},
	
 }, {
    	cache   : false
	});
  
   return cb();
};

