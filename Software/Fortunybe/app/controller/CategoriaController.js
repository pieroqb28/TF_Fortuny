module.exports = function () {
	
	return {

		getByFiltro: function (filtro, cb) {
			console.log(filtro);
			global.db.driver.execQuery(
				"SELECT  " +
				"    categoria.nombre, " +
				"    categoria.id " +
				"FROM " +
				"    categoria " +
			
				"WHERE " +
				"    nombre like  ?;"
				, ["%" + filtro + "%"]
				, function (err, listCategoria) {
					if (err) {
						console.log(err);
						cb(500, { err: "Existe un error en el servicio" });
					} else {
						cb(200,{nombre:listCategoria});
					}
				}
			)
		}
	}
}

