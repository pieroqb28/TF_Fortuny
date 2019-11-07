
var HS_AutenticarController = require('./HS_AutenticarController');
var async = require('async');
var nodemailer = require('nodemailer');

// var urlBaseEnvioEmailFront= global.localsfeurl ;
//var urlBaseEnvioEmailBack=global.localsbeurl ;


module.exports = function () {
    function create(body, cb) {
        var notificacionConstructor = global.db.models.notificacion;
        var notificacionAcrear = {
            titulo: body.titulo,
            descripcion: body.descripcion,
            link: body.link,
            usuario_id: body.usuario_id,
            fecha: new Date()
        };
        notificacionConstructor.create(notificacionAcrear, function (err, objNotificacion) {
            if (err) {
                cb(500, { message: "Existe un error en el servicio" });
            } else {
                if (objNotificacion) {
                    cb(200, objNotificacion);
                } else {
                    cb(500, { message: "Existe un error en el servicio" });
                }
            }
        })
    }
    return {
             reenviarnotificacion: function (solicitudId, cb) {
            global.db.driver.execQuery(
                "SELECT " +
                "hs_usuario.id, hs_usuario.nombres,hs_usuario.correo usuario_correo,hs_usuario.rol usuario_rol " +
                "FROM " +
                "hs_usuario " +
                "JOIN " +
                "hs_usuario_x_grupo_aprobacion ON hs_usuario.id = hs_usuario_x_grupo_aprobacion.usuario_id " +
                "WHERE " +
                "hs_usuario_x_grupo_aprobacion.grupo_id = (SELECT " +
                "GA.id grupoId " +
                "FROM " +
                "solicitud_aprobacion SA " +
                "INNER JOIN " +
                "tipo_aprobacion TA on TA.ID = SA.tipo_aprobacion_id and ta.clase= 'OC' " +
                "INNER JOIN " +
                "grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id " +
                "WHERE " +
                "SA.entidad_id = ? " +
                "ORDER BY GA.orden ASC " +
                "LIMIT 0 , 1) "
                , [solicitudId]
                , function (err, objaNotificar) {
                    global.db.driver.execQuery(
                        "SELECT " +
                        "orden_compra.estado_id, " +
                        "SA.id AS solicitud_id, " +
                        "GA.nombre AS GrupoNombre, " +
                        "GA.permitir_notificaciones AS notificacionP, " +
                        "TP.nombre AS TipoNombre, " +
                        "SA.entidad_id, " +
                        "TP.clase AS TipoId, " +
                        
                        " orden_compra.numero  as documento_numero, " +
                        "orden_compra.tipo_id as tipo_orden_compra ," +

                        " ifnull(orden_compra.notas,'') as texto_extra, " +
                        " centro_costo.nombre as CC, " +
                        " ifnull(concat(hu.nombres, ' ', hu.apellidos), '') as solicitante " +

                        "FROM " +
                        "orden_compra  " +
                        "INNER JOIN " +     
                        "solicitud_aprobacion SA ON (orden_compra.id = SA.entidad_id ) " +
                      
                         "LEFT JOIN " +
                        "tipo_aprobacion TP ON   TP.clase = 'OC' " +
                      

                        "INNER JOIN " +
                        "grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id and GA.tipo_aprobacion_id = TP.id  " +
                      
                       
                        "LEFT JOIN " +
                        "req_compra RC ON RC.id = orden_compra.req_compra_id " +
                        "LEFT JOIN " +
                        "hs_usuario HU ON RC.usuario_creacion = hu.id " +
                        "LEFT JOIN " +
                        "centro_costo ON (centro_costo.id = orden_compra.centro_costo_id  AND TP.clase = 'OC') " +
                       "WHERE " +
                        "orden_compra.estado_id = 3 AND orden_compra.id = ? " +
                        "ORDER BY GA.orden ASC " +
                        "LIMIT 0 , 1 "
                        , [solicitudId]
                        , function (err, objDataNotificar) {
                            if (err) {

                                    cb(500, { message: err});
                            }else{
                            if (objDataNotificar.length > 0) {
                                if (objDataNotificar[0].notificacionP != 0) {
                                  
                                        var link = ""
                                        var linkReportes=""

                                        link = "#/ordenCompra/detalle/"
                                        linkReportes="OrdenCompra";
                                        titulo_email="Orden de Compra"
                                      

                                    async.each(objaNotificar, function (datosNotificacion, callback) {
                                              HS_AutenticarController().createToken(1, datosNotificacion.id, "", datosNotificacion.usuario_rol, function (retToken) {

                                                        var transporter = nodemailer.createTransport({
                                                            service: 'Gmail',
                                                            auth: {
                                                                user: global.localsemailuser,
                                                                pass: global.localsemailpass
                                                            }
                                                        });
                                                        var objREF;
                                                        var html_email_reporte=""
                                                        var html_email = '<div style="background: #f0f0f0;font-family: roboto;text-align: center;color: #333333;padding-botton:2em; padding-top:1em">'
                                                            + ' <section style="padding-bottom: 2em;">'

                                                            + '     <div style="width: 70%;margin-left: auto;margin-right: auto;background: white;border-radius: 0.5em;padding-bottom: 3em;">'

                                                            + '      <div style="background-position: center; background-image: url(\''+ global.localsfeurl  +'/img/logoEmpresa.png\');height: 4em; background-size: contain; background-repeat: no-repeat; background-color:#303C49; "  ></div'
                                                            + '         <div style="background-color: #303C49;color: white;height: 3.5em;padding-bottom: 0.5em;">'
                                                            + '             <h2 style="margin-top: 0px;"> Solicitud de Aprobación</h2>'

                                                            + '         </div>'
                                                            + '         <p style=" background-color: #E40045; width: 100%;height: 0.2em;margin-bottom: 0;"></p>'

                                                            
                                                            + '         <div style="padding-left: 0.5em;padding-right: 0.5em;">'
                                                            + '              <p><strong>' + datosNotificacion.nombres + '</strong> Tienes una solicitud de aprobación.</p>'
                                                            + '              <p> ' + titulo_email +' ' + objDataNotificar[0].documento_numero + '</p>'
                                                            + '         </div>'
                                                            + '         <div>'
                                                            if(objDataNotificar[0].TipoId=='COTIZACION')
                                                            {

                                                                html_email_reporte= '<a href="' + global.localsbeurl  + '/'+ linkReportes +'/Export/'+objDataNotificar[0].entidad_id+'?header=' + retToken + '&showExWork=false"> ver Reporte<a>';
                                                             
                                                            }
                                                            if(objDataNotificar[0].TipoId=='OC')
                                                            {
                                                                html_email_reporte= '<a href="' + global.localsbeurl  + '/'+ linkReportes +'/Export/'+objDataNotificar[0].entidad_id+'?header=' + retToken + '&type='+ objDataNotificar[0].tipo_orden_compra +'"> Ver Reporte<a><br/>'
                                                                html_email_reporte += '<a href="' + global.localsfeurl  + '/prueba.html#/ordenCompra/detalle/'+objDataNotificar[0].entidad_id+'"> Ir al Sistema<a><br/>'
                                                                html_email_reporte += '<b>Notas:</b><br/> ' + objDataNotificar[0].texto_extra + '<br/>';
                                                                html_email_reporte += '<b>CC:</b><br/> ' + objDataNotificar[0].CC + '<br/>';
                                                                html_email_reporte += '<b>Solicitante:</b><br/> ' + objDataNotificar[0].solicitante + '<br/>';

                                                                objREF = ' - OC: ' + objDataNotificar[0].documento_numero;
                                                            }
                                                           var html_email_inferior= '<div style="margin-top: 25px;">'
                                                            + '         <a href="'+ global.localsfeurl  +'/index.html#/aprobacionesExternas/'+retToken+'/'+ linkReportes +'/'+ objDataNotificar[0].entidad_id +'/'+ datosNotificacion.id +'/'+ objDataNotificar[0].solicitud_id +'/1" style="background-color: #2780e3;padding-left:15px;padding-right: 15px;padding-bottom:8px;padding-top:8px;color: white;border-radius: 5px;text-decoration: none;width: 50px;"> Aprobar<a>'
                                                            + '         <a href="' + global.localsfeurl  + '/index.html#/aprobacionesExternas/'+retToken+'/'+ linkReportes +'/'+ objDataNotificar[0].entidad_id +'/'+ datosNotificacion.id +'/'+ objDataNotificar[0].solicitud_id +'/0" style="background-color: #2780e3;padding-left:15px;padding-right: 15px;padding-bottom: 8px;padding-top: 8px;color: white;border-radius: 5px;text-decoration: none;width: 50px;"> Rechazar<a>'
                                                            + '           </div>'
                                                            + '           </div>'
                                                            + '         </div>'
                                                            + '     </div>'
                                                            + ' </section>'
                                                            + '</div>'
                                                        mailText = html_email + html_email_reporte +html_email_inferior
                                                        htmlmailText = html_email + html_email_reporte +html_email_inferior

                                                        var mailOptions = {
                                                            from: 'PRONOS Buy <'+  global.localsemailuser+ '>', // sender address
                                                            to: datosNotificacion.usuario_correo, // list of receivers
                                                            subject: 'PRONOS Buy - Solicitud de aprobación' + objREF, // Subject line
                                                            text: mailText, // plaintext body
                                                            html: htmlmailText // html body
                                                        };

                                                        // send mail with defined transport object
                                                        transporter.sendMail(mailOptions, function (error, info) {
                                                            if (error) {

                                                                callback(500, { message: 'NOT EMAILED' });
                                                                console.log("error al grabar")
                                                            }
                                                            else {
                                                                callback(null, {});
                                                            }


                                                        }); //END SENDEMAIL


                                               })  //END CREATE TOKEN
      
                                    }, function (errSG) {
                                        if (errSG) {
                                            cb(500, { message: errSG, code: '2003' });
                                        } else {
                                            cb(200, {});
                                        }
                                    });  // END ASYNC EACH
                                
                                }else{
                                 cb(500, { message: 'No es notificable'});
                                }
                            }else{
                                 cb(500, { message: 'No hay solicitudes por aprobar'});
                            } // ENDN NOTIFICAR LENTH >0
                        }// End cheack error

                        }); //close second query
                    }); //close first



        },



        getByUser: function (userId, cb) {
            global.db.driver.execQuery(
                "select" +
                " id, titulo, descripcion, link, usuario_id, fecha" +
                " from notificacion" +
                " where usuario_id = ?" +
                " order by (fecha) DESC", [userId],
                function (err, listaNotificaciones) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (listaNotificaciones) {
                            cb(200, listaNotificaciones);
                        } else {
                            cb(500, { message: 'NO EXISTEN NOTIFICACIONES' });
                        }
                    }
                });
        },
        create: function (body, cb) {

            var notificacionConstructor = global.db.models.notificacion;
            var notificacionAcrear = {
                titulo: body.titulo,
                descripcion: body.descripcion,
                link: body.link,
                usuario_id: body.usuario_id,
                fecha: new Date()
            };
            notificacionConstructor.create(notificacionAcrear, function (err, objNotificacion) {
                if (err) {
                    cb(500, { message: "Existe un error en el servicio" });
                } else {
                    if (objNotificacion) {
                        cb(200, objNotificacion);
                    } else {
                        cb(500, { message: "Existe un error en el servicio" });
                    }
                }
            })

        },
        update: function (notificacionId, toUpdate, cb) {
            var notificacionConstructor = global.db.models.notificacion;
            notificacionConstructor.get(notificacionId, function (err, objeto) {
                if (err) {
                    cb(500, { message: "Existe un error en el servicio" });
                } else if (objeto) {
                    var datosAGrabar = {
                        titulo: toUpdate.titulo,
                        descripcion: toUpdate.descripcion,
                        link: toUpdate.link,
                        usuario_id: toUpdate.usuario_id,
                        fecha: new Date()
                    };
                    objeto.save(datosAGrabar, function (err) {
                        if (err) {
                            cb(500, { message: "Existe un error en el Servicio" });
                        } else {
                            cb(200, {});
                        }

                    });
                } else {
                    cb(404, { message: 'La notificacion no existe.' });
                }
            });
        },
        delete: function (notificacionId, cb) {
            var notificacionConstructor = global.db.models.notificacion;
            notificacionConstructor.find({ id: notificacionId }).remove(function (err) {
                if (err) {
                    cb(500, { message: "No se ha podido eliminar la notificacion" });
                } else {
                    cb(200, {});
                }
            });
        },
        notificaciondeAprobacion: function (solicitudId, cb) {

          
            global.db.driver.execQuery(
                "SELECT " +
                "hs_usuario.id, hs_usuario.nombres,hs_usuario.correo usuario_correo,hs_usuario.rol usuario_rol " +
                "FROM " +
                "hs_usuario " +
                "JOIN " +
                "hs_usuario_x_grupo_aprobacion ON hs_usuario.id = hs_usuario_x_grupo_aprobacion.usuario_id " +
                "WHERE " +
                "hs_usuario_x_grupo_aprobacion.grupo_id = (SELECT " +
                "GA.id grupoId " +
                "FROM " +
                "solicitud_aprobacion SA " +
                "INNER JOIN " +
                "grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id " +
                "LEFT JOIN " +
                "aprobacion AP ON SA.id = AP.solicitud_id " +
                "AND AP.grupoAprobacion_id = GA.id " +
                "WHERE " +
                "SA.estado_id = 1 AND SA.id = ? " +
                "AND AP.grupoAprobacion_id IS NULL " +
                "ORDER BY GA.orden ASC " +
                "LIMIT 0 , 1) "
                , [solicitudId]
                , function (err, objaNotificar) {
                    global.db.driver.execQuery(
                        "SELECT " +
                        "GA.nombre AS GrupoNombre, " +
                        "GA.permitir_notificaciones AS notificacionP, " +
                        "TP.nombre AS TipoNombre, " +
                        "SA.entidad_id, " +
                        "TP.clase AS TipoId, " +
                        "IF(TP.clase = 'CLIENTE', " +
                        "cliente.numero_cliente, " +
                        "IF(TP.clase = 'COTIZACION', " +
                        "cotizacion.numero, " +
                        "IF(TP.clase = 'OC', orden_compra.numero, 0))) as documento_numero, " +
                        "IF(TP.clase = 'OC', orden_compra.tipo_id, 0) as tipo_orden_compra ," +

                        "IF(TP.clase = 'OC', ifnull(orden_compra.notas,''), '') as texto_extra, " +
                        "IF(TP.clase = 'OC', centro_costo.nombre, '') as CC, " +
                        "IF(TP.clase = 'OC', ifnull(concat(hu.nombres, ' ', hu.apellidos), ''),'') as solicitante " +

                        "FROM " +
                        "solicitud_aprobacion SA " +
                        "INNER JOIN " +
                        "grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id " +
                        "LEFT JOIN " +
                        "aprobacion AP ON SA.id = AP.solicitud_id " +
                      
                        "AND AP.grupoAprobacion_id = GA.id " +
                        "LEFT JOIN " +
                        "tipo_aprobacion TP ON GA.tipo_aprobacion_id = TP.id " +
                        "LEFT JOIN " +
                        "cliente ON (cliente.id = SA.entidad_id AND TP.clase = 'CLIENTE') " +
                        "LEFT JOIN " +
                        "cotizacion ON (cotizacion.id = SA.entidad_id AND (TP.clase = 'COTIZACION')) " +
                        "LEFT JOIN " +
                        "orden_compra ON (orden_compra.id = SA.entidad_id AND TP.clase = 'OC') " +
                        "LEFT JOIN " +
                        "req_compra RC ON RC.id = orden_compra.req_compra_id " +
                        "LEFT JOIN " +
                        "hs_usuario HU ON RC.usuario_creacion = hu.id " +
                        "LEFT JOIN " +
                        "centro_costo ON (centro_costo.id = orden_compra.centro_costo_id  AND TP.clase = 'OC') " +
                       "WHERE " +
                        "SA.estado_id = 1 AND SA.id = ? " +
                        "AND AP.grupoAprobacion_id IS NULL " +
                        "ORDER BY GA.orden ASC " +
                        "LIMIT 0 , 1 "
                        , [solicitudId]
                        , function (err, objDataNotificar) {
                            if (err) {
                                console.log(err);
                            }
                            if (objDataNotificar.length > 0) {
                                if (objDataNotificar[0].notificacionP != 0) {
                                    var link = ""
                                    var linkReportes=""
                                    switch (objDataNotificar[0].TipoId) {
                                        case 'CLIENTE': {
                                            link = "#/clientes/";
                                            linkReportes="Clientes";
                                            titulo_email="Cliente"
                                            break;
                                        }
                                        case 'COTIZACION': {
                                            link = "#/cotizaciones/detalle/";
                                            linkReportes="Cotizacion";
                                            titulo_email="Cotización"
                                            break;
                                        }
                                        case 'OC': {
                                            link = "#/ordenCompra/detalle/"
                                            linkReportes="OrdenCompra";
                                            titulo_email="Orden de Compra"
                                            break;
                                        }
                                     /*   case 4: {
                                            link = "#/cotizacionServicios/Detalle/";
                                            titulo_email="Cotización de Servicios"                                            
                                            break;
                                        }*/
                                    }


                                    async.each(objaNotificar, function (datosNotificacion, callback) {

                                        create({
                                            titulo: objDataNotificar[0].TipoNombre,
                                            descripcion: "Han solicitado a su grupo de aprobación verificar el documento " + objDataNotificar[0].documento_numero,
                                            link: link + objDataNotificar[0].entidad_id,
                                            usuario_id: datosNotificacion.id,
                                            fecha: new Date()
                                        }
                                            , function (status, result) {
                                                if (status != 200) {
                                                    callback(500, "Ocurrio un error al generar las notificaciones");
                                                } else {


                                                    HS_AutenticarController().createToken(1, datosNotificacion.id, "", datosNotificacion.usuario_rol, function (retToken) {

                                                        var transporter = nodemailer.createTransport({
                                                            service: 'Gmail',
                                                            auth: {
                                                                user: global.localsemailuser,
                                                                pass: global.localsemailpass
                                                            }
                                                        });
                                                        var objREF;
                                                        var html_email_reporte=""
                                                        var html_email = '<div style="background: #f0f0f0;font-family: roboto;text-align: center;color: #333333;padding-botton:2em; padding-top:1em">'
                                                            + '	<section style="padding-bottom: 2em;">'

                                                            + '		<div style="width: 70%;margin-left: auto;margin-right: auto;background: white;border-radius: 0.5em;padding-bottom: 3em;">'

                                                            + '		 <div style="background-position: center; background-image: url(\''+ global.localsfeurl  +'/img/logoEmpresa.png\');height: 4em; background-size: contain; background-repeat: no-repeat; background-color:#303C49; "  ></div'
                                                            + '	  		<div style="background-color: #303C49;color: white;height: 3.5em;padding-bottom: 0.5em;">'
                                                            + '				<h2 style="margin-top: 0px;"> Solicitud de Aprobación</h2>'

                                                            + '			</div>'
                                                            + ' 		<p style=" background-color: #E40045; width: 100%;height: 0.2em;margin-bottom: 0;"></p>'

                                                            
                                                            + '			<div style="padding-left: 0.5em;padding-right: 0.5em;">'
                                                            + '              <p><strong>' + datosNotificacion.nombres + '</strong> Tienes una solicitud de aprobación.</p>'
                                                            + '              <p> ' + titulo_email +' ' + objDataNotificar[0].documento_numero + '</p>'
                                                            + '			</div>'
                                                            + '         <div>'
                                                            if(objDataNotificar[0].TipoId=='COTIZACION')
                                                            {

                                                                html_email_reporte= '<a href="' + global.localsbeurl  + '/'+ linkReportes +'/Export/'+objDataNotificar[0].entidad_id+'?header=' + retToken + '&showExWork=false"> ver Reporte<a>';
                                                             
                                                            }
                                                            if(objDataNotificar[0].TipoId=='OC')
                                                            {
                                                                html_email_reporte= '<a href="' + global.localsbeurl  + '/'+ linkReportes +'/Export/'+objDataNotificar[0].entidad_id+'?header=' + retToken + '&type='+ objDataNotificar[0].tipo_orden_compra +'"> Ver Reporte<a><br/>'
                                                                html_email_reporte += '<a href="' + global.localsfeurl  + '/prueba.html#/ordenCompra/detalle/'+objDataNotificar[0].entidad_id+'"> Ir al Sistema<a><br/>'
                                                                html_email_reporte += '<b>Notas:</b><br/> ' + objDataNotificar[0].texto_extra + '<br/>';
                                                                html_email_reporte += '<b>CC:</b><br/> ' + objDataNotificar[0].CC + '<br/>';
                                                                html_email_reporte += '<b>Solicitante:</b><br/> ' + objDataNotificar[0].solicitante + '<br/>';

                                                                objREF = ' - OC: ' + objDataNotificar[0].documento_numero;
                                                            }
                                                           var html_email_inferior= '<div style="margin-top: 25px;">'
                                                            + '         <a href="'+ global.localsfeurl  +'/index.html#/aprobacionesExternas/'+retToken+'/'+ linkReportes +'/'+ objDataNotificar[0].entidad_id +'/'+ datosNotificacion.id +'/'+ solicitudId +'/1" style="background-color: #2780e3;padding-left:15px;padding-right: 15px;padding-bottom:8px;padding-top:8px;color: white;border-radius: 5px;text-decoration: none;width: 50px;"> Aprobar<a>'
                                                            + '         <a href="' + global.localsfeurl  + '/index.html#/aprobacionesExternas/'+retToken+'/'+ linkReportes +'/'+ objDataNotificar[0].entidad_id +'/'+ datosNotificacion.id +'/'+ solicitudId +'/0" style="background-color: #2780e3;padding-left:15px;padding-right: 15px;padding-bottom: 8px;padding-top: 8px;color: white;border-radius: 5px;text-decoration: none;width: 50px;"> Rechazar<a>'
                                                            + '           </div>'
                                                            + '           </div>'
                                                            + '			</div>'
                                                            + '		</div>'
                                                            + '	</section>'
                                                            + '</div>'
                                                        mailText = html_email + html_email_reporte +html_email_inferior
                                                        htmlmailText = html_email + html_email_reporte +html_email_inferior

                                                        var mailOptions = {
                                                            from: 'PRONOS Buy <'+  global.localsemailuser+ '>', // sender address
                                                            to: datosNotificacion.usuario_correo, // list of receivers
                                                            subject: 'PRONOS Buy - Solicitud de aprobación' + objREF, // Subject line
                                                            text: mailText, // plaintext body
                                                            html: htmlmailText // html body
                                                        };

                                                        // send mail with defined transport object
                                                        transporter.sendMail(mailOptions, function (error, info) {
                                                            if (error) {

                                                                callback(500, { message: 'NOT EMAILED' });
                                                                console.log("error al grabar")
                                                            }
                                                            else {
                                                                callback(200, {});
                                                            }


                                                        });


                                                    })

                                                }
                                            }
                                        );


                                    }, function (errSG) {
                                        if (errSG) {
                                            cb(500, { message: errSG, code: '2003' });
                                        } else {
                                            cb(200, { creados: '' });
                                        }
                                    });















                                }
                            } 


                            else {
                                global.db.driver.execQuery(
                                    "SELECT  " +
                                    "SA.entidad_id,  " +
                                    "TP.clase  AS TipoId, SA.estado_id, " +
                                    "IF(TP.clase = 'CLIENTE',  " +
                                    "cliente.numero_cliente,  " +
                                    "IF(TP.clase = 'COTIZACION',  " +
                                    "cotizacion.numero,  " +
                                    "IF(TP.clase = 'OC', orden_compra.numero, 0))) AS documento_numero,  " +
                                    "IF(TP.clase = 'CLIENTE',  " +
                                    "cliente.usuario_creacion,  " +
                                    "IF(TP.clase = 'COTIZACION',  " +
                                    "cotizacion.usuario_creacion,  " +
                                    "IF( TP.clase = 'OC' ,  " +
                                    "orden_compra.usuario_creacion,  " +
                                    "0))) AS creador_id  " +
                                    "FROM  " +
                                    "solicitud_aprobacion SA  " +
                                    "INNER JOIN  " +
                                    "grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id  " +

                                    "LEFT JOIN " +
                                    "tipo_aprobacion TP ON GA.tipo_aprobacion_id = TP.id " +

                                    "LEFT JOIN  " +
                                    "aprobacion AP ON SA.id = AP.solicitud_id  " +
                                    "LEFT JOIN  " +
                                    "cliente ON (cliente.id = SA.entidad_id AND TP.clase = 'CLIENTE')  " +
                                    "LEFT JOIN  " +
                                    "cotizacion ON (cotizacion.id = SA.entidad_id  " +
                                    "AND ( TP.clase = 'COTIZACION'))  " +
                                    "LEFT JOIN  " +
                                    "orden_compra ON (orden_compra.id = SA.entidad_id  " +
                                    "AND  TP.clase = 'CLIENTE')  " +
                                    "WHERE  " +
                                    "(SA.estado_id = 2 OR SA.estado_id = 3) AND SA.id = ?  " +
                                    "LIMIT 0 , 1  "
                                    , [solicitudId]
                                    , function (err, objNotificarPropietario) {
                                        if (err) {
                                            cb(500, { err: err });
                                        } else {
                                            var link = ""
                                            switch (objNotificarPropietario[0].TipoId) {
                                                case 'CLIENTE': {
                                                    link = "#/clientes/"
                                                    break;
                                                }
                                                case 'COTIZACION': {
                                                    link = "#/cotizaciones/detalle/"
                                                    break;
                                                }
                                                case 'OC': {
                                                    link = "#/ordenCompra/detalle/"
                                                    break;
                                                }
                                                case 'COTIZACION2': {
                                                    link = "#/cotizacionServicios/Detalle/"
                                                    break;
                                                }
                                            }
                                            if (objNotificarPropietario[0].estado_id == 2) {
                                                create({
                                                    titulo: "Aprobación de Documento",
                                                    descripcion: "El documento " + objNotificarPropietario[0].documento_numero + " ha sido aprobado, puede revisarlo haciendo click en el siguiente botón",
                                                    link: link + objNotificarPropietario[0].entidad_id,
                                                    usuario_id: objNotificarPropietario[0].creador_id,
                                                    fecha: new Date()
                                                }
                                                    , function (status, result) {
                                                        if (status != 200) {
                                                            cb(500, "Ocurrio un error al generar las notificaciones");
                                                        } else {
                                                            cb(200, result);
                                                        }
                                                    }
                                                );
                                            } else {
                                                create({
                                                    titulo: "Rechazo de Documento",
                                                    descripcion: "El documento " + objNotificarPropietario[0].documento_numero + " ha sido rechazado, puede revisarlo haciendo click en el siguiente botón",
                                                    link: link + objNotificarPropietario[0].entidad_id,
                                                    usuario_id: objNotificarPropietario[0].creador_id,
                                                    fecha: new Date()
                                                }
                                                    , function (status, result) {
                                                        if (status != 200) {
                                                            cb(500, "Ocurrio un error al generar las notificaciones");
                                                        } else {
                                                            cb(200, result);
                                                        }
                                                    }
                                                );
                                            }


                                        }
                                    }
                                )
                            }
                        }
                    )
                })
        },
        


    }
}
