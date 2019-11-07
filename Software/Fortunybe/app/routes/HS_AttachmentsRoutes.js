
var validateRolAccess = require('../services/validateRolAcess');
var HS_AttachmentsController = require('../controller/HS_AttachmentsController');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' }).single('uploadfile');
var fs = require("fs");


module.exports = function (app) {

  app.route('/upload/:id')


    .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
      // req.file is the `avatar` file

      HS_AttachmentsController().getOne(req.tenant, req.params.id, function (stat, result) {
        if (stat != 200) {
          res.status(500).json(result);
        } else {
          if (result) {
            fs.unlink(result.ruta + result.internalFilename, function (errFile) {
              if (errFile)
                res.status(500).json(errFile);
              else {
                HS_AttachmentsController().delete(req.tenant, {
                  id: req.params.id
                }, function (statusCode, result) {

                  res.status(200).json(result);
                })
              }
            })
          } else {
            res.status(404).json(result);
          }
        }
      });



      // Everything went fine
      // req.body will hold the text fields, if there were any
    })

  app.route('/upload')
    .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
      // req.file is the `avatar` file

      HS_AttachmentsController().get(req.tenant, req.query.entidad, req.query.idEntidad, function (statuscode, result) {
        if (statuscode != 200) {
          res.status(statuscode).json(result);
        } else
          res.status(200).json(result);
      })

      // req.body will hold the text fields, if there were any
    })


  app.route('/Cotizacion_Attachment/upload')
    .post(function (req, res) {

      upload(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          res.status(500).json(err);
        } else {

          HS_AttachmentsController().post(req.tenant, req.userId, req.query.numero, {
            filename: req.file.originalname,
            internalFilename: req.file.filename,
            tipoEntidad: 'Cotizacion_Attachment',
            ruta: req.file.destination,
            size: req.file.size,
            contentType: req.file.mimetype

          }, function (returCode, result) {
            res.status(returCode).json(result);
          })

        }

        // Everything went fine
      })
      // req.body will hold the text fields, if there were any
    })

  app.route('/OrdenCompra_Attachment/upload')

    .post(function (req, res) {

      upload(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          res.status(500).json(err);
        } else {


          HS_AttachmentsController().post(req.tenant, req.userId, req.query.numero, {
            filename: req.file.originalname,
            internalFilename: req.file.filename,
            tipoEntidad: 'OrdenCompra_Attachment',
            ruta: req.file.destination,
            size: req.file.size,
            contentType: req.file.mimetype

          }, function (returCode, result) {
            res.status(returCode).json(result);
          })

        }

        // Everything went fine
      })
      // req.body will hold the text fields, if there were any
    })
      app.route('/reqCompra_Attachment/upload')

    .post(function (req, res) {

      upload(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          res.status(500).json(err);
        } else {


          HS_AttachmentsController().post(req.tenant, req.userId, req.query.numero, {
            filename: req.file.originalname,
            internalFilename: req.file.filename,
            tipoEntidad: 'reqCompra_Attachment',
            ruta: req.file.destination,
            size: req.file.size,
            contentType: req.file.mimetype

          }, function (returCode, result) {
            res.status(returCode).json(result);
          })

        }

        // Everything went fine
      })
      // req.body will hold the text fields, if there were any
    })

}