/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = function () {

	return{

		get: function(tenantId,cb) {
			
			var categoriaCotizacionConstructor = global.db.models.categoria_cotizacion;

			categoriaCotizacionConstructor.find({},function(err, listaCategoriaCotizacion){
				if(err){
					cb(500,{message: err});
				}else{
					if(listaCategoriaCotizacion){
					
						cb(200,listaCategoriaCotizacion);
					}else{
					 	cb(500,{message: 'NOT FOUND'});
					}
				}

			});
	
		
			
		},


	}
};
