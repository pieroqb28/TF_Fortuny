
module.exports = function (mes,anio) {

        var diaEncontrado=false
        var dia=1
       //lista de feriados para los primeros dias
       var feriados=[
        {
            dia:1,
            mes:"01",
        },       
        {
            dia:1,
            mes:"05",
        },
        {
            dia:8,
            mes:"10",
        },
        {
            dia:1,
            mes:"11",
        },
        {
            dia:8,
            mes:"12",
        }
       ]
       while (!diaEncontrado) {
            var diaUsar=dia<10?"0"+dia:dia
            var fechaBuscada=new Date(anio+"/"+mes+"/"+diaUsar)
            diaSemana= fechaBuscada.getDay()
            
            // verifica que el dia no sea domingo
            if(diaSemana!=0)
            {
                //verifica si es feriado
                for(i=0;i<feriados;i++)
                {
                    var esferiado=false
                    if(feriados[i].mes==mes && feriados[i].dia==dia )
                    {
                        esferiado=true
                    }
                }
                if(esferiado)
                {
                    dia++
                }
                else
                {
                    diaEncontrado=true    
                }
                

            }
            else
            {
                dia++
            }
        }

        dia=dia<10?"0"+dia:dia
        return dia

}