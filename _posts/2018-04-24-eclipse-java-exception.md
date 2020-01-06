---
layout: post
title: "Java OpenCV를 Eclipse에서 사용하기(Window)"
date: 2018-04-24 18:32:20 +0300
description: 이클립스에서 Java OpenCV를 사용할 때 프로젝트 라이브러리 참조 오류에 대한 문제
categories: devlog
tags: Eclipse JAVA OpenCV Issue
img: java.jpg
---

이클립스에서 자바 프로젝트를 사용하던 중에 발생한 몇 가지 문제를 다룰 포스트이다.

이클립스에서 프로젝트를 구성하다보니 다목적으로 사용할 유틸리티 라이브러리 프로젝트, 외부 라이브러리를 참조한(ex:OpenCV) 프로젝트 및 실행 프로젝트로 나누어 구성하게 되었다. 그 와중에 발생한 여러가지 컴파일 및 빌드 오류 등을 포스트에서 다루려고 한다.

<br>

---
### 1. Projects (JAVA Build Path)
가장 먼저 소스를 작성하고 프로젝트 컴파일 오류가 발생한 부분이다. 다른 프로젝트의 namespace를 참조하지 못하는 오류를 볼 수 있다.

프로젝트 우클릭으로 Project Properties 또는 우클릭으로 Build Path -> Configuration Build Path를 클릭해서 아래와 같이 Java Build Path 항목으로 간다.

![java-build-path-projects](/assets/img/post-src/java-build-path-projects.jpg)

위 이미지와 같이 프로젝트 Projects 탭에서 class를 클릭하면 Add 버튼이 활성화되고 workspace 내에서 참조하고자 하는 프로젝트를 추가하면 컴파일시 다른 프로젝트를 참조할 수 있게 된다.

<br>

---
### 2. Deployment Assembly

![java-build-path-deployment-assembly](/assets/img/post-src/java-build-path-deployment-assembly.jpg)

해당 탭의 내용을 보면 `Define packaging structure for this project`라고 써있다. 해석하면 프로젝트의 패키지 구성을 정의한다는 것인데.. 위와 같이 다른 외부 프로젝트 또는 라이브러리(OpenCV)를 참조하여 사용한 경우 추가해주어야 컴파일은 정상적으로 되나 실행이 안되는 안타까운 일이 발생하지 않을 수 있다.

만약, 참조한 라이브러리용 프로젝트가 또 다른 외부 프로젝트 또는 라이브러리를 참조하고 있다면 꼭 기억해야한다. 설정을 안 해줄 경우 볼 수 있는 오류 내용은 ClassNotFoundException으로 아래와 같다.

![ClassNotFoundException](/assets/img/post-src/ClassNotFoundException.jpg)

디버깅을 해보면 컴파일은 되었으나 라이브러리 프로젝트에서 사용중인 코드를 넘어가지 못 하는 것을 볼 수 있다.

<br>

---
### 3. Order and Export (JAVA Build Path)

![java-build-path-orderandexport](/assets/img/post-src/java-build-path-orderandexport.jpg)

이 항목을 설정해주지 않으면 2번과 같은 `ClassNotFoundException`를 마주치게 된다.

탭에 대한 설명을 보면 `Exported entries are contributed to dependent to prjects` 대략 Exported entries가 종속 프로젝트에 제공된다 라고 해석할 수 있는데, 외부 라이브러리를 체크를 해주지 않으면 해당 라이브러리를 사용한 코드에서 오류가 발생한다.

<br>

---
### 4. OpenCV 빌드
Java OpenCV를 프로젝트에서 사용하는 포스팅은 다른 많은 곳에서 다루고 있기 때문에 이곳에서 기록하진 않는다.

먼저, OpenCV를 사용할때 가장 우선적으로 호출해야 하는 함수가 있다.
```java
System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
```
해당 구문을 분석해보면 Core.NATIVE_LIBRARY_NAME을 따라가면 아래와 같이 확인할 수 있다.

```java
public static final String NATIVE_LIBRARY_NAME = getNativeLibraryName();
private static String getNativeLibraryName() { return "opencv_java341"; }
```

Runtime시 동적라이브러리를 참조하기 위한 내용인데 단순히 `opencv_java341`만을 읽어온다. 이 이름이 의미하는 것을 확인해보면 아래와 같이 dll 파일명인 것을 알 수 있다.

![opencv-path-explorer](/assets/img/post-src/opencv-path-explorer.jpg)

이 파일을 참조하고 있는 경로는 OpenCV를 사용하기 위해 native location을 지정해주었다.

![opencv-path-native-location](/assets/img/post-src/opencv-path-native-location.png)

문제는 이 부분에서 발생한다! 만약 이 프로젝트가 OpenCV를 감싼 Wrapper 프로젝트인 경우 다른 프로젝트에서 참조하여 사용할때 해당 경로를 인식하지 못하는 문제가 발생한다. 그래서 발생하는 오류는 `UnsatisfiedLinkError` 이다.

![UnsatisfiedLinkError](/assets/img/post-src/UnsatisfiedLinkError.jpg)

내용을 보면 opencv_java341 library 경로를 찾지 못한 링크 오류이다. 이 부분을 해결하기 위해선 여러가지 방법이 있겠지만 간단한 방법이 있다.

해당 dll을 참조할 수 있도록 경로를 지정해주는 방법인데, 아래와 같이 run configutration을 지정해주는 방법이다. 아래 이미지와 같이 해당 줄을 추가해주면 된다.

![opencv-run-configuration](/assets/img/post-src/opencv-run-configuration.jpg)

`-Djava.library.path="C:\opencv\build\java\x64"` 경로를 참조할 수 있도록 지정해주면 오류를 해결할 수 있다.

OpenCV 또는 외부 라이브러리를 사용한 프로젝트를 다른 외부 프로젝트에서 참조하여 사용할 경우 위의 모든 항목을 적용해줘야 정상적으로 사용할 수 있다.
