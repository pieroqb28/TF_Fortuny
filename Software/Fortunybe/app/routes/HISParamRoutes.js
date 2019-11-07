/**
 * HISParamRoutes.js
 *
 * @description :: Server-side logic for managing CxCPagoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var HS_ParamController = require('../controller/HS_ParamController');
var HS_AutenticarController = require('../controller/HS_AutenticarController');
var validateRolAccess = require('../services/validateRolAcess');
module.exports = function (app) {
	app.route('/HISParam')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			HS_ParamController().getAll(req.tenant, req.userId, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
	app.route('/HISParamGroup')
		.get(function(req,res,next){validateRolAccess(req,res,next)}
		,function(req,res){
			HS_ParamController().getByGrupoParm(req.query.grupoParam,function(statusCode,result){
				res.status(statusCode).json(result);
			})
		});
}