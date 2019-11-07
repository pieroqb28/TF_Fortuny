/**
 * HS_AttachmentsController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = function () {
	return {

		get: function (tenantId, entidad, EntidadId, cb) {
			var attachmentConstructor = global.db.models.hs_attachments;
			attachmentConstructor.find({ tipoEntidad: entidad, idEntidad: EntidadId }, function (err, listFiles) {

				if (err) cb(500, { message: err });
				else
					if (listFiles) {
						cb(200, listFiles);
					} else {
						cb(404, { message: 'NOT FOUND' });
					}
			});
		},

		getOne: function (tenantId, idarchivo, cb) {
			var attachmentConstructor = global.db.models.hs_attachments;
			attachmentConstructor.find({ id: idarchivo }, function (err, listFiles) {
				if (err) 
				{
					cb(500, { message: err });}
				if (listFiles) {
					cb(200, listFiles[0]);
				} else {

					cb(404, { message: 'NOT FOUND' });
				}
			});
		},

		post: function (tenandId, userid, idEntidad, toCreate, cb) {
			var fileConstructor = global.db.models.hs_attachments;
			var fileClass = new fileConstructor({
				filename: toCreate.filename,
				internalFilename: toCreate.internalFilename,
				tipoEntidad: toCreate.tipoEntidad,
				ruta: toCreate.ruta,
				idEntidad: idEntidad,
				size: toCreate.size,
				contentType: toCreate.contentType,
				uploadedBy: userid,
				created_date: new Date()
			});

			//enviar correo de inicio
			fileClass.save(function (err, createdfile) {

				if (err) {
					cb(500, { message: err });
				}
				else {

					if (createdfile) {

						cb(200, { id: createdfile.id });
					} else {

						cb(500, { message: 'NOT CREATED' });
					}
				}

			});
		},

		delete: function (tenandId, params, cb) {
			var fileConstructor = global.db.models.hs_attachments;
			fileConstructor.find({ id: params.id }).remove(function (err) {
				if (err) {
					cb(500, { err: err });
				} else {
					cb(200);
				}
			});
		},
	}
};

