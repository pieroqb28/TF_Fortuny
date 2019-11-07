var nodemailer = require('nodemailer');
module.exports = function () {
return 	{
	Ejecutar : function(cb){
	var dominioEmpresa= "http://localhost:3000/pronos.html"
	global.db.driver.execQuery(
		"SELECT * FROM man.alertas"
		+" WHERE man.alertas.nombre='despachos_factura';",
		[],
		function (err, listAlertas) { 
			if(err){
				console.log("hay un error al traer los parametros de la alerta")
				cb();
			}else{
				if(listAlertas){					
					global.db.driver.execQuery(
					"SELECT coti.id cotiID,coti.moneda,coti.total_cotizacion,d.codigo, DATE_FORMAT(d.fecha_creacion,'%m-%d-%Y') fecha_creacion, cli.nombre nombreCliente"
					+" FROM despacho d LEFT JOIN factura f"
					+" ON d.id = f.despacho_id LEFT JOIN cliente cli"
					+" ON d.cliente_id = cli.id LEFT JOIN cotizacion coti"
					+" ON d.cotizacion_id=coti.id"
					+" WHERE (f.despacho_id IS NULL AND ADDDATE(d.fecha_creacion, INTERVAL ? DAY)< now());",					
					[listAlertas[0].parametro_1],
					 function (err, listDespachos) { 
					 	
						if(err){
							console.log("hubo un error al momento de buscar Despachos")
							cb();
						}
						else{
							
							if(listDespachos.length>0){
										
										console.log("Procediendo a enviar email")
										var cabeceraMensaje= "<p style='background-color: #303C4C; color:white; text-align: center;padding: 7px;font-size: 15px;'> MAN </p>"
										var mensajeEnviar=" <br><table > <tr style='background-color: #303C4C; color:white; text-align: center;'><td>Código</td><td>Fecha</td><td>Cliente</td><td style='padding-right: 10px;padding-left: 10px'>Moneda</td><td>Total</td></tr>"
										for(i=0;i<listDespachos.length;i++)
										{							
											mensajeEnviar= mensajeEnviar +"<tr><td style='padding-right: 10px;padding-left: 10px'><a href='"+ dominioEmpresa +"#/cotizaciones/detalle/"+ listDespachos[i].cotiID+"'>"+ listDespachos[i].codigo +"</a></td><td style='padding-right: 10px;padding-left: 10px'>"+ listDespachos[i].fecha_creacion + "</td><td style='padding-right: 10px;padding-left: 10px'>"+ listDespachos[i].nombreCliente+"</td><td style='padding-right: 10px;padding-left: 10px'>"+listDespachos[i].moneda+"</td><td style='padding-right: 10px;padding-left: 10px'>"+ listDespachos[i].total_cotizacion +"</td></tr>"
										}							
										mensajeEnviar=mensajeEnviar+"</table>"
									//	cb();
										var transporter = nodemailer.createTransport({
											    service: 'Gmail',
											    auth: {
											        user: global.localsemailuser,
											        pass: global.localsemailpass
											    }
											});
											
											mailText = cabeceraMensaje + "Tiene despachos sin facturar. \n " + mensajeEnviar + " \n \n   Ingrese desde http://app.MAM.pe  \n  MAN. ";
											htmlmailText =cabeceraMensaje + 'Tiene despachos sin facturar <br> ' + mensajeEnviar + ' <br><br> Ingrese desde http://app.MAN.pe   <br> MAN ';

										var mailOptions = {
												    from: 'Holinsys Software ✔ <'+  global.localsemailuser+ '>', // sender address
												    to: listAlertas[0].email, // list of receivers
												    subject: 'MAN - Despachos sin Facturar', // Subject line
												    text:  mailText, // plaintext body
												    html:  htmlmailText // html body
											};

											// send mail with defined transport object
										transporter.sendMail(mailOptions, function(error, info){
											    if(error){
													console.log("Ha ocurrido un error al enviar el email")
													cb();
											    }else{
											    	console.log("se envio el email")
											    	cb();
											    }
										});

							}else{
						 	console.log("No existe ningún despacho sin factura")
						 	cb();
							}
						}

					});

				}else{
						console.log("No existe parametros para la alerta buscada")
					 	cb();
				}
			}
		});


}}

}