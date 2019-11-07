
// HS_Roles.js
module.exports = function (db, cb) {
	global.db.define("categoria_cotizacion", {

		categoria: {
		    type: 'text'
		    
		},	
   
    
}, {
    	cache   : false
	});
	return cb();
};


