

module.exports = function () {

	return{

		getAll:function(tenantId,cb){
			
			
			var tipoGastoConstructor = global.db.models.tipo_gasto_importacion;
						
			tipoGastoConstructor.find({},function (err,listaGastos) {

				if (err){					
				    cb(500,{message: "Existe un error en el servicio"});
				}
				else{
					
						if (listaGastos.length>0){
						
							cb(200,listaGastos)

						}else{
							 cb(404,{err: 'NO EXISTEN GASTOS'});
						}
					}
			});
		},
		

	}
}