'use strict';
// alert("Working fine");

$('#form-container').hide();

$('#update-button').on('click', function(){
  $('#form-container').toggle();
  // alert('clicked');
});
let showMenu = true;

// to hide select button from details page
$('#select-button').hide();

$('#menu-bar').on('click', function(){
  $('#menu').slideToggle(1000,function(){
    showMenu =!showMenu;
    if(!showMenu){
      for(let i=50;i>=0; i--)
        $('#menu-bar').animate({'margin-left':`${i}px`},25);
    }
  });
});