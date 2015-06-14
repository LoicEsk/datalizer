// script pour lire et afficher les données


// console.log('Datalizer présent !!');

var dataStorage = {
  fromDate : new Date(),
  toDate : new Date(),
  data : []
}

var couleurs = [
  "aqua  ", 
  "black  ", 
  "blue  ", 
  "fuchsia", 
  "gray  ", 
  "green  ", 
  "lime", 
  "maroon", 
  "navy", 
  "olive", 
  "purple", 
  "red", 
  "silver", 
  "teal", 
  "white", 
  "yellow"
 ];

jQuery(document).ready(function($) {
    

    if(document.getElementById('datalizer')){
      
      // dimensionement du canvas
      /*$('#graph').width($('#ajaxOut').width());
      $('#graph').height($('#graph').width() * 1/2);*/
      
      var dateNow = new Date();
      var time1an = 1000 * 60 * 60 * 24 * 365;
      //var time1mois = 1000 * 60 * 60 * 24 * 30; // pour les tests avec moins de valeurs
      var fromTime = dateNow.getTime() - time1an;
      var fromDate = new Date(fromTime);
      
      dataStorage.fromDate = fromDate;
      dataStorage.toDate = dateNow;
      
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
          drawGraph();
      });
      $(window).trigger('resize');
    }
    
    $('#interval').change(function(){
      // mise à jour des infos
      drawGraph();
      // mise à jour des données
      getData();
    })
    
    function getData(){
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
  		$.post(datalizer_vars.ajax_url, data, function(response) {
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
          console.log('Nouvelle donnes "%s" trouvee', nom);
        }
      }
      // tri des lignes
      newLines.sort();
      for(var i in newLines){
        console.log('Insertion de %s', newLines[i]);
        var cmd = $('<tr/>').html('<th><input class="' + newLines[i] + '" type="checkbox" checked="true">'+ newLines[i] + '</th><td class="' + newLines[i] + '"></td>');
        zoneSetting.append(cmd);
        $('#settings input.'+newLines[i]).change(function(){
          //console.log('Changement de ' + $(this).attr('class'));
          drawGraph();
        })
      }
      
      // affichage du tableau de bord
      for(var nom in dataStorage.data){
        var derValeur = dataStorage.data[nom][dataStorage.data[nom].length -1].valeur;
        $('td.' + nom, zoneSetting).text(derValeur);
      }
    }
    
    
    function drawGraph(){
      // tracé du graph de valeurs
      
      // récupération des infos d'affichge
      var interval = $("#interval").val();
      var dateFin = $('#dateFin').val();
      //console.log('Interval = %d', interval);
      //console.log('Date de fin : %s', dateFin);
      
      if(dateFin == "NOW"){
        var endTime = new Date().getTime() / 60000;
      }else{
        var endTime = new Date().getTime() / 60000; // champs dans effet pour le moment
      }
      
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
          //ctx.strokeStyle = 'blue';
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
});

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