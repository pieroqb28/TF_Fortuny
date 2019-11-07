var FacturacionProveedorController     = require('../controller/FacturacionProveedorController');
/*var HS_AttachmentsController     = require('../controller/HS_AttachmentsController');*/
var validateRolAccess     = require('../services/validateRolAcess');
/*var exportPDF = require('../services/exportPDF');
var exportRAW = require('../services/exportRAW');*/
/*var toWord = require('../services/exportWord');*/
var multer = require('multer');
/*var upload = multer({ dest: 'uploads/Cotizacion/' }).single('uploadfile');*/
   
module.exports = function (app) { 

  app.route('/FacturacionProveedor')   
    .post(function(req,res,next){validateRolAccess(req,res,next)}
        ,function(req, res) {
         FacturacionProveedorController().create(req.userId,req.tenant,req.body,function(statusCode, result){
          res.status(statusCode).json(result);
          });
    })
    .get(function(req,res,next){validateRolAccess(req,res,next)}
        ,function(req, res) {
         FacturacionProveedorController().getAll(function(statusCode, result){
          res.status(statusCode).json(result);
          });
    });
  app.route('/FacturacionProveedor/:id')   
    .get(function(req,res,next){validateRolAccess(req,res,next)}
        ,function(req, res) {
         FacturacionProveedorController().getByOrdenCompra(req.tenant,req.params.id,function(statusCode, result){
          res.status(statusCode).json(result);
          });
    })
    .put(function(req,res,next){validateRolAccess(req,res,next)}
        ,function(req, res) {
         FacturacionProveedorController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
          res.status(statusCode).json(result);
          });
    });
  app.route('/detalleFacturaProveedor/:id')   

    .get(function(req,res,next){validateRolAccess(req,res,next)}
        ,function(req, res) {
         FacturacionProveedorController().getDetalle(req.tenant,req.params.id,function(statusCode, result){
          res.status(statusCode).json(result);
          });
    });
}