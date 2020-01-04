---
layout: post
title: "Web 보안"
date: 2020-01-03 19:30:00 +0000
description: about web security
categories: devinfo
tags: Sql-Injection XSS Brute-Force Security
---

워낙 잘 되어있는 사이트들이 있어서 내용만 정리해둔다.

---

### SQL Injection

웹 보안하면 가장 대중적으로 언급되는 공격기법 중에 하나로 이 해킹 공격을 도와주는 자동화 툴도 쉽게 구할 수 있다고 한다. 이 방식은 웹 어플리케이션이 데이터베이스와 연동하는 모델에서 가능하다. 이용자의 입력값이 SQL 구문의 일부로 사용될 경우 SQL 구문이 데이터베이스에 그대로 전달되어 비정상적인 수행을 의도케 하는 것이다.

예를 들어, 로그인 폼을 대상으로 계정 정보 없이도 로그인을 우회하여 인증을 획득할 수 있고 데이터 획득/변경/삭제가 가능하다. 또한 일부 데이터베이스의 경우 확장 프로시저를 호출하여 원격으로 시스템 명령어를 수행할 수 있도록 한다.  

SQL Injection 방식

1. 로그인 우회: select * from users where userid = 'admin' and password = '1234' or '1' = '1'  
2. 비정상 쿼리 수행: select * from users where userid = 'admin'; delete from users -- and password='1234'
3. 시스템 명령 실행: select * from users where userid = 'admin'; exec master.dbo.xp_cmdshell 'cmd.exe dir c:' -- and password = '1234'  

Blind SQL Injection 방식

1. Boolean-based: select * from boards where title = 'hello' and ASCII(LEFT((select password from users where userid = 'admin'), 1)) > 91
2. Time-based: select * from boards where title = 'hello'; if system_user = 'sa' waitfor delay '00:00:5'  

SQL Injection 취약성 판단 (로그인창, 검색창, get url 파라메터값, 기타 외부 입력값으로 보이는 모든 곳)

1. 자동화 툴을 통해 스캐닝
2. 사용자 입력 값에 '(싱클쿼터)를 주입했을 때 오류를 뱉는지 확인   

대응방안

- 웹 방화벽(WAF) 도입: 물리적 방식, 논리적 방식
- 시큐어 코딩: 블랙 리스트 방식(키워드 제한), 화이트 리스트 방식(특정 문자만 허용)
- 동적 쿼리 사용 제한: prepared statement 사용(매개변수 값이 sql 문에 영향을 주지 않음)
- 오류 메세지 출력 제한: db 오류 출력 금지, 추상화된 안내 메세지
- db 계정 관리: 관리자 계정과 웹 어플리케이션 접근 계정 분리, 웹 어플리케이션 권한 제한
- 기본/확장 프로시저 제거
- 지속적 취약점 점검, 로깅과 모니터링

---

### Brute Force 방식

이 용어는 무차별적으로 대입해 억지로 문제를 푸는 단순한 공격 기법이다. 무작위로 순차 대입을 하거나 일반적인 사전 대입을 통해 무차별적으로 공격을 시도한다. 대부분의 툴을 이용한 자동화된 공격을 수행한다.  

대응 방안

- 안전한 패스워드 사용
- 로그인 시도 횟수 제한: 계정 잠금, 캡챠
- 다중 인증
- 로깅, 모니터링

---

### XSS(Cross-Site Scripting) 방식

약자로 표현하면 CSS 이지만 이미 CSS는 널리 알려진 약어가 있기 때문에 XSS라고 불려진다. SQL Injection과는 다르게 스크립트를 삽입해서 다른 사용자를 공격하는 방식이다.

1. 저장 XSS 공격: 게시판, 코멘트 필드 등에 악성 스크립트를 삽입하여 사용자가 사이트를 방문하여 페이지 정보를 요청할때 스크립트가 실행되면서 공격을 가한다.
2. 반사 XSS 공격: 이메일, 다른 웹사이트를 통해 사용자가 서버로 입력한 값(ID/PW/Session)을 공격자에게 전송한다.  

대응 방안

- 특정 문자에 대한 필터 또는 인코딩을 하여 스크립트를 동작하지 못 하게 막는 방법
- 라이브러리 이용 방법: OWASP Antisamy, Naver Lucy XSS Filter, ESAPI 등
