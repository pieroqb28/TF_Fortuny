/**
 * HISParamController
 *
 * @description :: Server-side logic for managing Cxcpagoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var HS_Parametros = require('../models/HS_Parametros');
var HS_UsuarioController = require('../controller/HS_UsuarioController');
var HS_RolFuncionController = require('../controller/HS_RolFuncionController');
module.exports = function () {
	return {
		getAll: function (tenantId, userId, cb) {
			var paramConstructor = global.db.models.hs_parametros;
			paramConstructor.find({}, function (err, listObj) {
				if (err) return cb(500, { err: err });
				else {
					if (listObj) {
						HS_UsuarioController().getById(tenantId, userId, function (err, listUser) {
							funciones = {
								nombreParam: "funcionalidades",
								valorParam: []
							}
							funcionesOpciones = {
								nombreParam: "funcionalidadesOpciones",
								valorParam: []
							}
							db.driver.execQuery(
								"SELECT funcionalidades.modulo,funcionalidades.funcionalidad,funcionalidades.url,funcionalidades.visible FROM hs_funcionalidades as funcionalidades INNER JOIN hs_rol_x_funcionalidades as rolfuncionalidades ON funcionalidades.id=rolfuncionalidades.funcionalidad where rolfuncionalidades.rol=?;",
								[listUser[0].rol],
								function (err, listRoles) {
									for (i = 0; i < listRoles.length; i++) {
										if (listRoles[i].visible == 1) {
											funciones.valorParam.push(listRoles[i].funcionalidad);
										}
										else {
											funcionesOpciones.valorParam.push(listRoles[i].funcionalidad);
										}
									}
									listObj[listObj.length] = funciones;
									listObj[(listObj.length) + 1] = funcionesOpciones;
									cb(200, JSON.parse(JSON.stringify(listObj)));
								});
						})
					} else {
						return cb(500, { err: 'NOT FOUND' });
					}
				}
			});
		},
		getByGrupoParm: function (grupoParam, cb) {
			if (grupoParam) {
				global.db.driver.execQuery(
					"SELECT * FROM hs_parametros " +
					"WHERE hs_parametros.grupoParam = ? ",
					[grupoParam],
					function (err, params) {
						if (err) {
							console.log("Ha ocurrido un error ", err);
							cb(500, { err: err });
						} else {
							cb(200, params);
						}
					})
			} else {
				cb(500, "No se ha ingresado ningun grupo de parametro");
			}
		}
	};
}