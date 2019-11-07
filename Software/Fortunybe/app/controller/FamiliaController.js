module.exports = function () {

	return {

		getFamilias: function (cb) {
			global.db.driver.execQuery(
				"SELECT  " +
				"    * " +
				"FROM " +
				"    familia_articulo " +
				"WHERE " +
				"    ISNULL(familia_articulo.id_padre) "
				, []
				, function (err, listFamilias) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (listFamilias) {
							cb(200, listFamilias);
						} else {
							cb(500, { message: 'NO EXISTEN FAMILIAS' });
						}
					}
				});
		},
		getFamiliaById: function (id, cb) {
			global.db.driver.execQuery(
				"SELECT  " +
				"    * " +
				"FROM " +
				"    familia_articulo " +
				"WHERE " +
				"    familia_articulo.id = ? "
				, [id]
				, function (err, listFamilias) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (listFamilias) {
							cb(200, listFamilias);
						} else {
							cb(500, { message: 'NO EXISTEN FAMILIAS' });
						}
					}
				});
		},
		getSubFamilias: function (idFamilia, cb) {
			global.db.driver.execQuery(
				"SELECT  " +
				"    * " +
				"FROM " +
				"    familia_articulo " +
				"WHERE " +
				"    id_padre = ?  "
				, [idFamilia]
				, function (err, listSubFamilias) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (listSubFamilias) {
							cb(200, listSubFamilias);
						} else {
							cb(500, { message: 'NO EXISTEN SUBFAMILIAS' });
						}
					}
				});
		},
		getFamiliaCompletaBySubFamiliaId: function (idSubfamilia, cb) {
			global.db.driver.execQuery(
				" (SELECT "+ 
					" * "+
				" FROM "+
					" familia_articulo "+
				" WHERE "+
					" ISNULL(id_padre) "+
						" AND id = (SELECT "+ 
							" id_padre "+
						" FROM "+
							" familia_articulo "+
						" WHERE "+
							" familia_articulo.id = ?)) UNION (SELECT "+ 
					" * "+
				" FROM "+
					" familia_articulo "+
				" WHERE "+
					" familia_articulo.id = ?) "
				, [idSubfamilia,idSubfamilia]
				, function (err, listCompleteFamily) {
					if(err){
						cb(500,{err:err});
					}else{
						if (listCompleteFamily) {
							cb(200, listCompleteFamily);
						} else {
							cb(500, { message: 'NO EXISTEN FAMILIAS O SUBFAMILIAS' });
						}
					}
				}
			);
		}

	}
}