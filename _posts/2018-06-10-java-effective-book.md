---
layout: post
title: "[Book] Effective Java"
date: 2018-06-10 18:32:20 +0300
description: Effective Java 책을 읽고 난 후 몇가지 정리를 해둔다.
categories: devbook
tags: [JAVA, study]
img: java.jpg
---

Effective Java를 읽은 뒤 느낀점 또는 흥미로웠던 내용들을 정리한 포스트.

개발을 하면서 항상 느끼는 점은 코딩을 하는 것은 내가 짠 코드가 잘 돌아가는 것도 중요하지만 돌아가는것이 전부는 아니라고 생각한다. 내가 짠 코드가 돌아가야 하는 것은 당연한 것이다. 부가적으로 더 효율적이고 잘 구성된 코드들을 짜도록 고민하고 노력하는 것이 개발이라고 생각한다. 그래서 개발을 할 땐 생각난 것으로 바로 코드로 옮기기 전에 많이 생각을 해보고 코드로 구성하는 습관을 가지는 것이 중요하다고 생각한다. 그리고 이런 책들은 더 좋은 코드를 만드는 방법을 제공해주고 생각하는 시간을 단축시켜주는 장점을 가진다.

약 4년간 개발을 하는 동안, 2년 정도는 회사에서 자체적으로 개발한 C# 라이브러리를 다루고 관리했던 경험으로 인해 api 와 관련된 부분들에 대해 관심이 많다. 개발자가 보기 좋은 코드, 효율적인 코드들을 지향한다. 이 책을 읽으면서 공감이 갔던 내용들에 대해 적어두려고 한다.

> 아래에 쓰는 모든 글은 'Effective Java' 책에 내용을 기준으로 내 생각을 남긴 것이다.

---

### x. 재정의 가능한 메서드는 내부적으로 반드시 문서에 남겨야 한다.
당연한 말이지만 일반적인 내용보다 크리티컬한 부분이라고 생각한다. 오픈 소스가 아닌 경우에 개발자가 해당 메서드를 재정의하여 사용하는 경우 어떤 동작을 하는지 설명이 없으면 알 수가 없기 때문이다. 만약 해당 메서드를 재정의하여 사용하는 경우 개발자의 의도와는 다른 동작을 하게 되는 경우 어떤 영향을 미칠지 알 수가 없으니 정말 문서화가 중요한 부분이다. 하다 못해 주석이라도 남기자! (이 글은 나에게 하는 말이나 마찬가지이다.) 책에서는 다음과 같이 언급한다.
> '관습적으로, 재정의 가능 메서드를 어떤 식으로 호출하는지는 메서드 주석문 마지막에 명시한다. 주석은 "이 구현은" 이라는 문구로 시작한다.'

---

### x. 잘 설계된 모듈은 구현 세부사항을 전부 API 뒤쪽에 감춘다.
api를 구현할 땐 api 외부로 꺼낼 메서드를 잘 구성해야 한다. 만약 잘 못 꺼낸 api를 배포하게 된 경우 추후, 사용자가 그 메서드를 사용해야 하는 경우 버전에 따라 호환성을 지키지 못 하는 api가 생길 수 있기 때문이다. (예를 들어 한참 쓰고 있는 라이브러리의 메서드가 deprecated 됬다고 하면 스트레스 받는 개발자들 많을 것이다) 이와 같이 api를 개발하는 경우 설계를 잘 해서 외부에 보이지 않아도 되는 세부 사항은 모두 뒤로 감추면 추후 업데이트 할 때도 내부적으로만 메서드를 수정하면 되므로, api 업데이트 하는 입장에서도 배포 받는 입장에서도 서로 좋을 것이다. 설계는 정말 중요하다!

---

### x. toString() 메서드를 재정의하자!
내가 구현한 class의 toString()을 재정의 해놓으면, 추후 디버깅이나 객체의 속성을 찾을 때 용이할 것이다. toString()을 재정의할 땐 해당 객체가 가진 속성과 객체의 상태 등을 알 수 있도록 만들어 두는 것이 효과적이다.

---

### x. enum의 활용 (Java)
enum을 단순하게 상수의 나열로 사용하는 방법 이외에 새로운 방법을 알게되어 나중에 잊어버릴까봐 적어두려고 한다.

```java
public enum Operation {
    PLUS("+"){
        double apply(double x, double y) { return x + y; }
    },
    TIMES("*"){
        double apply(double x, double y) { return x * y; }
    };

    private final String symbol;
    Operation(String symbol) { this.symbol = symbol }
    abstract double apply(double x, double y);

    @override
    protected override String toString() {
        return this.symbol;
    }
}

public void example(double x, double y){
    for(Operation op : Operation.values()){
        System.out.print("%f %s %f = %f%n", x, op, y, op.apply(x, y));
    }
}

public enum Planet {
    //name(mass:질량, radius:반지름)
    MERCURY (3.302e+23, 2.439e6),
    EARTH (5.975e+24, 6.378e6);

    private final double mass;
    private final double radius;
    private final double surfaceGravity;
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        this.surfaceGravity = G * mass / (radius * radius);
    }

    @override
    protected override String toString() {
        return "mass : " + this.mass + " radius : " + this.radius + " surfaceGravity : " + this.surfaceGravity;
    }
}
```
