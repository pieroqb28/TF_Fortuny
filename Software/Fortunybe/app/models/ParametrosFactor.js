module.exports = function (db, cb) {
  	global.db.define("parametros_factor", {
  		tipo_envio: {
		      type: 'text',
		      required: true
		},
		origen: {
		      type: 'text',
		      required: true
		},
	  	valor_fob: {
		      type: 'number',
		      required: true
		},

		peso: {
		      type: 'number',
		      required: true
		},
		
		dimesiones_largo: {
		      type: 'number',
		      required: true
		},

		dimesiones_ancho: {
		      type: 'number',
		      required: true
		},

		dimesiones_altura: {
		      type: 'number',
		      required: true
		},

		peso_volumetrico: {
		      type: 'number',
		      required: true
		},

		peso_cotizar: {
		      type: 'date',
		      required: true
		},

		flete: {
		      type: 'number',
		      required: true
		},

		recarg_combustible: {
		      type: 'number',
		      required: true
		},

		seguro: {
		      type: 'number',
		      required: true
		},

		handling: {
		      type: 'number',
		      required: true
		},

		cargos: {
		      type: 'number',
		      required: true
		},

		igv_cargos: {
		      type: 'number',
		      required: true
		},

		total_cargos: {
		      type: 'number',
		      required: true
		},

		total_cip: {
		      type: 'number',
		      required: true
		},

		ad_valorm: {
		      type: 'number',
		      required: true
		},

		ipm_porcent: {
		      type: 'number',
		      required: true
		},

		ad_valorm_porcent: {
		      type: 'number',
		      required: true
		},

		ipm: {
		      type: 'number',
		      required: true
		},
		igv_sunat_porcent: {
		      type: 'number',
		      required: true
		},

		igv_sunat: {
		      type: 'number',
		      required: true
		},

		sda: {
		      type: 'number',
		      required: true
		},

		isc: {
		      type: 'number',
		      required: true
		},

		total_impuestos: {
		      type: 'number',
		      required: true
		},

		incluyeImpuestos:{
				type:"boolean"
		},

		percepcion_igv_porcent: {
		      type: 'number',
		      required: true
		},

		percepcion_igv: {
		      type: 'number',
		      required: true
		},

		total_sunat: {
		      type: 'number',
		      required: true
		},

		almacenaje: {
		      type: 'number',
		      required: true
		},

		comision_aduanas: {
		      type: 'number',
		      required: true
		},

		descarga: {
		      type: 'number',
		      required: true
		},

		reconocimiento_fisico: {
		      type: 'number',
		      required: true
		},

		transporte: {
		      type: 'number',
		      required: true
		},

		gastos_itf_porcent: {
		      type: 'number',
		      required: true
		},

		gastos_itf: {
		      type: 'number',
		      required: true
		},

		cargos_aduanas: {
		      type: 'number',
		      required: true
		},

		igv_aduanas: {
		      type: 'number',
		      required: true
		},

		total_cargos_aduanas: {
		      type: 'number',
		      required: true
		},

		valor_porcent: {
		      type: 'number',
		      required: true
		},

		total_factor: {
		      type: 'number',
		      required: true
		},
		cotizacion_id: {
		      type: 'number',
		      required: true
		}

	}, {
    	cache   : false
	});

	return cb();
};
