
// HS_Roles.js
module.exports = function (db, cb) {
	global.db.define("texto_cotizacion", {

		nombre: {
		    type: 'text',
		    required: true
		},
		texto: {
		    type: 'text',
		    required: true
		},

		categoria_id: {
		    type: 'number',
		    required: true
		}

	

   
    
}, {
    	cache   : false
	});
	return cb();
};


