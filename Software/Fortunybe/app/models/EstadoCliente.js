
// HS_Roles.js
module.exports = function (db, cb) {
	global.db.define("estado_cliente", {


   
    estado: {
      type: 'text',
      required: true
    },
   
    
}, {
    	cache   : false
	});
	return cb();
};
