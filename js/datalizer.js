// script pour lire et afficher les données


// console.log('Datalizer présent !!');

var dataStorage = {
  data : [],
  couleurs : []
}
var couleurs = []; // les couleurs des lignes

// Les couleurs disponibles
var bddCouleurs = [
  "#FF6600", 
  "#3A1402", 
  "#990000", 
  "#6187E5", 
  "#8B06F2", 
  "#060696", 
  "#990066", 
  "#00FF33", 
  "#47315B", 
  "#7EA319", 
  "purple", 
  "red"
 ];

jQuery(document).ready(function($) {
    // initialisation cookie
    // ajouter une lecture du cookie couleurs


    if(document.getElementById('datalizer')){
      
      // dimensionement du canvas
      /*$('#graph').width($('#ajaxOut').width());
      $('#graph').height($('#graph').width() * 1/2);*/
      
      /*var dateNow = new Date();
      var time1an = 1000 * 60 * 60 * 24 * 365;
      //var time1mois = 1000 * 60 * 60 * 24 * 30; // pour les tests avec moins de valeurs
      var fromTime = dateNow.getTime() - time1an;
      var fromDate = new Date(fromTime);
      
      dataStorage.fromDate = fromDate;
      dataStorage.toDate = dateNow;*/

      // initialisation des controles
      var duree_select = $.cookie('duree');
      //console.log('Initialisation du graph pour un affichage de %d secondes', duree_select);
      $('#interval option').each( function(index){
      	if($(this).val() == duree_select) $(this).prop('selected', true);
      });

      getData();
      
      // refresh automatique
      setInterval(getData, 300000); // toutes les 5 min
      
      // resize
      $(window).on('resize', function() {
          var canvas = document.getElementById("graph");
          var largeur = $('#datalizer').width();
          var hauteur = largeur * 1 / 2;
          canvas.height = hauteur;
          canvas.width = largeur;
          var layerLoad = $("#datalizer .loaderLayout");
          var paddingTop = hauteur / 2 - 30;
          layerLoad.css('padding-top', paddingTop +'px');
          layerLoad.height((hauteur - paddingTop) + 'px');
          
          drawGraph();
      });
      $(window).trigger('resize');

      // TRACKING SOURIS
      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
      var canvas = document.getElementById('graph');
      canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        drawGraph();
        drawUserEvent(mousePos);
      }, false);
      canvas.addEventListener('mouseout', function(){
        drawGraph();
      })
    }

	// save param on exit page
	$(window).unload(function(){
		// sauvegadre de la plage d'affichage
		var duree_select = $("#interval").val();
        $.cookie('duree', duree_select, { expires: 30 });

        // sauvegarde des ligne à afficher
		$('#dataSelect input').each(function(index){
			var optionName = $(this).attr('class');
		 	var valeur = $(this).is(':checked');
		 	//console.log('sauvegarde de %s -> %s', optionName, valeur);
		 	$.cookie(optionName + 'selected', valeur, { expires: 30 });
		});

    recCouleurs();
	});
    
    $('#interval').change(function(){
    	// enregistrement des nouveau parametres
    	var duree_select = $("#interval").val();
        $.cookie('duree', duree_select, { expires: 30 });

     	// mise à jour des infos
     	drawGraph();
     	// mise à jour des données
     	getData();
    })
    
    function getData(){
      $('#datalizer .layer-error').hide();
      $('#datalizer .loaderLayout').show();
      
      // récupération des infos d'affichge
      var interval = $("#interval").val();
      var dateFin = $('#dateFin').val();
      //console.log('Interval = %d', interval);
      //console.log('Date de fin : %s', dateFin);
      
      if(dateFin == "NOW"){
        var toDate = new Date();
      }else{
        var toDate = new Date(); // champs dans effet pour le moment
      }
      var endTime = new Date().getTime();
      
      var startTime = endTime - interval * 60000; 
      var fromDate = new Date(startTime);
      
    	var data = {
  			'action': 'datalizer_getData',
  			'fromDate' : dateToString(fromDate),
  			'toDate' : dateToString(toDate)
  		};

      //console.log('Envoi des données : ', data);

  		// since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
  		$.post(datalizer_vars.ajax_url, data).done(function(response) {
  			//console.log('Got this from the server: ' + response);
        var dataObj = $.parseJSON(response);
        
        // suppression des anciennes données
        dataStorage.data = [];
        
        for(var i in dataObj){

          // archivage de la donnée
          var nom = dataObj[i].nom;
          var date = dateFromString(dataObj[i].time);
          var valeur = dataObj[i].valeur;
          var dataTps = {'time': date.getTime(), 'valeur': valeur};
          
          if(dataStorage.data[nom] == undefined){
            //console.log('Création de la série %s', nom);
            dataStorage.data[nom] = [];
          }
//          console.log(dataTps);
          /*var present = false;
          for(var j in dataStorage.data[nom]){
            if(dataStorage.data[nom][j].time == dataTps.time){
              present = true;
              break;
            }
          }
          if(!present) dataStorage.data[nom].push(dataTps);
          //else console.log('donnée prsente');*/
          dataStorage.data[nom].push(dataTps);
        }
        analyseData();
        drawGraph();
        $('#datalizer .loaderLayout').hide();
  		}).fail(function(){
        // en cas d'echec
        $('#datalizer .loaderLayout').hide();
        $('#datalizer .layer-error').text('Erreur de chargement !');
        $('#datalizer .layer-error').show();
      });
    }

    function analyseData(){
      // nettoyage des doublons
      // tri des données par ordre chronologique
      
      // selection courbes
      var zoneSetting = $('#dataSelect');
      var newLines = [];
      for(var nom in dataStorage.data){
        if($('input.' + nom).length == 0){
          newLines.push(nom);
          //console.log('Nouvelle donnes "%s" trouvee', nom);
        }
      }
      // tri des lignes
      newLines.sort();
      for(var i in newLines){
        //console.log('Insertion de %s', newLines[i]);
        
        // initialisation en fonction des données client
        var selected = $.cookie(newLines[i] + 'selected');
        //console.log('lecture cookie "%s" = %s', newLines[i], selected);
        if(selected == undefined) selected = 'true';

        // ajout au DOM
        if(selected == 'true'){
           var cmd = $('<tr/>').html('<th class="' + newLines[i] + '"><input class="' + newLines[i] + '" type="checkbox" checked>'+ newLines[i] + '</th><td class="' + newLines[i] + '"></td>');
        }else{
          var cmd = $('<tr/>').html('<th class="' + newLines[i] + '"><input class="' + newLines[i] + '" type="checkbox" >'+ newLines[i] + '</th><td class="' + newLines[i] + '"></td>');
        }
        zoneSetting.append(cmd);

        // mise en couleur
        var colorUsed = false;
        var idBddColor = -1;
        do{
          colorUsed = false;
          idBddColor ++;
          for(var idUsedColor in dataStorage.couleurs){
            if(bddCouleurs[idBddColor] == dataStorage.couleurs[idUsedColor]){
              colorUsed = true;
              break;
            }
          }
        }while( idBddColor < bddCouleurs.length && colorUsed );

        // si on a épuisé toutes les couleurs disponibles on en choisi une au pif
        if(colorUsed){
          console.log('Toutes les couleurs sont utilisée !');
          idBddColor = Math.floor(Math.random() * (bddCouleurs.length));
        }
        // attribution de la couleur
        dataStorage.couleurs[newLines[i]] = bddCouleurs[idBddColor];
        $('.' + newLines[i], zoneSetting).each(function(index){
          var style = "color:" + bddCouleurs[idBddColor] + ";";
          //console.log('Ajout du style > %s', style);
          $(this).attr('style', style);
        });
        //console.log('La ligne %s sera %s (id=%d)', newLines[i], dataStorage.couleurs[newLines[i]], idBddColor);

        // event on change
        $('#settings input.'+newLines[i]).change(function(){
          var optionName = $(this).attr('class');
          var checked = $(this).is(':checked');
          //console.log('%s is checked ? %s', optionName, checked);
          $.cookie(optionName + 'selected', checked, { expires: 30 });
          drawGraph();
        })
      }
      
      // affichage du tableau de bord
      for(var nom in dataStorage.data){
        var derValeur = dataStorage.data[nom][dataStorage.data[nom].length -1].valeur;
        $('td.' + nom, zoneSetting).text(derValeur);
      }

      // enregisrement des couleurs
      //console.log("Il y a %d couleurs", dataStorage.couleurs.length);
      recCouleurs();
    }
    
    
    function drawGraph(){
      // tracé du graph de valeurs
      
      // récupération des infos d'affichge
      var interval = $("#interval").val();
      var endTime = getEndTimeGraph();
      
      var startTime = endTime - interval;
      //console.log('Time de debut : %d', startTime);
      //console.log('Time de fin : %d', endTime);
      
      
      // récupération du contexte 2D
      var canvas = document.getElementById("graph");
      var ctx = canvas.getContext("2d");
      
      // calcul des échelles
      var largeur = canvas.width;
      var hauteur = canvas.height;
      var nbMin = interval;
      var echelleX = largeur / nbMin;
      var echelleY = hauteur / 100; // de 0 à 100 en vertical
      
      //console.log('Echelles :');
      //console.log('%d min sur %d px -> coeff = %d', nbMin, largeur, echelleX);
      
      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      //affichage des grilles
      ctx.strokeStyle = '#444444';
      ctx.fillStyle = '#444444';
      ctx.lineWidth = 1;
      for(var i=0; i < 100; i += 10){
        var y = (100 - i) * echelleY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.fillText(i, 0, y - 1);
      }
      
    
      ctx.strokeStyle = "black";
      ctx.font = "12px serif";
    
      for(nom in dataStorage.data){
        var afficher = $('#settings input.'+nom).is(':checked');
        if(afficher){
          ctx.lineWidth = 2;
          ctx.strokeStyle = dataStorage.couleurs[nom];
          ctx.fillStyle = dataStorage.couleurs[nom];
          ctx.beginPath();
          //console.log('série %s', nom);
          var lastTimeMin = 0;
          for(i in dataStorage.data[nom]){
            //console.log('time valeur : %d', dataStorage.data[nom][i].time / 6000);
            var timeMin = dataStorage.data[nom][i].time / 60000; 
            if(timeMin >= startTime && timeMin <= endTime){
              
              var minutesX = timeMin - startTime;
              //console.log(timeMin);
              var x = minutesX * largeur / nbMin;
              var y = hauteur - dataStorage.data[nom][i].valeur * echelleY;
              //console.log('%s %d > %d, %d',nom, i, minutesX, y);
              if(timeMin - lastTimeMin > 2880){
                ctx.stroke();
                ctx.fillText(nom, x, y);
                ctx.moveTo(x, y);
              }
              else ctx.lineTo(x, y);
              lastTimeMin = timeMin;
            }
          }
          // fin de tracé
          ctx.stroke();
        }
      }
      
    }

    function drawUserEvent(mousePos){
      var ctx = canvas.getContext("2d");

      // couleur inteface
      ctx.strokeStyle = "#3A1402";
      ctx.fillStyle = "#3A1402";

      // cercle position souris
      /*ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 5,0,2*Math.PI);
      ctx.stroke();*/

      // convertion de l'absice en date
      var interval = $("#interval").val();
      var endTime = getEndTimeGraph();
      var startTime = endTime - interval;
      var widthCanvas = canvas.width;
      var timeMouse = interval * mousePos.x / widthCanvas;
      timeMouse += startTime;
      timeMouse *= 60000;
      var dateMouse = new Date(timeMouse);

      // convertion de l'ordonnée en valeur
      var heightCanvas = canvas.height;
      var valeurMouse = mousePos.y * 100 / heightCanvas;

      var jourStr = dateMouse.getDate() + '/' + dateMouse.getMonth() + '/' + dateMouse.getFullYear();
      var heureStr = dateMouse.getHours() + ':' + dateMouse.getMinutes() + ':' + dateMouse.getSeconds();
      var datePrint = dateToPrettyStr(dateMouse);
      if(mousePos.x > (2 / 3 * widthCanvas)){
        var longeurTxt = ctx.measureText(datePrint).width;
        ctx.fillText(datePrint, mousePos.x - 10 - longeurTxt, heightCanvas - 6);
      }else
        ctx.fillText(datePrint, mousePos.x + 10, heightCanvas - 6);
      ctx.beginPath();
      var hauteurMouse = heightCanvas - mousePos.y;
      ctx.moveTo(mousePos.x, mousePos.y + (hauteurMouse / 3));
      ctx.lineTo(mousePos.x, heightCanvas);
      ctx.stroke();


      // recherche des points à proximité
      var echelleX = widthCanvas / interval;
      var echelleY = heightCanvas / 100; // de 0 à 100 en vertical
      
      var distanceMin = distance(0, 0, widthCanvas, heightCanvas);
      var ptSelect = -1;
      var ligneSelect = '';
      for(nom in dataStorage.data){
        var afficher = $('#settings input.'+nom).is(':checked');
        
        if(afficher){
          //console.log('Recheche de point pour %s', nom);
          for(i in dataStorage.data[nom]){
            var timePt = dataStorage.data[nom][i].time / 60000; // en minutes
            
            var minutesX = timePt - startTime;
            var x = minutesX * widthCanvas / interval;
            var y = heightCanvas - dataStorage.data[nom][i].valeur * echelleY;

            var dist = distance(mousePos.x, mousePos.y, x, y);
            //console.log('distance pour le point %d = %d', i, dist);
            if(dist < distanceMin){
              ligneSelect = nom;
              ptSelect = i;
              distanceMin = dist;
              //console.log('Nouvelle distanceMin = %d', distanceMin);
            }
          }
          
        }
      }
      if(ptSelect != -1 && distanceMin < 20){
        ctx.strokeStyle = dataStorage.couleurs[ligneSelect];
        ctx.fillStyle = dataStorage.couleurs[ligneSelect];
        ctx.beginPath();

        var timePt = dataStorage.data[ligneSelect][ptSelect].time / 60000; // en minutes
        var minutesX = timePt - startTime;
        var x = minutesX * widthCanvas / interval;
        var y = heightCanvas - dataStorage.data[ligneSelect][ptSelect].valeur * echelleY;

        ctx.arc(x, y, 5,0,2*Math.PI);
        ctx.stroke(); 

        var datePt = new Date(dataStorage.data[ligneSelect][ptSelect].time);
        var datePtStr = dateToPrettyStr(datePt);
        var message = dataStorage.data[ligneSelect][ptSelect].valeur + '  @  ' + datePtStr;
        var dimTxt = ctx.measureText(message).width;
        if(mousePos.y < 50) posY = -1;
        else posY = 1;
        if(x  > widthCanvas * 2 / 3){
          // affichage à gauche
          ctx.beginPath();
          ctx.moveTo(x - 10, y - (10 * posY));
          ctx.lineTo(x - 30, y - (30 * posY));    
          ctx.stroke();
          ctx.clearRect(x - 36 - dimTxt, y - 8 - (30 * posY), dimTxt + 4, 16);
          ctx.fillText(message, x - 35 - dimTxt, y + 4 - (30 * posY));
        }else{
          // affichage à droite
          ctx.beginPath();
          ctx.moveTo(x + 10, y - (10 * posY));
          ctx.lineTo(x + 30, y - (30 * posY));
          ctx.stroke();
          ctx.clearRect(x + 30, y - 8 - (30 * posY), dimTxt + 4, 16);
          ctx.fillText(message, x + 33, y + 4 - (30 * posY));
        }


      }else{
        // cercle position souris
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 5,0,2*Math.PI);
        ctx.stroke();
      }
}

    function recCouleurs(){
      var couleursStr = '{'
      for(nom in dataStorage.couleurs){
        //console.log('%s -> %s', nom, dataStorage.couleurs[nom]);
        //couleursStr += '"' + nom + '":' + dataStorage.couleurs[nom] + ',';
      }
      //JSON.stringify(couleurs);
      
      //$.cookie('couleurs', couleurs, { expires: 30 });
      //console.log('Rec couleurs : %s', couleursStr);
    }

    function getEndTimeGraph(){
      var dateFin = $('#dateFin').val();
      if(dateFin == "NOW"){
        var endTime = new Date().getTime() / 60000;
      }else{
        var endTime = new Date().getTime() / 60000; // champs dans effet pour le moment
      }
      return endTime;
    }
}); // FIN JQUERY

function dateToPrettyStr(dateobj){
  var jourStr = dateobj.getDate() + '/' + dateobj.getMonth() + '/' + dateobj.getFullYear();
  var heureStr = dateobj.getHours() + ':' + dateobj.getMinutes() + ':' + dateobj.getSeconds();
  return jourStr + '  ' + heureStr;
}
function dateToString(dateObj){
	var dateStr = padStr(dateObj.getFullYear()) + '-' +
                  padStr(1 + dateObj.getMonth()) + '-' +
                  padStr(dateObj.getDate()) + ' ' +
                  padStr(dateObj.getHours()) + ':' +
                  padStr(dateObj.getMinutes()) + ':' +
                  padStr(dateObj.getSeconds());
    //console.log (dateStr );
    return dateStr;
}
function dateFromString(dateStr){
  // fonction de création d'objet Date à partir d'une chaine au format SQL
  var regex = new RegExp('[-: ]', 'g');
  var dateTab = dateStr.split(regex);
  var dateObj = new Date(dateTab[0], dateTab[1] - 1, dateTab[2], dateTab[3], dateTab[4], dateTab[5]);
  return dateObj;
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

function distance(x1, y1, x2, y2){
  var dx = x2 - x1;
  var dy = y2 - y1;
  var dx2 = dx * dx;
  var dy2 = dy * dy;
  var dist = Math.sqrt(dx2 + dy2);
  return dist;
}