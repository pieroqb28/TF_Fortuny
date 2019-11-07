var ReportesController     = require('../controller/ReportesController');
var InventarioController     = require('../controller/InventarioController');
var validateRolAccess     = require('../services/validateRolAcess');
var exportPDF = require('../services/exportPDF');
var exportPDFLandscape = require('../services/exportPDFLandscape');


module.exports = function (app) {

  app.route('/reporteOrderIntakeCerrar')
   .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
        ReportesController().getReporteOrderIntakeCerrar(req.tenant,req.query,function(statusCode, result){
          if(statusCode!=200)
          {
              res.status(statusCode).json(result);
          } 
          else
          {             
              res.writeHead(200, {"Content-Disposition": "inline;filename=Order Intake.xlsx",'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });              
              res.end(result, 'binary');   
          }
     
        });
            
   })

   app.route('/reporteOrderIntake')
   .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
        ReportesController().getReporteOrderIntakeLeer(req.tenant,req.query,function(statusCode, result){
          if(statusCode!=200)
          {
              res.status(statusCode).json(result);
          } 
          else
          {             
              res.writeHead(200, {"Content-Disposition": "inline;filename=Order Intake.xlsx",'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              res.end(result, 'binary');   

          }
     
        });
            
   })

    app.route('/reporteOrderBacklogCerrar')
   .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {

        ReportesController().getReporteOrderBacklogCerrar(req.tenant,req.query,function(statusCode, result){
          if(statusCode!=200)
          {
              res.status(statusCode).json(result);
          } 
          else
          {             
              res.writeHead(200, {"Content-Disposition": "inline;filename=Order Backlog.xlsx",'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              res.end(result, 'binary');   

          }
     
        });
        
        // creado para order backlog
            
   })

   app.route('/reporteOrderBacklog')
   .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
        
        ReportesController().getReporteOrderBacklogLeer(req.tenant,req.query,function(statusCode, result){
          if(statusCode!=200)
          {
              res.status(statusCode).json(result);
          } 
          else
          {             
              res.writeHead(200, {"Content-Disposition": "inline;filename=Order Backlog.xlsx",'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              res.end(result, 'binary');   

          }
     
        });
            
   })

 app.route('/getRegistroVentas')
   .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {      
        ReportesController().exportRegistroVentas(req.query.periodo,function(statusCode, result){
          if(statusCode!=200)
          {
            res.status(statusCode).json(result);
          } 
          else
          {   
            
            res.writeHead(200, {"Content-Disposition": "inline;filename=Registro Ventas.xlsx",'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            res.end(result, 'binary');   

          }
     
        });
            
   })

   app.route('/getRegistroCompras')
   .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {      
        
         ReportesController().exportRegistroCompras(req.query.periodo,req.query.porcentajeIGV,function(statusCode, result){
          if(statusCode!=200)
          {
            res.status(statusCode).json(result);
          } 
          else
          {   
            
            res.writeHead(200, {"Content-Disposition": "inline;filename=Registro Compras.xlsx",'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            res.end(result, 'binary');   

          }
     
        });
            
   })

  app.route('/Inventario/Kardex')
    .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req,res){
        var templatePDF = "kardexPDF";
        var nombrePdf = "kardex";
        InventarioController().reporteKardex(req.query, function (status,result){
          if(status==200){
             exportPDFLandscape(status,result,templatePDF,nombrePdf,function (status,result){         
                res.writeHead(status, {'Content-Type': 'application/pdf'});
                res.end(result, 'binary');    
             })
          }else{
            res.status(status).json(result);
          }
        });

    });

    app.route('/BalanceSheet')
    .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req,res){
        // creado para el balance sheet
        var templatePDF = "internalBalanceSheet";
        var nombrePDF = "internalBalanceSheet";
        ReportesController().exportBalanceSheet(req.query.tipoCambioReporte,req.query.proyectoReporte,function(status,resultData){
          if(status == 200){
            exportPDFLandscape(status,resultData,templatePDF,nombrePDF,function(status,result){
              res.writeHead(status, {"Content-Disposition": "inline;filename=BalanceSheet.pdf",'Content-Type': 'application/pdf'});
              res.end(result, 'binary');   
            })
          }else{
            res.status(status).json(result);
          }

        })
    });

    app.route('/BalanceSheetPersonal')
    .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req,res){
        
        // creado para el balance sheet para un usuario

    });

    app.route('/TimeSheet')
    .get(function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req,res){
         ReportesController().exportTimeSheet(req.query.proveedorReporte,req.query.proyectoReporte,req.query.numeroTimesheet,function(statusCode, result){
          if(statusCode!=200)
          {
            res.status(statusCode).json(result);
          } 
          else
          {   
            // res.status(statusCode).json(result);
            res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            res.end(result, 'binary');   

          }
     
        });

    });


 }