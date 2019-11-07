module.exports = function() {
  return {
    getByTipoDocumento: function(TipoDocumento,filtro, cb) {
      global.db.driver.execQuery(
        "SELECT * FROM numero_serie where tipo_documento = ? AND numero_serie.codigo LIKE ?;", [TipoDocumento,"%"+filtro+"%"],
        function(err, TipoDocumentos) {
          if (err) {
            cb(500, { message: 'ERROR EN EL SERVICIO' });
          } else {
            if (TipoDocumentos) {
              cb(200, {numeroSerie: TipoDocumentos});
            } else {
              cb(500, { message: 'NO EXISTEN NUMEROS DE SERIES' });
            }
          }
        });
    },

    create: function(paramId, body, cb) {
      
      var numeroSerieConstructor = global.db.models.numero_serie;
        numeroSerieConstructor.create({ 
            codigo : body.codigo,
            numInicio : body.numInicio,
            numFinal : body.numFinal,
            tipo_documento : body.tipoDocumento

        }, function(err, obj){
          if (err){
            return cb(500,{err: "Error en el Servicio"});
          }else{
            if (obj){
            return cb(200,{id:obj.id });
            }else{
            return cb(500,{err: 'No se pudo crear Numero de serie'});
            }
          }
        });

   
    },

    //el siguiente fue creado para obtener el ultimo numero de OC y Cotizacion

    UltimoNumeroDocumento:function(entidad,cb){   

      //variables creadas para dar inicio al sistema en el año 2016
      var numeroInicialCotizacion=2000238
      var numeroInicialOrdenCompra=5000176

    db.driver.execQuery(
            "SELECT numero_secuencia FROM "+entidad+" where year(fecha_creacion)= year(now()) and numero_secuencia <> 0  order by numero_secuencia desc limit 1",
            [],
            function (err, listObj) {
                if(err){
                    cb(500,{message: "Existe un error en el Servicio"});
                }else{
                    if(listObj){
                        if(listObj.length>0)
                        {
                          var numeroEnviar=Number(listObj[0].numero_secuencia)+1;
                          cb(200,{numero:numeroEnviar});
                        }
                        else
                        {
                          var numeroEnviar
                          var fechaActual= new Date()
                          switch(entidad) {
                              case "cotizacion":
                              {
                                  
                                  numeroEnviar=10001  
                                  
                                  
                                  break;
                              }                                
                              case "orden_compra":
                              {
                                 
                                    numeroEnviar=0001   
                                 
                                  
                                  break;
                              } 
                              case "req_compra":
                              {
                                 
                                    numeroEnviar=0001   
                                 
                                  
                                  break;
                              } 
                          }
                          cb(200,{numero:numeroEnviar});

                        }
                        
                    }else{
                        cb(500,{message: 'Error en la busqueda de numeros correlativos'});
                    }
                }
            }
    );
  },
  }
}
