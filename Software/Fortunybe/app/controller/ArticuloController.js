//var mongoose   = require('mongoose');
var Articulo = require('../models/Articulo');
var async = require('async');

module.exports = function () {

	function crearUno(datos, usuarioId, cb) {
		var articuloConstructor = global.db.models.articulo;
		var articuloPorCrear = {
			nombre: datos.nombre,
			descripcion: datos.nombre,
			precioCompra: datos.precioCompra,
			precioVenta: datos.precioVenta,
			codigo_articulo: datos.codigo_articulo,
			tipo_id: datos.tipo_id,
			fecha_creacion: new Date(),
			usuario_creacion: usuarioId,
			habilitado: 1
		};
		articuloConstructor.create(articuloPorCrear, function (err, obj) {
			if (err) {
				return cb(500, { err: err });
			} else {
				if (obj) {
					return cb(200, { id: obj.id });
				} else {
					return cb(500, { err: 'ERROR' });
				}
			}
		});
	}

	return {

		/*get:function(tenantId,cb){
			var articuloConstructor = global.db.models.articulo;
			articuloConstructor.find({id:tenantId},function(err, listObj){
				if(err) return cb(500,{err: err});
				if(listObj){							
					return cb(200,listObj);
				}else{
				 	return cb(500,{err: 'NOT FOUND'});
				}
			});
		},*/

		get: function (tenantId, cb) {
			global.db.driver.execQuery(
				"select "
				+ " a.ident_nro,"
				+ " a.nombre,"
				+ " a.descripcion,"
				+ " a.observaciones,"
				+ " a.traduccion,"
				+ " a.material,"
				+ " a.peso_kg,"
				+ " a.medidas,"
				+ " a.precioCompra,"
				+ " a.precioVenta,"
				+ " a.codigo_articulo,"
				+ " a.unidad,"
				+ " a.subfamilia,"
				+ " a.tipo_articulo,"
				+ " a.tipo_id,"
				+ " ta.id,"
				+ " ta.nombre "
				+ " from articulo a INNER JOIN tipo_articulo ta "
				+ " ON a.tipo_id=ta.id;",
				[],
				function (err, listArticulos) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (listArticulos) {
							cb(200, listArticulos);
						} else {
							cb(500, { message: 'NO EXISTEN ARTICULOS' });
						}
					}
				});
		},

		getById: function (tenantId, paramId, cb) {

			global.db.driver.execQuery(
				"select "
				+ " a.ident_nro,"
				+ " a.nombre,"
				+ " a.descripcion,"
				+ " a.observaciones,"
				+ " a.traduccion,"
				+ " a.material,"
				+ " a.peso_kg,"
				+ " a.medidas,"
				+ " a.precioCompra,"
				+ " a.precioVenta,"
				+ " a.codigo_articulo,"
				+ " a.unidad,"
				+ " a.subfamilia,"
				+ " a.tipo_articulo,"
				+ " a.tipo_id,"
				+ " ta.id,"
				+ " ta.nombre "
				+ " from articulo a INNER JOIN tipo_articulo ta "
				+ " ON a.tipo_id=ta.id "
				+ " where a.id=?;",
				[paramId],
				function (err, listArticulos) {

					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					}
					else {

						if (listArticulos.length > 0) {

							cb(200, listArticulos);
						} else {
							cb(404, { message: 'NO EXISTEN DATOS DE ARTICULO' });
						}
					}

				});
		},
		getByTipo: function (tenantId, paramId, cb) {
			var articuloConstructor = global.db.models.articulo;
			articuloConstructor.find({ tipo_id: paramId }, function (err, listArticulos) {
				if (err) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				}
				else {

					if (listArticulos.length > 0) {

						cb(200, listArticulos);
					} else {
						cb(404, { message: 'NO EXISTEN DATOS DE ARTICULO' });
					}
				}

			});
		},

		/*getById:function(tenantId,paramId,cb){
			var articuloConstructor = global.db.models.articulo;
			articuloConstructor.find({id:paramId},function(err, listObj){
				if(err) return cb(500,{err: err});
				if(listObj){							
					return cb(200,listObj);
				}else{
				 	return cb(500,{err: 'NOT FOUND'});
				}
			});
		},*/

		delete: function (tenantId, paramId, cb) {

			var articuloConstructor = global.db.models.articulo;
			articuloConstructor.get(paramId, function (err, objeto) {
				if (objeto) {
					objeto.remove(function (err) {
						if (err) {
							return cb(500, { err: 'ERROR' });
						} else {
							return cb(200);
						}
					});
				} else {
					return cb(404, { err: 'NO ENCONTRADO' });
				}
			});
		},

		getAll: function (tenantId, cb) {
			global.db.driver.execQuery(
				"SELECT a.*, tbl.final_cantidad FROM Articulo a LEFT JOIN ( " +
				"SELECT i.id, i.final_cantidad, i.articulo_id from inventario i " +
				"WHERE (i.id, i.articulo_id) IN ( SELECT MAX(i2.id), articulo_id FROM inventario i2  group by i2.articulo_id) ) tbl on a.id = tbl.articulo_id; ",
				[], function (err, listObj) {
					if (err) {
						return cb(500, { err: err });
					} else {
						if (listObj) {
							return cb(200, listObj);
						} else {
							return cb(500, { err: 'NOT FOUND' });
						}
					}
				}
			)
			/*
			var articuloConstructor = global.db.models.articulo;

			articuloConstructor.find({},function(err, listObj){
				if(err){
					return cb(500,{err: err});
				}else{
					if(listObj){
						return cb(200,listObj);
					}else{
				 		return cb(500,{err: 'NOT FOUND'});
				 	}
				}
			});*/
		},

		create: function (tenantId, userId, body, cb) {

			var articuloConstructor = global.db.models.articulo;
			articuloConstructor.create({
				ident_nro: body.ident_nro,
				nombre: body.nombre,
				descripcion: body.descripcion,
				observaciones: body.observaciones,
				traduccion: body.traduccion,
				material: body.material,
				peso_kg: body.peso_kg,
				medidas: body.medidas,
				precioCompra: body.precioCompra,
				precioVenta: body.precioVenta,
				unidad: body.unidad,
				tipo_id: body.tipo_id,
				familia: body.familia,
				subfamilia: body.subfamilia,
				tipo_articulo: body.tipo_articulo,
				codigo_articulo: body.codigo_articulo,
				fecha_creacion: new Date(),
				usuario_creacion: userId,
				created_by: userId,
				habilitado: 1
			}, function (err, obj) {
				if (err) {
					return cb(500, { err: err });
				} else {
					if (obj) {
						return cb(200, { id: obj.id });
					} else {
						return cb(500, { err: 'ERROR' });
					}
				}
			});
		},

		createMasive: function (tenantId, userId, body, cb) {
			var original = body;
			async.each(body, function (articulo, callback) {
				crearUno(articulo, userId, function (errArtCre, articuloCreado) {
					if (errArtCre) {
						if (errArtCre == 200) {
							//articulo.id = articuloCreado.id;
							articulo.articulo_id = articuloCreado.id;
							callback();
						} else {
							callback(new Error(errArtCre));
						}
					} else {
						articulo.id = articuloCreado.id;
						callback();
					}

				});

			}, function (errSG) {
				if (errSG) {
					cb(500, { message: errSG, code: '2003' });
				} else {
					cb(200, { creados: original });
				}
			});
		},

		put: function (tenantId, userId, paramId, body, cb) {

			var articuloConstructor = global.db.models.articulo;

			articuloConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: err });
				}
				else {

					if (obj) {
						obj.ident_nro = body.ident_nro,
							obj.nombre = body.nombre,
							obj.descripcion = body.descripcion,
							obj.observaciones = body.observaciones,
							obj.traduccion = body.traduccion,
							obj.material = body.material,
							obj.peso_kg = body.peso_kg,
							obj.medidas = body.medidas,
							obj.precioCompra = body.precioCompra,
							obj.precioVenta = body.precioVenta,
							obj.subfamilia = body.subfamilia,
							obj.tipo_articulo = body.tipo_articulo,
							obj.codigo_articulo = body.codigo_articulo,
							obj.unidad = body.unidad,
							obj.tipo_id = body.tipo_id,
							obj.habilitado = 1,
							obj.fecha_modificacion = new Date(),
							obj.usuario_modificacion = userId
						/*obj.updated_by = userId,
			  	 		obj.updated_date = new Date()*/

						// save the user
						obj.save(function (err) {
							if (err) {
								cb(500, { err: err });
							}
							else {
								cb(200, { id: obj.id });
							}
						});
					}
					else {
						cb(404, { message: 'NO EXISTE ARTICULO' });
					}

				}
			});
		}
	}
}