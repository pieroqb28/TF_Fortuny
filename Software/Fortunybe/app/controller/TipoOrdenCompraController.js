module.exports = function () {

	return{

		get: function(tenantId,cb) {


			var tipoOrdenCompraConstructor = global.db.models.tipo_orden_compra;

			tipoOrdenCompraConstructor.find({},function(err, listaTipoOrdenCompra){
				if(err){
					cb(500,{message: err});
				}else{
					if(listaTipoOrdenCompra){
					
						cb(200,listaTipoOrdenCompra);
					}else{
					 	cb(500,{message: 'NOT FOUND'});
					}
				}
			});
		},
	}
};
