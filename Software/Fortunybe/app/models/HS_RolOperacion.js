// HS_RolFuncion.js
module.exports = function (db, cb) {
	global.db.define("hs_rol_x_operaciones", {

    operaciones: {
      type: 'number'      

    },

    rol: {
      type: 'number'
      
    },
   
    
}, {
    	cache   : false
	});
return cb();
};
