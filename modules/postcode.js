/**
 * Javascript to handle the submission and selections within the postcode field
 */
function wp7cf_postcode_lookup(self) {
	var wrap = self.closest('.wpcf7-form-control-wrap.wpcf7-form-postcode-enabled');
	var data = {
		action: "wpcf7_postcode_lookup",
		postcode: wrap.find('input[name=wp7cf_postcode_code]').val()
	};
	
	// show the loader
	wrap.find('.ajax-loader').show();
	
	// the ajax will verify the postcode with the postcode software API and return a valid address
	jQuery.post(postcode_object.ajax_url, data, function(response) {
		// hide the ajax loader
		wrap.find('.ajax-loader').hide();
		wrap.closest('form').find('input[type=submit]').attr('disabled','disabled');
			
		if ( response.ErrorNumber == "0" ) {
			
			// populate the select list with the choice of addresses
			var select = wrap.find('select[name=wp7cf_postcode_premesis]');
			select.empty();
			select.append('<option value="" selected>--</option>');
			for ( var i = 0; i < response.PremiseData.length; i++ ) {
				if ( response.PremiseData[i] != "" ) {
					select.append('<option value="'+response.PremiseData[i]+' '+response.Address1+'">'+response.PremiseData[i]+" "+response.Address1+", "+response.Address2+", "+response.Town+'</option>');
				}
			}
			wrap.find('.wp7cf-ostcode-choice-wrap').show();
			wrap.find('.wp7cf-postcode-address-wrap').hide();
			wrap.find('.wpcf7-postcode-address').show();
			
			wrap.find('input[name=wp7cf_postcode_addr1]').val(response.Address1);
			wrap.find('input[name=wp7cf_postcode_addr2]').val(response.Address2);
			wrap.find('input[name=wp7cf_postcode_town]').val(response.Town);
			wrap.find('input[name=wp7cf_postcode_county]').val(response.County);
			wrap.find('input[type=hidden]').val( response.Address1+"\n"+response.Address2+"\n"+response.Town+"\n"+response.County+"\n"+response.Postcode);

		} else {
			wrap.find('.wpcf7-postcode-address').css({display:'none'});
			alert(response.ErrorMessage.replace('error ',''));
		}
	},'json');
}
// any forms with a postcode field on them will start as disabled by default as user must select a postcode to continue
jQuery(document).ready( function() { 
	jQuery('.wpcf7-form-control-wrap.wpcf7-form-postcode-enabled').closest('form').find('input[type=submit]').attr('disabled','disabled'); 
	// bind a change handler to any premise select fields so we can handle updating the address when the user picks a premise
	jQuery('.wpcf7-form-control-wrap.wpcf7-form-postcode-enabled').on('change',
						'select[name=wp7cf_postcode_premesis]', 
						function() {
							var wrap = jQuery(this).closest('.wpcf7-form-control-wrap');
							if ( jQuery(this).val() != '' ) {
								// enable the submit button when the user picks a premesis
								wrap.closest('form').find('input[type=submit]').attr('disabled',false).removeAttr('disabled');
								// update the saved address by taking off firest part (premesis) and putting new value on
								// because this field is available we know that there is a premesis available
								var address = wrap.find('input[type=hidden]').val().split("\n");
								address.shift();
								wrap.find('input[name=wp7cf_postcode_addr1]').val( jQuery(this).val() );
								wrap.find('input[type=hidden]').val( jQuery(this).val() + "\n" + address.join("\n") );
								wrap.find('.wp7cf-postcode-address-wrap').show();	
								wrap.find('.wp7cf-ostcode-choice-wrap').hide();
							} else {
								// disable it if they clear the selection
								wrap.find('.wp7cf-postcode-address-wrap').hide();	
								wrap.closest('form').find('input[type=submit]').attr('disabled','disabled');
							}
					}); 
	// handle typing into the text box, if it is not empty then enable the lookup button
	jQuery('.wpcf7-form-control-wrap.wpcf7-form-postcode-enabled').on('keyup',
					 'input[name=wp7cf_postcode_code]',
					 function() {
						if ( jQuery(this).val() == '' ) {
							jQuery(this).next('button').attr('disabled','disabled');
						} else {
							jQuery(this).next('button').attr('disabled',false).removeAttr('disabled');
						}
					});
});