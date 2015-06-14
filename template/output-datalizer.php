<?php
	// HTML output for datalizer view
	
?>

<div id="datalizer">
	<script type="text/javascript">
		// config
	</script>
	<div class="loaderLayout">Chargement ...</div>
	<canvas id="graph" width="100%"></canvas>
	<form id="settings">
		<select id="interval">
		    <option value="535680">Un an</option>
			<option value="267840">6 mois</option>
			<option value="133920">3 mois</option>
			<option value="44640">1 mois</option>
			<option value="10080" selected="true">1 semaine</option>
			<option value="1440">24 heures</option>
		</select>
		<input type="text" id="dateFin" value="NOW">
		
		<table id="dataSelect">
		</table>
	</form>
	<div id="ajaxOut"></div>
</div>
