function wrapWindowByMask(){
  //화면의 높이와 너비를 구한다.
  var maskHeight = $(document).height();
  var maskWidth = $(window).width();
  //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채운다.
  $('#mask').css({'width':maskWidth,'height':maskHeight});
  //마스크의 투명도 처리
  $('#mask').fadeTo("slow",0.1);
}

$(document).ready(function() {
  $("#sidebar-toggle").click(function(){
    $('.sidebar').addClass('open');
    wrapWindowByMask();
  });
  $('#mask').click(function () {
    $(this).hide();
    $('.sidebar').removeClass('open');
  });
});
