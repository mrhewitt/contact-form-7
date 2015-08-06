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

			// there is premesis data, include this data into the select box, and show it
			var has_premesis = false;
			var select = wrap.find('select[name=wp7cf_postcode_premesis]');
			if ( typeof response.PremiseData !== 'undefined' && response.PremiseData.length > 0 ) {
				select.empty();
				select.append('<option value="" selected>--</option>');
				for ( var i = 0; i < response.PremiseData.length; i++ ) {
					if ( response.PremiseData[i] != "" ) {
						select.append('<option value="'+response.PremiseData[i]+'">'+response.PremiseData[i]+'</option>');
					}
				}
				has_premesis = true;
				select.closest('.wp7cf_postcode_premesis_wrap').show();
			} else {
				select.closest('.wp7cf_postcode_premesis_wrap').hide();
			}
			
			wrap.find('input[name=wp7cf_postcode_addr1]').val(response.Address1);
			wrap.find('input[name=wp7cf_postcode_addr2]').val(response.Address2);
			wrap.find('input[name=wp7cf_postcode_town]').val(response.Town);
			wrap.find('input[name=wp7cf_postcode_county]').val(response.County);
			wrap.find('input[type=hidden]').val( (has_premesis ? "\n" : "")+response.Address1+"\n"+response.Address2+"\n"+response.Town+"\n"+response.County+"\n"+response.Postcode);
			
			// only enable the submit button if there are no premises to select from
			if ( !has_premesis ) {
				wrap.closest('form').find('input[type=submit]').attr('disabled',false).removeAttr('disabled');
			}
			
			wrap.find('.wpcf7-postcode-address').css({display:'block'});
		} else {
			wrap.find('.wpcf7-postcode-address').css({display:'none'});
			wrap.closest('form').find('input[type=submit]').attr('disabled','disabled');
			alert(response.ErrorMessage);
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
								wrap.find('input[type=hidden]').val( jQuery(this).val() + "\n" + address.join("\n") );
							} else {
								// disable it if they clear the selection
								wrap.closest('form').find('input[type=submit]').attr('disabled','disabled');
							}
					}); 
});