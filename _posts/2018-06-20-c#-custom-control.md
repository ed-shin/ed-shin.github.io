---
layout: post
title: "C#에서 Custom Control 만들기 (1)-CustomProgressbar"
date: 2018-06-20 19:30:00 +0000
description: C#으로 Custom Progressbar를 만드는 예제
categories: C#
tags: C#
img: dotnet.jpg
---

C#으로 사용자 화면을 구현할 때 마음에 드는 UI 라이브러리가 없다면 기본 컨트롤만으로 아쉬운 부분들이 있다. 물론, Git에 올라가있는 다른 개발자들이 만들어둔 CustomControl을 사용할 수도 있지만 간단한 요구사항은 직접 구현해서 사용하는 것도 충분히 장점을 가진다. 

이번에 다룰 내용은 C#에서 Custom Control(Custom Progressbar)을 사용자가 직접 만들어 쓸 수 있도록 Visual Studio에서 제공해주는 기능을 활용해볼 포스팅이다.

---

### Custom Progressbar

C# 기본 컨트롤 중에 progressbar는 생각보다 손이 안 가는 컨트롤 UI 중에 하나이다. 사용자 화면을 만들기 위해 꼭 필요한 컨트롤임에도 불구하고 친해지기 어렵다. 그래서 먼저 progressbar 부터 변경해보자.
먼저, 프로젝트를 생성한 다음 아래와 같이 사용자 정의 컨트롤을 하나 추가한다.

![visual-studio-create-usercontrol](/assets/img/post-src/visual-studio-create-usercontrol.png)

그리고 다음과 같이 필요한 속성들을 정의하자.
- useGradation: 그라데이션을 사용하기 위해 속성을 지원한다.
- color: 컨트롤 내부에 채워지는 색상을 정의한다.
- value: 컨트롤의 진행률에 해당하는 값을 정의한다.
- maxValue: 컨트롤의 진행률 최대 값을 정의한다. 

매 속성에 invalidate를 넣어둔 것은 해당 컨트롤의 속성값이 변경할 때마다 컨트롤에 변경사항이 즉시 반영되도록 하기 위함이다. 그 밖에 잘못된 속성이 입력될 경우를 위해 예외처리를 지정하자.

```csharp
public partial class CustomProgressbar : UserControl {
    // draw attribute
    private bool useGradation = false;
    private Color color = Color.Black;

    // value attribute
    private float maxValue = 10;
    private float value = 10;

    public bool UseGradation
    {
        get { return useGradation; }
        set
        {
            this.useGradation = value;
            this.Invalidate();
        }
    }

    public Color DrawColor
    {
        get { return color; }
        set
        {
            this.color = value;
            this.Invalidate();
        }
    }

    public float Value
    {
        get { return value; }
        set
        {
            if (value < 0)
                this.value = 0;

            // value 값이 maxValue 보다 큰 경우 오류
            if (this.maxValue < value)
                throw new InvalidExpressionException();

            this.value = value;

            this.Invalidate();
        }
    }

    public float MaxValue
    {
        get { return maxValue; }
        set
        {
            // 입력된 maxValue의 값이 0보다 작거나, 현재 value 값보다 작은 maxValue값이 입력된다면 오류
            if (value < 0 || this.value > value)
                throw new InvalidExpressionException();

            this.maxValue = value;

            this.Invalidate();
        }
    }
}
```

그리고 위에서 정의한 속성들을 사용하여 progressbar를 표현하기 위해 사용자 정의 컨트롤에 onPaint() 함수를 override 하자!

```csharp
protected override void OnPaint(PaintEventArgs e)
{
    base.OnPaint(e);

    Graphics g = e.Graphics;
    draw(g);
}


private void draw(Graphics g)
{
    int width = (int)((this.value / this.maxValue) * this.Width);
    
    LinearGradientBrush lgb = new LinearGradientBrush(new Rectangle(0, 0, this.Width, this.Height), color, color, LinearGradientMode.Horizontal);
    if (useGradation)
    {
        Color sColor = Color.FromArgb(128, color);
        Color eColor = color;

        ColorBlend cb = new ColorBlend();
        cb.Colors = new Color[] { sColor, eColor };
        cb.Positions = new float[] { 0.0F, 1.0F };
        lgb.InterpolationColors = cb;
    }
    g.FillRectangle(lgb, new Rectangle(0, 0, width, this.Height));
    lgb.Dispose();
}
```

위의 코드를 통해 사용자정의 컨트롤은 하나의 CustomProgressbar처럼 동작하게 되었다. 
코드를 하나씩 살펴보면, onPaint() 함수는 사용자 정의 컨트롤을 그려주는 함수이고 progressbar처럼 만들기 위해 재정의한 것이다. onPaint() 함수에 Graphics 객체를 가져다가 원하는 모양을 위해 draw() 함수를 타도록 만들었다. 

아래는 progressbar 처럼 색상을 표현하기 위해 value와 maxValue의 비율을 구해 사용자 정의 컨트롤의 전체 길이 대비 색칠해야 하는 영역을 계산했다.
```csharp
int width = (int)((this.value / this.maxValue) * this.Width);
```

사용자 정의 컨트롤 전체(this.Width, this.Height)를 채울 brush 객체를 생성해준다. 해당 예제는 가로 모드의 progressbar만을 지원(Horizontal)하는 예제이며 그라데이션을 표현하기 위해 LinearGradientBrush를 호출했다.
```csharp
LinearGradientBrush lgb = new LinearGradientBrush(new Rectangle(0, 0, this.Width, this.Height), color, color, LinearGradientMode.Horizontal);
```
그리고 if문으로 분기하여 그라데이션을 사용하지 않는 경우는 brush 객체에 정의한 색상만으로 전체를 채워서 그리고 그렇지 않은 경우, 아래 코드처럼 그라데이션으로 그린다.
```csharp
Color sColor = Color.FromArgb(128, color);  // 시작 색상
Color eColor = color;                       // 마지막 색상

ColorBlend cb = new ColorBlend();
cb.Colors = new Color[] { sColor, eColor }; // 시작 색상과 마지막 색상을 블렌드 속성에 넣는다
cb.Positions = new float[] { 0.0F, 1.0F };  // 시작 색상을 표현할 위치와 마지막 색상을 표현할 위치를 비율로 정의한다.
lgb.InterpolationColors = cb;
```

위와 같이 코드를 모두 작성하고 빌드를 꼭 해주자! 빌드를 하고 나면 도구 상자 구성요소에 직접 만든 컨트롤을 UI에서 불러서 사용할 수 있게 된다.

![visual-studio-open-toolbox](/assets/img/post-src/visual-studio-open-toolbox.png)

또한, 정의한 속성도 UI에서 직접 속성을 변경하여 적용할 수 있다. 모두 적용해서 화면에서 보면 아래처럼 완성된다.

![visual-studio-custom-control-attribute](/assets/img/post-src/visual-studio-custom-control-attribute.png)
![visual-studio-custom-control-design](/assets/img/post-src/visual-studio-custom-control-design.png)

---

github:
[https://github.com/ed-shin/Simple-Utilities/tree/master/CSharp/Utility/UI](https://github.com/ed-shin/Simple-Utilities/tree/master/CSharp/Utility/UI)


