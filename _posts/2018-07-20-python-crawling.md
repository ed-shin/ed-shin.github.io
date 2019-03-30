---
layout: post
title: "파이썬으로 크롤링하기"
date: 2018-06-20 19:30:00 +0000
description: Python을 사용한 Crawling 방법
categories: devlog
tags: Python
img: python.jpg
---

특정 검색 사이트에서 수천개의 단어를 검색해야 하는 일을 자동화하였고 이를 위해 파이썬을 이용해 크롤링하였다. 파이썬 크롤링을 하면서 두 가지 방법을 사용하였는데 그 두가지에 대해서 나열한다.

---

### 1. requests & BeautifulSoup를 이용한 크롤링

`requests`는 파이썬에 내장된 라이브러리인데, 간단하게 다음과 같이 요청하고 응답을 받을 수 있다.

```python
import requests

response = requests.post(url, data=self.data)
```

url은 서버로 요청하는 query 주소이고 data는 post의 key, value값이다. url과 data 정보는 브라우저에서 검색 요청을 하였을 때 `Network` 탭을 참고하여 가져올 수 있고 세팅된 정보는 바로 파이썬으로 실행해보는 것보다는 `postman`과 같은 앱을 사용하여 테스트한 뒤 결과 값을 참고하는 것을 권장한다.

`postman`으로 query한 결과를 보면 서버에 따라 응답이 여러 타입(html, xml 등)으로 나뉠 수 있는데, 이번 같은 경우엔 html을 파싱하여 원하는 정보를 가져왔다. 응답받은 html 데이터는 `BeautifulSoup4` 라는 파이썬 라이브러리를 사용하여 파싱할 수 있었으며 `pip install bs4` 를 사용하여 쉽게 설치가 가능하다. 아래는 사용한 예이다.

```python
bs = BeautifulSoup(response.text, 'html.parser')
total_elem = bs.find('span', attrs={'class': 'total'})
```

맨 위에서 응답받은 response의 text 값을 html로 파싱하고 해당 DOMTree에서 span 태그 중 class가 total인 요소를 가져온 것이다. 내가 원하는 정보가 해당 요소의 텍스트 정보라면 `total_elem.text` 로 읽어올 수 있다.

가장 쉽게 크롤링할 수 있는 방법이지만 사용해보니 몇 가지 제약사항이 존재하는 것을 알 수 있었다. 그래서 다른 방법을 하나 추가했다.

---

### 2. selenium을 이용한 크롤링

`selenium`은 직접 브라우저를 실행해서 자동으로 브라우저를 조작하고 브라우저 콘솔에서 사용할 수 있는 것과 비슷한 기능을 제공해준다. 사용방법은 먼저 커맨드창에서 `pip install selenium` 를 실행하여 설치한 다음 [https://sites.google.com/a/chromium.org/chromedriver/downloads](https://sites.google.com/a/chromium.org/chromedriver/downloads) 사이트에서 크롬드라이버를 다운받는다. 다운을 받은 다음 압축을 풀어서 경로를 아래 executable_path에 입력을 해주면 브라우저 객체를 얻을 수 있다.

```python
from selenium import webdriver
browser = webdriver.Chrome(executable_path='chromedriver')
```

브라우저를 여는 방법은 특정 사이트 주소를 아래와 같이 호출하면 해당 사이트로 브라우저가 실행된다.

```python
browser.get('site address')
```

브라우저를 열어서 직접 제어를 하는데 예를 들어, 아래와 같이 텍스트창에 검색어를 입력하고 버튼을 클릭하거나 직접 스크립트 함수를 실행시킬 수도 있다.

```python
browser.find_element_by_id('queryText').send_keys(query)
browser.find_element_by_id('search').click()
browser.execute_script('DoSearch()')
```

검색한 다음 결과는 브라우저에서 find_element_by_id 와 같은 함수를 통해서 원하는 정보를 파싱하고 저장하면 된다.
>주의할 점은 파이썬은 스크립트 언어를 동작시키기 때문에 브라우저에 일어난 결과에서 대해서 기다리지 않으므로 페이지 로딩을 기다리도록 해야한다. 페이지 로딩은 아직 모든 사이트에 적용할만한 해결책은 아직 찾지 못했지만 사이트마다 특정 tag가 검색되기를 기다리거나 강제로 sleep을 주는 방법 등이 있다.
