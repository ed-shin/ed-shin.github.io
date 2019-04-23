---
layout: post
title: "ZeroFormatter"
date: 2019-04-01 19:30:00 +0000
description: ZeroFormatter 사용기
categories: devlog
tags: C#
---

C# 자체에는 직렬화를 지원해주는 도구인 MemoryStream을 이용하여 쉽게 Serialize / Deserialize를 할 수 있는 기능이 존재한다.
그러나 업무에서 서버 개발 당시 대용량 데이터 처리를 하기엔 속도에 대한 이슈가 존재하였고, 다른 API가 필요하게 되어 알아보게된 다른 오픈소스 대한 기록이다.  

<br>

## Binary Formatter

C#에는 간단하게 Serialize/Deserialize를 지원해주는 BinaryFormatter라는 클래스가 있다. C#의 강력한 기능인 Reflection을 사용하여 stream 객체를 쉽게 Custom 클래스로 캐스팅이 가능하다. 심지어 object[] 형태의 Serialize/Deserialize 또한 가능하다. 이 기능은 사용 또한 간편해서 아래와 같이 작성하는 것만으로도 손쉽게 Serialize가 가능하다.

> Reference: [MSDN BinaryFormatter Class](https://docs.microsoft.com/ko-kr/dotnet/api/system.runtime.serialization.formatters.binary.binaryformatter?view=netframework-4.8)

```csharp
FileStream fs = new FileStream("DataFile.dat", FileMode.Create);

// Construct a BinaryFormatter and use it to serialize the data to the stream.
BinaryFormatter formatter = new BinaryFormatter();
try
{
    formatter.Serialize(fs, addresses);
}
catch (SerializationException e)
{
    Console.WriteLine("Failed to serialize. Reason: " + e.Message);
    throw;
}
finally
{
    fs.Close();
}
```

<br>

일반적으로 기존의 Serialize/Deserialize는 Custom Class의 member 변수들에 대한 map 정보가 필요하다. 직렬화된 byte array index에 접근하여 Deserialize를 할 수 있도록 말이다. map은 클래스가 많아지거나 복잡해질 수록 노가다가 선행되고 클래스의 구조가 바뀌게 되는 경우 같이 수정되어야하는 번거로움이 있는데 C#의 BinaryFormatter는 그러한 번거로움을 모두 해결해준다. 이를 가능하게 하는 것은 아래와 같이 BinaryFormatter Serialize 함수 내에서 object의 member에 대한 정보를 만들어서 내보내기 때문이다.

> Reference: [MSDN BinaryObjectWithMap Class](https://referencesource.microsoft.com/#mscorlib/system/runtime/serialization/formatters/binary/binarycommonclasses.cs,bba9daa226f6a4eb)

```csharp
internal sealed class BinaryObjectWithMap : IStreamable
{
    internal BinaryHeaderEnum binaryHeaderEnum;
    internal Int32 objectId;
    internal String name;
    internal Int32 numMembers;
    internal String[] memberNames;
    internal Int32 assemId;   

    ...
}
```

하지만 위와 같은 장점이 있는 것과 반대로 속도가 느릴 수 밖에 없는 단점이 존재한다. Deserialize에 대한 속도가 일반적으로 index map을 만들어 접근하는 속도에 비해 현저히 느려지게 된다. 약 4기가에 데이터를 전송하는데 25분 정도의 시간이 소요되었다. 그래서 아래와 같은 오픈소스를 사용기에 대한 포스팅을 남긴다.

<br>

## FlatBuffers & ZeroFormatter

#### FlatBuffers
> [https://github.com/evolutional/flatbuffers-net](https://github.com/evolutional/flatbuffers-net)

먼저, FlatBuffers를 테스트하였다. 속도에 관하여 가장 빠르다는 장점을 갖고 있었고 다양한 플랫폼을 지원해주기 때문에 C#에서도 사용이 가능하다는 부분에서 가장 먼저 테스트하게 되었다.

장점으로는, 속도적인 측면에서는 굉장히 빠르다는 장점이 있었다. 기본적으로 map을 구성하여 Deserialize를 하기 때문에 바로 index에 접근하여 데이터를 읽어오는 방식이어서 속도적인 측면에서는 월등하였다. (실제로는 Deserialize에 대한 속도가 없는 것과 같다)
단점으로는, Serialize를 지원해야 하는 클래스 개수가 많은 상황에서 일일이 map을 구성하고 변경된 상황에서 유지보수를 해주는데 손이 많이 간다. 기존 코드에 Serialize/Deserialize를 지원해야하는 클래스가 많고 member가 많은 상황이었기 때문에 테스트 해보는 것만으로도 손이 많이 가는 단점이 있었다. 일일이 클래스마다 virtual로 Serialize / Deserialize 함수를 각각 구성해야하는 상황이 발생한다.

<br>

#### ZeroFormatter
>[https://github.com/neuecc/ZeroFormatter](https://github.com/neuecc/ZeroFormatter)

다음은, ZeroFormatter를 테스트하였다. .NET 플랫폼만을 지원하는 오픈소스였지만 .NET을 지원하는 만큼 강력한 기능인 Reflection을 이용하여 수월하게 Deserialize를 할 수 있도록 도와준다.

장점으로는, FlatBuffers의 비견할만큼 빠른 속도를 지원한다. 최초 Reflection에 소요되는 비용이 있지만 최초에만 비용이 소모되고 이후에는 비용이 발생하지 않는다. Reflection을 지원하기 때문에 index map을 구성하는 노가다성 개발 비용이 발생하지 않는다. 물론 몇가지 규칙을 맞춰주기는 해야하지만 굉장히 개발비용을 줄일 수 있었다. (규칙을 지키기 위한 자동 완성 기능까지 제공한다.)
단점으로는, member를 공유하는 상속 계층이 깊은 클래스를 사용하는 경우 구조적으로 풀어야하는 부분이 필요하다. 그리고 아쉽게도 object[] 에 대한 Deserialize는 지원되지 않는디.

ZeroFormatter는 git에서 아래와 같이 친절하게 자신의 오픈소스에 대한 성능을 설명해준다.

![ZeroFormatter Performance](/assets/img/post-src/zeroformatter-perform.png)

> Deserialize speed is Infinitely fast(but of course, it is unfair, ZeroFormatter's deserialize is delayed when access target field). Serialize speed is fair-comparison. ZeroFormatter is fastest(compare to protobuf-net, 2~3x fast) for sure.

하지만 위와 같은 성능이 ZeroFormatter의 온전한 성능은 아니라고 위처럼 명시하였지만 테스트 결과 FlatBuffers에 밀리지 않을 만큼 개발 비용 대비 속도에 대해서는 충분히 만족스러운 결과였다.

ZeroFormatter의 장점인 member를 공유하는 부분의 Deserialize까지 제공하였기 때문에 기존 코드의 상속 관계를 조금만 수정함으로써 member를 공유하는 형태로 개발이 가능하였다.하지만 기존 코드의 인터페이스 상속 구조로 상속 깊이를 한 단계 늘렸더니 자동완성이 지원되지 않는 단점이 있었다. ZeroFormatter를 위한 Code Analysis 클래스가 지원 범위 밖의 영역으로 보여졌다. 만약 처음 구조를 잡을 때 ZeroFormatter를 사용한다면 잘 구조를 구성하면 추후 유지보수시 자동완성 기능을 사용하여 좀 더 수월할 수 있을 것이다.

<br>

### 결과

끝으로, 구성은 BinaryFormatter와 ZeroFormatter를 섞은 형태가 되었다. 이렇게 구성하게 된 이유는 추후 발생할 수 있는 유지보수를 좀 더 유연하게 지원하기 위함이다. BinaryFormatter는 object[] 까지 지원하기 때문에 두 가지 기능을 모두 가져가는 것이 도움이 되었다. 예를 들어, DB에 밀어넣을 데이터인 대용량 데이터의 body는 ZeroFormatter를 이용하여 Serialize/Deserialize를 하여 byte[] 형태로 만들고 그 위를 packet의 header와 body로 감싸서 개발시 변동이 많고 Serialize 양이 적은 프로토콜의 조건 변수에 대한 부분은 BinaryFormatter를 이용하여 직렬화하였다. 이유는 ZeroFormatter를 이용하여 byte[] 형태로 Serialize한 데이터는 BinaryFormatter 입장에서는 하나의 멤버 변수이기 때문에 속도에 영향을 끼치지 않았다. 그리고 BinaryFormatter의 장점을 가져갈 수 있기 때문에 구성을 이렇게 가져갔다.

결과적으로, 25분의 소요시간이 발생하던 데이터 전송시간을 약 5분으로 줄일 수 있었다.
