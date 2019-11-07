

module.exports = function () {

	return{

		getByNombre: function(nombreAlerta,cb) {
			global.db.driver.execQuery(
			"SELECT * FROM alertas"
			+" WHERE alertas.nombre=?;",
			[nombreAlerta],
			 function (err, listAlertas) { 
				if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
				}else{
					if(listAlertas){
						cb(200,listAlertas);
					}else{
					 	cb(500,{message: 'NO EXISTEN ARTICULOS'});
					}
				}
			});
		},

	}
}