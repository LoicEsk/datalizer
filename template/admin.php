<?php
	// lecture des données
	global $datalizer_db_version;
	global $wpdb;
	global $datalizer_table;

	$compte = $wpdb->get_var( "SELECT COUNT(*) FROM $datalizer_table" );
	$premiereDate = $wpdb->get_var("SELECT time FROM $datalizer_table ORDER BY time LIMIT 1");
	$derniereDate = $wpdb->get_var("SELECT time FROM $datalizer_table ORDER BY time DESC LIMIT 1");
?>
<div class="wrap">
	<h2>Menthe à l'eau</h2>

	<div class="metabox-holder">
		<div class="postbox">
			<h3 class="hndle">Infos plugin</h3>
			<div class="inside">
				<ul>
					<li>Version bdd : <strong><?php echo($datalizer_db_version); ?></strong></li>
					<li>Nombre d'entrées : <strong><?php echo($compte); ?></strong></li>
					<li>La plus ancienne valeur en base date du <strong><?php echo($premiereDate); ?></strong></li>
					<li>La plus récente date du <strong><?php echo($derniereDate); ?></strong></li>
				</ul>
			</div>
		</div>
		
		<div class="postbox">
			<h3 class="hndle">Utilisation</h3>
			<div class="inside">
				<p>Utiliser le shortcode <strong>[datalizer]</strong> là où vous voulez insérer la visualisation</p>
				<p>
					Les données doivent être envoyé à l'URL {votresite}/wp-admin/admin-ajax.php en POST.<br />
					Elles doivent être formatées de la manière suivant :<br />
				</p>
				<code>
					{ 
					    'action': 'datalizer_setData',
					  'donnee' : donnee,
					  'valeur' : valeur,
					  'date' : date
					}
				</code>
				<p>La date est optionnelle. Si elle est omise, celle du serveur au moment de la requette sera utilisée. Elle doit être au format Y-m-d H:i:s</p>
			</div>
		</div>
	</div>
</div><!-- .wrap -->