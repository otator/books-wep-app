'use strict';
// alert("Working fine");

$('#form-section').hide();

$('#update-button').on('click', function(){
  $('#form-section').toggle();
  // alert('clicked');
});

// to hide select button from details page
$('#select-button').hide();