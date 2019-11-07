var nodemailer = require('nodemailer');
module.exports = function () {
	return {
		Ejecutar: function (cb) {
			var dominioEmpresa = "http://localhost:3000/pronos.html"
			global.db.driver.execQuery(
				"SELECT * FROM man.alertas"
				+ " WHERE man.alertas.nombre='cotizaciones_vencidas';",
				[],
				function (err, listAlertas) {
					if (err) {
						cb();
					} else {
						if (listAlertas) {
							global.db.driver.execQuery(
								"SELECT coti.id,coti.moneda,coti.numero,coti.total_cotizacion ,DATE_FORMAT(coti.fecha_vencimiento,'%d-%m-%Y') fecha_vencimiento, cli.nombre nombre_Cliente"
								+ " FROM cotizacion coti"
								+ " INNER JOIN cliente cli"
								+ " ON coti.cliente_id=cli.id"
								+ " where ADDDATE(coti.fecha_vencimiento, INTERVAL ? DAY) < now();",
								[listAlertas[0].parametro_1],
								function (err, listCotizaciones) {

									if (err) {
										cb();
									}
									else {

										if (listCotizaciones.length > 0) {

											var cabeceraMensaje = "<p style='background-color: #303C4C; color:white; text-align: center;padding: 7px;font-size: 15px;'> MAN </p>"
											var mensajeEnviar = " <br><table > <tr style='background-color: #303C4C; color:white; text-align: center;'><td>Código</td><td>Fecha</td><td>Cliente</td><td style='padding-right: 10px;padding-left: 10px'>Moneda</td><td>Total</td></tr>"
											for (i = 0; i < listCotizaciones.length; i++) {
												mensajeEnviar = mensajeEnviar + "<tr><td style='padding-right: 10px;padding-left: 10px'><a href='" + dominioEmpresa + "#/cotizaciones/detalle/" + listCotizaciones[i].id + "'>" + listCotizaciones[i].numero + "</a></td><td style='padding-right: 10px;padding-left: 10px'>" + listCotizaciones[i].fecha_vencimiento + "</td><td style='padding-right: 10px;padding-left: 10px'>" + listCotizaciones[i].nombre_Cliente + "</td><td style='padding-right: 10px;padding-left: 10px'>" + listCotizaciones[i].moneda + "</td><td style='padding-right: 10px;padding-left: 10px'>" + listCotizaciones[i].total_cotizacion + "</td></tr>"
											}
											mensajeEnviar = mensajeEnviar + "</table>"
											//	cb();
											var transporter = nodemailer.createTransport({
												service: 'Gmail',
												auth: {
													user: global.localsemailuser,
													pass: global.localsemailpass
												}
											});

											mailText = cabeceraMensaje + "Tiene Cotizaciones vencidas. \n " + mensajeEnviar + " \n \n   Ingrese desde http://app.MAM.pe  \n  MAN. ";
											htmlmailText = cabeceraMensaje + 'Tiene Cotizaciones vencidas. <br> ' + mensajeEnviar + ' <br><br> Ingrese desde http://app.MAN.pe   <br> MAN ';

											var mailOptions = {
												from: 'Holinsys Software ✔ <'+  global.localsemailuser+ '>', // sender address
												to: listAlertas[0].email, // list of receivers
												subject: 'MAN - Cotizaciones Vencidas', // Subject line
												text: mailText, // plaintext body
												html: htmlmailText // html body
											};

											// send mail with defined transport object
											transporter.sendMail(mailOptions, function (error, info) {
												if (error) {
													cb();
												} else {
													cb();
												}
											});

										} else {
											cb();
										}
									}

								});

						} else {
							cb();
						}
					}
				});


		}
	}

}