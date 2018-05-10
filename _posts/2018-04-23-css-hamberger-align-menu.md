---
layout: post
title: "블로그의 시작-01, 헤더 추가"
date: 2018-04-23 13:32:20 +0300
description: 블로그의 화면이 작은 사이즈인 경우 사이드바 대신 헤더를 사용하도록 변경
categories: [css, jquery]
tags: [css, jquery, blog]
img: js.jpg
---

첫 번째 github 블로그 시작기! 지킬을 설치하고 config.yml을 설정하는 방법들은 메뉴얼 및 기타 사이드에 정보가 너무 많으니 생략한다.

먼저, [http://jekyllthemes.org/themes/flexible-jekyll/](http://jekyllthemes.org/themes/flexible-jekyll/) 에서 테마를 가져왔다. (_테마를 가져와서 사용할 경우 장점은 사용하고 싶은 레이아웃을 고를 수 있고 여러가지 css를 구현해줄 필요가 없다는 것이 큰 장점이나 사용하다보니 마음에 들지 않는 css들이 대거 등장하는 것이 단점이었다._)

![promo-img](/assets/img/post-src/promo-img.jpg)

---  
<br>

현재는 거의 사이트를 그대로 사용하고 있다고 봐도 무방한 수준..
웹을 해본 경험이 없어서 하나씩 더듬거리며 블로그를 만들어갈 예정이다.

원래 이 사이트에서는 브라우저 창의 크기가 줄어들면 사이드바를 헤더처럼 사용하였는데, 윗 칸을 너무 많이 차지하는 것이 마음에 들지 않았다.

그래서 브라우저가 태블릿 이하 사이즈로 줄어들 경우는 사이드바를 사이드바 left 크기만큼 -px을 주고 사이드바를 숨겼다.

그리고 header div 를 하나 추가했더니 아래처럼... 난리가 났다.

![first-header](/assets/img/post-src/first-header.png)

---  
<br>

헤더에 넣고 싶었던 내용은 사이트 제목과 대표 이미지, 그리고 햄버거 버튼이었다. 대표 이미지를 같은 inline-box 에 정렬하자니 위와 같이 구도를 잡기 어려워서 float: right로 밀어버리고 햄버거 버튼과 텍스트는 따로 정렬하였다.

그리고 아래처럼 햄버거 버튼용 div를 하나 추가하고 css를 적용하였다. (_아래 마법같은 css는 여러 사이트의 햄버거 버튼을 참조하였다. 놀라울 정도로 간단한 내용이라서 이 글을 적는 지금은 이해를 하지 못하고 일단 사용 중이다._)

```css
.header-nav #sidebar-toggle::before {
    font: normal normal normal 23px/1 FontAwesome;
    content: "\f0c9";
}
```

그리고 지금과 같은 헤더로 바뀌었다.

![second-header](/assets/img/post-src/second-header.png)

---  
<br>

햄버거 버튼을 만들었으니 버튼 기능을 추가해야하는데.. 이번엔 자바 스크립트.. 마침 타이밍 좋게 자바 스크립트를 공부 중이었다.

![clicked-hamberger](/assets/img/post-src/clicked-hamberger.png)

위와 같이 버튼을 클릭했을 때 jqeury로 'open' 클래스를 추가해주고 바탕에 마스크 div를 씌워서 마스크를 클릭하는 경우 추가한 'open' 클래스를 제거해준다. 'open' 클래스가 추가된 경우 css에 sidebar의 left를 0px로 바꾸고 transition 처리를 해서ß 애니메이션처럼 적용하였다. (_mask div는 검색하니 많이 나온다_)

```javascript
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
```

현재는 너무 휑한 사이드바지만, 추후에 nav-bar로 사용할 예정이다.
