/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = function () {

	return{

		get: function(tenantId,cb) {
			
			var estadoClienteConstructor = global.db.models.estado_cliente;

			estadoClienteConstructor.find({},function(err, listaEstadoCliente){
				if(err){
					cb(500,{message: err});
				}else{
					if(listaEstadoCliente){
					
						cb(200,listaEstadoCliente);
					}else{
					 	cb(500,{message: 'NOT FOUND'});
					}
				}

			});
	
		
			
		},


	}
};
