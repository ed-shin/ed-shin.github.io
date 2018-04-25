---
layout: post
title: "Welcome to Jekyll!"
date: 2018-04-22 13:32:20 +0300
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img:  # Add image post (optional)
---

자바 빌드 문제 //
다중 프로젝트 연결시 -> JAVA Build Path <Project>n
                  + Project 연결 `Source Link 효과 compile 가능해짐`,
                  + Deployment assembly `다른 프로젝트에서 runtime시 사용가능해짐 없는 경우 ClassNotFoundException`
                  + order and export `package 생성시 dependency 처리`  `add opencv`
                  + system.loadlibrary error `CORE.NATIVE_LIBRARY_NAME` // 내부 정의된 dll 이름을 검색 (위치는 해당 라이브러리 native library 경로)
                  + `Run as Configuration 에서 Java.library.path 경로 지정해 // 기존 프로젝트는 유저라이브러리에서 native 경로를 지정했음 안해주는 경우, UnsatisfiedLinkError`

                -> http://aroundck.tistory.com/766

Open CV 연동 //
