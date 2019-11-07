//HISShared.controller('menuController', ['$scope', '$filter', '$rootScope', 'menuService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC','fpshotkeys', function ($scope, $filter, $rootScope, menuService, ProfileService, $cookieStore, sharedFormateoUsaSVC, Hotkeys) {
  
HISList.controller('listController', ['$scope', '$filter','$http','$routeParams', '$rootScope','listService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC' ,function ($scope, $filter, $http ,$routeParams, $rootScope,  listService, ProfileService, $cookieStore, sharedFormateoUsaSVC) {
       
            $scope.ini = function () {
                $scope.cantidadInfluencer=0
                $scope.cantidadInsta=0


            listService.list().get({id: $routeParams.id},function(result) {
               $scope.lista=result[0]
                console.log("listarrrrrrr");
                console.log(result[0])
              
              
            })

            listService.influencer().get(function(resultInfluencer) {
             
                console.log(resultInfluencer )
                $scope.influencers = resultInfluencer
          
            })
             listService.listxinfluencer().get({id: $routeParams.id},function(resultInfluencer) {
                $scope.allInfluencers = resultInfluencer
                $scope.cantidadInfluencer = resultInfluencer.length
                $scope.cantidadInsta = resultInfluencer.length
                   
                for( a=0;a<$scope.cantidadInfluencer;a++)
                {
                    username_instagram = resultInfluencer[0].username_instagram;

                    var data= 'https://www.instagram.com/'+  username_instagram;
                    var pats=
                    $scope.part=[]
                    $scope.mention=[]
                    $scope.divide=[]
                    $scope.retorno;
                    $scope.retorno2;
                 
                      
                       $http({
                           method: 'GET',
                           skipAuthorization: true,
                           url: 'https://www.instagram.com/'+  username_instagram+'/?__a=1',
                           headers: {"Content-type": "application/x-www-form-urlencoded"}
                       })
                       .then(function(response)
                       {   
                           var totalComments =0, likes=0;
                           var totalLikes=0, coments=0;
                           var hast , mention;
                           $scope.influencer = resultInfluencer[0];
                           idSql =resultInfluencer[0].id;
                           $scope.influencer.followers=response.data.graphql.user.edge_followed_by.count;
                         
                               for(i=0; i<10 ;i++)
                               {
                                  likes = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_liked_by.count;
                                  coments = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_comment.count;
                                 
                                   var comment =response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_caption.edges[0].node.text;   
                                  $scope.divide = $scope.exe(comment) 
                                   
   
                                   totalLikes = totalLikes + likes;
                                   totalComments =  totalComments +coments;
                               }
                               $scope.retorno = $scope.divide[0];
                             
                               $scope.retorno2 = $scope.divide[1]; // retorna las menciones
                           
                               var count=0;
                               var i =0;
   
                            while($scope.retorno.length!=0) // contador de los hastagh mas usado
                                  {  
                                      for(j=0;j<$scope.retorno.length ;j++)
                                      {   
                                           if($scope.retorno[0]==$scope.retorno[j])
                                          {
                                               count++;
                                          }
                                      } 
                                      $scope.hastagh.push({name : $scope.retorno[0] , count:count}) 
                                     
                                      for(  z = 0; z < $scope.retorno.length; z++)
                                      { 
                                        if ( $scope.retorno[z] ==  $scope.hastagh[i].name) {
                                          
                                           $scope.retorno.splice(z, 1);
                                           }
                                      }
                                           i++;
                                         count=0;
                                  }
                                  i=0;
                                  count=0;
                                  while($scope.retorno2.length!=0) // contador de los hastagh mas usado
                                  {  
                                     for(j=0;j<$scope.retorno2.length ;j++)
                                      {  
                                           if($scope.retorno2[0]==$scope.retorno2[j])
                                          {
                                               count++;
                                          }
                                      } 
                                      $scope.mentions.push({name : $scope.retorno2[0] , count:count}) 
                                     
                                      for(  z = 0; z < $scope.retorno2.length; z++){ 
                                       if ( $scope.retorno2[z] ==  $scope.mentions[i].name) {
                                          
                                           $scope.retorno2.splice(z, 1);
                                       }
                                   }
                                  i++;
                                  count=0;
                                 }
                               $scope.hast =$scope.hastagh.sort(function (a, b){
                                   return (b.count - a.count)
                               })
                               $scope.mention =$scope.mentions.sort(function (a, b){
                                   return (b.count - a.count)
                               })
                               likesAndComments = totalLikes+totalComments;
                           //$scope.influencer.hastagh= hast
                           $scope.influencer.interaction =  likesAndComments/10;
                           $scope.influencer.engagement  = (($scope.influencer.interaction/$scope.influencer.followers)*100).toFixed(2);
                           id=response.data.graphql.user.id;
                          // $scope.getFollowers(totalLikes, totalComments);
                          
                           
                       }, function(error)
                       {
                       });              
                }
            })
            
        }
       
        $scope.invited=[]
        $scope.ini();
        $scope.resume = function(){
              document.getElementById("resumeName").style.color="rgb(39, 0, 56)";
              document.getElementById("influencerName").style.color="gray";
              document.getElementById("influencer").style.display="none";
              document.getElementById("resume").style.display="initial";
         
         }
         $scope.influencer = function(){
            document.getElementById("influencerName").style.color="rgb(39, 0, 56)";
            document.getElementById("resumeName").style.color="gray";
            document.getElementById("resume").style.display="none";
            document.getElementById("influencer").style.display="initial";
       
       }

        $scope.influencerInList = function () {
          
            $('#popupadd').modal('show');
        }
        $scope.addInList=function(){


                 if ($scope.invited.length>0){
                    listService.listxinfluencer().save($scope.invited,function(result) {
                         console.log(result)
                         window.location = "#/network/list/"+$routeParams.id;
                                         
                     });
                     
                     
                 }
            
				
        }
       
         $scope.toggleCurrency = function(index, conten) {
           
             if(conten.isChecked) { 
                $scope.invited.push({idList: $routeParams.id , idInfluencer: conten.id});
            } else {           
                for(i=0; i <$scope.invited.length;i++)
                {
                        if($scope.invited[i].idInfluencer==conten.id)
                        {
                           $scope.invited.splice(i, 1); 
                        }
                }    
              
            }
            console.log($scope.invited)
          };

        $scope.nuevoInfluencer = function(){

            $('#popupNuevoInfluencer').modal('show');

        }
        $scope.addLink = function(){

            $('#popupLink').modal('show');

        }

       
          $scope.pointer = function(data)
          {
              console.log("use ng-click" + data)
              window.location = "#/network/"+data;
          }
        $scope.nuevo=function(user)
        {
         console.log("sie ntvrf0");   
         console.log(user);

         console.log("i am here");

         var data= 'https://www.instagram.com/'+  user.nombre;

        }
/*
             var url = "https://www.instagram.com/"+user.nombre;
      $.ajax({
            type: 'GET',
            url: data,
            headers: {
                'Access-Control-Allow-Origin': ' http://localhost:3000',
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Credentials": true,
                "Content-type": "application/x-www-form-urlencoded"
            },
            error: function () {},
            success: function (data) {
                data = JSON.parse(data.split("window._sharedData = ")[1].split(";</script>")[0]).entry_data.ProfilePage[0].graphql;
                console.log(data);
                if(data.user.id!=0)
                {
                    document.getElementById("hideThis").style.display="none";
                    document.getElementById("popupLink").style.display="none";
                    username_instagram = data.user.username;
                    id_instagram = data.user.id;
                    profile_url=data.user.profile_pic_url;
                    
                }
            },

    
        })*//*

        var req = new XMLHttpRequest();
        req.open('GET', data, true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function (aEvt) {
        if (req.readyState == 4) {
            if(req.status == 200){ 
            data = JSON.parse(req.responseText.split("window._sharedData = ")[1].split(";</script>")[0]).entry_data.ProfilePage[0].graphql;

            console.log(data);
            if(data.user.id!=0)
            {
                document.getElementById("hideThis").style.display="none";
                document.getElementById("popupLink").style.display="none";
                username_instagram = data.user.username;
                id_instagram = data.user.id;
                profile_url=data.user.profile_pic_url;
                
            }
            }
            else
            dump("Error loading page\n");
        }
        };
        req.send(null);*/
        /*var request = new XMLHttpRequest();
        var params = "action=something";
        request.open('get', data, true);
        request.onreadystatechange = function() {if (request.readyState==4) alert("It worked!");};
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.setRequestHeader("Content-length", params.length);
        request.setRequestHeader("Connection", "close");
        request.send(params);*/
        
    


     /*
         qraphlController.graph(user);


         runQuery(query);
         
            function runQuery (query) {
                console.log()
                query().then(
                    res => {
                        $output.innerHTML = `<pre><code>${JSON.stringify(res, null, 2)}</code></pre>`;
                    },
                    err => {
                        $output.innerHTML = `Error: <pre><code>${JSON.stringify(err, null, 2)}</code></pre>`;
                    }
                )
            }*/
         
    /*     $scope.root = function (user) {
           // return fetch('https://www.instagram.com/'+  user.nombre+'/?__a=1')
            
                /*var response = await fetch('https://www.instagram.com/'+  user.nombre+'/?__a=1');
                console.log(await response.text());*/
               
     /*   var data = fetch('https://www.instagram.com/'+  user.name+'/?__a=1')
        var data2 = data.text();
       console.log(data2);
             
            /*.then(response => response.text())
            .then(text => {
            console.log(text);
            }).catch(err => {
            console.error('fetch failed', err);
        });*/
       //      };/*
  /*     $scope.createInfluencer = function(formGrabarInfluencer, isValid)
       {
           formGrabarInfluencer.username_instagram=username_instagram
           formGrabarInfluencer.id_instagram=id_instagram
           formGrabarInfluencer.profile_url = profile_url;


           console.log(formGrabarInfluencer);
           $scope.submitted = true;
            if (isValid){
				networkService.influencer().save(formGrabarInfluencer,function(result) {
                    console.log("entra aca");
                    window.location= "#/network";
           
                       $scope.ini();
									
				});
				
				
			}



       }
        $scope.crearLista=function(formGrabarLista,isValid){
            console.log(formGrabarLista);
            console.log(isValid);
			$scope.submitted = true;
            if (isValid){
				networkService.list().save(formGrabarLista,function(result) {
                    console.log("entra aca");
                    window.location= "#/network";
                    $('#popupNuevaLista').modal('hide');
                     
                      
                       $( "#reload" ).load(window.location.href + " #reload" );
                       $scope.ini();
									
				});
				
				
			}
			
			
		
        }
        $scope.inList = function(res)
        {
            console.log(res)
        }
        $scope.cerrarSesion = function () {
            $cookieStore.remove('tokenActual');
            localStorage.removeItem('sJWT');
             localStorage.removeItem('funcionalidades');
                window.location = "/#/";
    */
          /*  ProfileService.Perfil().delete({}, function () {
                localStorage.removeItem('sJWT');
                window.location = "/#/";
            }, function (error) {
                localStorage.removeItem('sJWT');
                localStorage.removeItem('funcionalidades');
                window.location = "/#/";
                erroresServices.controlError(error.status);
            });*//*
        };
        $scope.mostrarPopUpReportes = function (valorTipoReporte) {
            $scope.tipoReporte = valorTipoReporte;
            $scope.$broadcast('eventPopupReportes', { tipoReporte: valorTipoReporte }); // se conecta con el controlador anidado reportesController en la carpeta js/app/Reportes
        }
        $scope.tipoCambioActualizar = function () {
            $scope.actualizarTC_fecha = {}
            $scope.actualizarTC_fecha.moneda = "USD"
            $scope.actualizarTC_fecha.valor_tipo_cambio = 0
            var fechaHoy = new Date()
            $scope.actualizarTC_fecha.fecha = $filter('date')(new Date(), 'dd/MM/yyyy');
            $scope.traerTipoCambio()
            $('#popupactualizarTipoCambio').modal('show');
        }
        $scope.grabarTipoCambio = function () {
            if (!$scope.actualizarTC_fecha.idExistente) {
                var grabarTipoCambio = {
                    cambio: $scope.actualizarTC_fecha.valor_tipo_cambio,
                    moneda: $scope.actualizarTC_fecha.moneda,
                    fecha: sharedFormateoUsaSVC.fechaUsa($scope.actualizarTC_fecha.fecha)
                }
    
                menuService.tipoCambio().save(grabarTipoCambio, function () {
                    $scope.mostrarMensajeAviso = true
                    setTimeout(function () {
                        $scope.mostrarMensajeAviso = false;
    
                        $scope.$apply();
    
                    }, 1000);
                })
            }
            else {
                menuService.tipoCambio().update({ id: $scope.actualizarTC_fecha.idExistente }, { cambio: $scope.actualizarTC_fecha.valor_tipo_cambio }, function () {
                    $scope.mostrarMensajeAviso = true
                    setTimeout(function () {
                        $scope.mostrarMensajeAviso = false;
    
                        $scope.$apply();
    
                    }, 1000);
                })
            }
        }
        $scope.traerTipoCambio = function () {
            menuService.tipoCambio().query({ fecha: $scope.actualizarTC_fecha.fecha, moneda: $scope.actualizarTC_fecha.moneda }, function (resultTipoCambio) {
    
                if (resultTipoCambio.length > 0) {
                    $scope.actualizarTC_fecha.valor_tipo_cambio = resultTipoCambio[0].cambio
                    $scope.actualizarTC_fecha.idExistente = resultTipoCambio[0].id
                }
                else {
                    $scope.actualizarTC_fecha.idExistente = null
                    $scope.actualizarTC_fecha.valor_tipo_cambio = 0
                }
    
    
            })
        }
    }])
   */

   // HISList.controller('listController', ['$scope', '$filter','$http', '$rootScope','$routeParams','listService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC' ,function ($scope, $filter,$http, $rootScope, $routeParams, listService, ProfileService, $cookieStore, sharedFormateoUsaSVC) {
   
       
   
 }])