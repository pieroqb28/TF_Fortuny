module.exports = function () {

	return{

		get: function(tenantId,cb) {


			var tipoArticuloConstructor = global.db.models.tipo_articulo;

			tipoArticuloConstructor.find({},function(err, listaTipoArticulo){
				if(err){
					cb(500,{message: err});
				}else{
					if(listaTipoArticulo){
					
						cb(200,listaTipoArticulo);
					}else{
					 	cb(500,{message: 'NOT FOUND'});
					}
				}
			});
		},
	}
};
