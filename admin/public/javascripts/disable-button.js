/*global $*/
$('#btnSubmit').attr('disabled', true);

function updateFormEnabled() {
    if (verifyAdSettings()) {
        $('#btnSubmit').attr('disabled', false);
    } else {
        $('#btnSubmit').attr('disabled', true);
    }
}

function verifyAdSettings() {
    if ($('#seleccionarEvento').val() != '') {
        return true;
    } else {
        return false
    }
}

$('#seleccionarEvento').change(updateFormEnabled);