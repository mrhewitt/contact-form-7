<?php 
/**
 *  A base module for [postcode]
 *
 * Integrates with the http://www.postcodesoftware.net/sdk_web.htm API and allows for automatic
 * population of a UK address based on its postal code
 *
 * @author Mark Hewitt
 * @link https://github.com/mrhewitt/contact-form-7
 *
 */
 
/* Shortcode handler */

add_action( 'wpcf7_init', 'wpcf7_add_shortcode_postcode' );

function wpcf7_add_shortcode_postcode() {
	wpcf7_add_shortcode( 'postcode', 'wpcf7_postcode_shortcode_handler', true );
}

function wpcf7_postcode_shortcode_handler($tag) {
	$tag = new WPCF7_Shortcode( $tag );

	if ( empty( $tag->name ) )
		return '';

	$validation_error = wpcf7_get_validation_error( $tag->name );

	$class = wpcf7_form_controls_class( $tag->type, 'wpcf7-text' );

	if ( $validation_error )
		$class .= ' wpcf7-not-valid';

	$atts = array();

	$atts['class'] = $tag->get_class_option( $class );
	$atts['id'] = $tag->get_id_option();
	$atts['tabindex'] = $tag->get_option( 'tabindex', 'int', true );

	if ( $tag->is_required() )
		$atts['aria-required'] = 'true';

	$atts['aria-invalid'] = $validation_error ? 'true' : 'false';

	$value = (string) reset( $tag->values );

	if ( $tag->has_option( 'placeholder' ) || $tag->has_option( 'watermark' ) ) {
		$atts['placeholder'] = $value;
		$value = '';
	}

	$value = $tag->get_default_option( $value );
	$value = wpcf7_get_hangover( $tag->name, $value );
	$atts['value'] = $value;

	$atts = wpcf7_format_atts( $atts );

	$html = sprintf(
		'<div class="wpcf7-form-control-wrap wpcf7-form-postcode-enabled">
			<input type="hidden" name="'.sanitize_html_class($tag->name).'" />
			<div>Postcode</div>
			<input type="text" name="wp7cf_postcode_code" maxlength="8" style="text-transform:uppercase;width:128px;margin-right:6px" /><button onclick="wp7cf_postcode_lookup(jQuery(this));return false;">Lookup</button>
			<div class="wpcf7-postcode-address" style="display:none">
				<div>Address Line 1</div>
				<div><input type="text" name="wp7cf_postcode_addr1"/></div>
				<div>Address Line 2</div>
				<div><input type="text" name="wp7cf_postcode_addr2"/></div>
				<div>County</div>
				<div><input type="text" name="wp7cf_postcode_county"/></div>
			</div>
		</div>',
		sanitize_html_class( $tag->name ), $atts, $validation_error );
	
	return $html;
}


/**
 * Load the javascript containing the client side handling for postcode fields and setup an ajax
 * action handler for processing the postcode lookup from the form
 */
wp_enqueue_script( 'postcode-ajax-script', plugins_url( 'postcode.js', __FILE__ ), array('jquery') );
wp_localize_script( 'postcode-ajax-script', 'postcode_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' )) );
add_action( 'wp_ajax_wpcf7_postcode_lookup', 'wpcf7_postcode_lookup' );
add_action( 'wp_ajax_nopriv_wpcf7_postcode_lookup', 'wpcf7_postcode_lookup' );

function wpcf7_postcode_lookup() {
	$data = file_get_contents('http://ws1.postcodesoftware.co.uk/lookup.asmx/getAddress?account=test1&password=test1&postcode='.urlencode($_POST['postcode']));
	echo json_encode(simplexml_load_string($data));
	wp_die();
}