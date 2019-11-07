/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = function () {

	return{

		get: function(tenantId,cb) {
			var tipoAprobacionConstructor = global.db.models.tipo_aprobacion;
			tipoAprobacionConstructor.find({},function(err, listaTipoAprobacion){
				if(err){
					cb(500,{message: err});
				}else{
					if(listaTipoAprobacion){
					
						cb(200,listaTipoAprobacion);
					}else{
					 	cb(500,{message: 'NOT FOUND'});
					}
				}

			});
	
		
			
		},


	}
};
