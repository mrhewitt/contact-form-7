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
			<input type="text" name="wp7cf_postcode_code" maxlength="8" style="text-transform:uppercase;width:128px;margin-right:6px" />
			<button onclick="wp7cf_postcode_lookup(jQuery(this));return false;">Lookup</button>
			<img class="ajax-loader" src="'.wpcf7_ajax_loader().'" alt="Checking..." style="display: none;">
			<div class="wpcf7-postcode-address" style="display:none">
				<div class="wp7cf-ostcode-choice-wrap">
					<div>Select Address</div>
					<div><select name="wp7cf_postcode_premesis"></select></div>
				</div>
				<div class="wp7cf-postcode-address-wrap">
					<div>Address Line 1</div>
					<div><input type="text" name="wp7cf_postcode_addr1" readonly /></div>
					<div>Address Line 2</div>
					<div><input type="text" name="wp7cf_postcode_addr2" readonly /></div>
					<div>Town</div>
					<div><input type="text" name="wp7cf_postcode_town" readonly /></div>
					<div>County</div>
					<div><input type="text" name="wp7cf_postcode_county" readonly /></div>
				</div>
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
	// fetch the data from the postcode SDK
	$data = file_get_contents('http://ws1.postcodesoftware.co.uk/lookup.asmx/getAddress?account=test&password=test&postcode='.urlencode($_POST['postcode']));
	// parse the xml so we can do some processing on the address and convert to JSON
	$address = (array)simplexml_load_string($data);

	// if there is premise data, expand this into an array for easy processing in JS
	if ( !empty($address['PremiseData']) ) {
		$address['PremiseData'] = explode(';',$address['PremiseData']);
		foreach ( $address['PremiseData'] as &$premise ) {
			$premise = str_replace( array('/',' <br> ','|'), ', ', trim($premise,'|'));
		}
	}
	
	// give out API consumer a JSON block in response
	echo json_encode($address);
	wp_die();
}