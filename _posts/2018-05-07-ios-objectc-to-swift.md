---
layout: post
title: "Object-C에서 C++컴파일부터 Swift까지"
date: 2018-05-07 19:30:00 +0000
description: Object-C에서 C++을 같이 컴파일하고, Swift에서 사용할 때 발생했던 문제들을 다룬 포스팅
categories: [iOS, issue]
tags: [iOS, issue]
img: ios.jpg
---

c++ 라이브러리를 사용하여 iOS를 코딩하며 발생하였던 문제 및 팁들에 대해 다루는 포스팅이다. 생각나는 부분 몇 가지를 지속적으로 적어두려 한다.

___

### 1. C++ & Object-C

 - C++ 파일의 확장자는 .mm 파일이어야 컴파일이 가능하다.
 - Folder를 연결할 때는 Create Group 또는 Folder Reference 중 선택을 할 수 있는데, Create Group은 namespace가 없는 형태 즉, 폴더 구조 없이 헤더를 참조 할 수 있다고 생각하면 된다. Folder Reference는 그 반대.
 - 라이브러리로 생성되는 .a 파일을 사용할 경우 헤더 파일이 필요하기 때문에 헤더를 공개해야 하는 경우, Build Phases에서 Copy Files로 헤더를 등록해두면 배포 관리가 쉽다.
 - cpp 외부 소스를 연결할 경우 Build Phases에 Compile Source에 항목이 누락될 수 있고, 이를 라이브러리화 시키는 경우 링크 오류가 발생한다.

___

### 2. C++ & Swift

 - object-c로 생성한 .a 라이브러리를 swift로 연결해야하는 경우 bridge.h 파일을 생성해서 사용하려는 헤더를 import 해야한다.
 - 사용하려는 .a 라이브러리가 c++ 소스를 포함하고 있다면, Build Settings->Other Linker Flags 항목에 추가해줘야 한다. (-lc++ , -ObjC) 하지 않은 경우 c++을 인식하지 못 하고 링크 오류가 발생한다.
