/**
 * Javascript to handle the submission and selections within the postcode field
 */
function wp7cf_postcode_lookup(self) {
	var wrap = self.closest('.wpcf7-form-control-wrap');
	var data = {
		action: "wpcf7_postcode_lookup",
		postcode: wrap.find('input[name=wp7cf_postcode_code]').val()
	};
	
	// the ajax will verify the postcode with the postcode software API and return a valid address
	jQuery.post(postcode_object.ajax_url, data, function(response) {
		if ( response.ErrorNumber == "0" ) {
			wrap.find('.wpcf7-postcode-address').css({display:'block'});
			wrap.find('input[name=wp7cf_postcode_addr1]').val(response.Address1);
			wrap.find('input[name=wp7cf_postcode_addr2]').val(response.Address2);
			wrap.find('input[name=wp7cf_postcode_county]').val(response.County);
			wrap.find('input[type=hidden]').val(response.Address1+"\n"+response.Address2+"\n"+response.County+"\n"+response.Postcode);
			wrap.closest('form').find('input[type=submit]').attr('disabled',false).removeAttr('disabled');
		} else {
			wrap.find('.wpcf7-postcode-address').css({display:'none'});
			wrap.closest('form').find('input[type=submit]').attr('disabled','disabled');
			alert(response.ErrorMessage);
		}
	},'json');
}
// any forms with a postcode field on them will start as disabled by default as user must select a postcode to continue
jQuery(document).ready( function() { jQuery('.wpcf7-form-control-wrap.wpcf7-form-postcode-enabled').closest('form').find('input[type=submit]').attr('disabled','disabled'); } );