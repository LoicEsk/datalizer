<?php
/*
Plugin Name: Datalizer
Plugin URI: https://github.com/LoicEsk/datalizer
Description: A plugin to view and analayse physical data
Version: 0.2.4
Author: Loïc Laurent
Author URI: http://loiclaurent.com
License: GPLv2 or later
Text Domain: datalizer
GitHub Plugin URI: https://github.com/LoicEsk/datalizer
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

// variables globales
global $wpdb;
global $datalizer_db_version;
$datalizer_db_version = get_option( "datalizer_db_version" );
global $datalizer_table;
$datalizer_table = $wpdb->prefix . 'data_datalizer';

// hooks ajax
add_action( 'wp_ajax_datalizer_getData', 'datalizer_getData' ); // hook pour l'admin
add_action( 'wp_ajax_nopriv_datalizer_getData', 'datalizer_getData' ); // hook pour l'accès public
function datalizer_getData() {
	global $wpdb; // this is how you get access to the database
	global $datalizer_table;

	$fromDate = $_POST['fromDate'];
	$toDate = $_POST['toDate'];

	$resultats = $wpdb->get_results( "SELECT * FROM $datalizer_table WHERE time BETWEEN '$fromDate' AND '$toDate'" );
	echo(json_encode($resultats));

	wp_die(); // this is required to terminate immediately and return a proper response
}

add_action( 'wp_ajax_nopriv_datalizer_setData', 'datalizer_setData' ); // hook d'enregistrement
function datalizer_setData() {
	global $datalizer_table;
	global $wpdb;

	
	if(!isset($_POST['date']))
		$date = date('Y-m-d H:i:s', time());
	else
		$date = $_POST['date'];
	$nom = $_POST['donnee'];
	$valeur = $_POST['valeur'];

	$wpdb->query( $wpdb->prepare( 
		"INSERT INTO $datalizer_table VALUES ( '', %s, %s, %s )", 
		$date,
		$nom, 
		$valeur 
	));

	printf("Données reçues : %s : %s = %s )", $date, $nom, $valeur );

	wp_die();
}

// page admin
add_action( 'admin_menu', 'register_datalizer_admin_page' );
function register_datalizer_admin_page() {
	add_menu_page( 'Datalizer', 'Datalizer', 'edit_pages', 'datalizer/template/admin.php', '', 'dashicons-chart-area', 30 );
}

// JS pour la page admin
add_action( 'admin_enqueue_scripts', 'datalizer_enqueue' );
function datalizer_enqueue($hook) {
        
	// css
	wp_enqueue_style('datalizer-css', plugins_url( '/template/datalizer.css', __FILE__ ));
	
	// js
	wp_enqueue_script( 'jquery-cookie', plugins_url('js/jquery.cookie.js', __FILE__), array('jquery') );
	wp_enqueue_script( 'ajax-script', plugins_url( '/js/datalizer.js', __FILE__ ), array('jquery', 'jquery-cookie') );

	// in JavaScript, object properties are accessed as ajax_object.ajax_url, ajax_object.we_value
	wp_localize_script( 'ajax-script', 'datalizer_vars',
            array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'we_value' => 1234 ) );
}

// shortcode intégration
function shortcode_datalizer($attr){
	datalizer_enqueue(null);
	/*ob_start();
	include(plugin_dir_path( __FILE__ ).'template/output-datalizer.php');
	return ob_get_clean();*/

	$output = '
	<div id="datalizer">
		<script type="text/javascript">
			// config
		</script>
		<div class="loaderLayout"><span class="spinner"></span><br />Chargement ...</div>
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
	</div>';
	return $output;
}
add_shortcode( 'datalizer', 'shortcode_datalizer' );

// Installation
// création des bases de données
function datalizer_install() {
	global $wpdb;
	global $datalizer_db_version;

	global $datalizer_table;
	$table_name = $datalizer_table;
	
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
		id mediumint(9) NOT NULL AUTO_INCREMENT,
		time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
		nom text NOT NULL,
		valeur float DEFAULT NULL,
		UNIQUE KEY id (id)
	) $charset_collate;";

	require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
	dbDelta( $sql );

	add_option( 'datalizer_db_version', '1.0' );
}
register_activation_hook( __FILE__, 'datalizer_install' );

