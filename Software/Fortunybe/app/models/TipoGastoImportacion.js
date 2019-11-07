module.exports = function (db, cb) {
  global.db.define("tipo_gasto_importacion", {

 	nombre: {
	      type: 'text',
	},
	
 }, {
    	cache   : false
	});
  
   return cb();
};


