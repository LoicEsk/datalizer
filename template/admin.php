<?php
	// lecture des données
	global $menth_db_version;
	global $wpdb;
	global $datalizer_table;

	$compte = $wpdb->get_var( "SELECT COUNT(*) FROM $datalizer_table" );
?>
<div class="wrap">
	<h2>Menthe à l'eau</h2>

	<div class="metabox-holder">
		<div class="postbox">
			<h3 class="hndle">Infos plugin</h3>
			<div class="inside">
				<ul>
					<li>Version bdd : <strong><?php echo($menth_db_version); ?></strong></li>
					<li>Nom de la table : <strong><?php echo($datalizer_table); ?></strong></li>
					<li>Nombre d'entrées : <strong><?php echo($compte); ?></strong></li>
				</ul>
			</div>
		</div>
		
		<div class="postbox">
			<h3 class="hndle">Utilisation</h3>
			<div class="inside">
				<p>Utiliser le shortcode <em>[datalizer]</em> là où vous voulez insérer la visualisation</p>
			</div>
		</div>

		<div class="postbox">
				<h3 class="hndle">Visualisation</h3>
				<div class="inside">
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
				</div>
			</div>

		</div>

</div><!-- .wrap -->