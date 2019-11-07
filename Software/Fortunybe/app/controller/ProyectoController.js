
// var Proveedor     = require('../models/Proveedor');

module.exports = function () {
	
	return {
	
		getByFiltro: function (filtro, cb) {
			console.log(filtro);
			global.db.driver.execQuery(
				"SELECT  " +
				"    proyectos.nombre, " +
				"    proyectos.id " +
				"FROM " +
				"    proyectos " +
			
				"WHERE " +
				"    nombre like  ?;"
				, ["%" + filtro + "%"]
				, function (err, listProyectos) {
					if (err) {
						console.log(err);
						cb(500, { err: "Existe un error en el servicio" });
					} else {
						cb(200,{nombre:listProyectos} );
					}
				}
			)
		}
	}
}

