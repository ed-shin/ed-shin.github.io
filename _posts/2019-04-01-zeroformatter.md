---
layout: post
title: "ZeroFormatter"
date: 2019-04-01 19:30:00 +0000
description: ZeroFormatter 사용기
categories: devlog
tags: C#
---

C# 자체에는 직렬화를 지원해주는 도구인 MemoryStream을 이용하여 쉽게 Serialize / Deserialize를 할 수 있는 기능이 존재한다.
그러나 업무에서 서버 개발 당시 대용량 데이터 처리를 하기엔 속도에 대한 이슈가 존재하였고, 다른 API가 필요하게 되어 알아보게된 다른 Formatter에 대한 기록이다.  

### Binary Formatter

C#에는 간단하게 Serialize/Deserialize를 지원해주는 BinaryFormatter라는 클래스가 있다. C#의 강력한 기능인 Reflection을 사용하여 stream 객체를 쉽게 Custom 클래스로 캐스팅이 가능하다. 심지어 object[] 형태의 직렬화/역직렬화 또한 가능하다. 이 기능은 사용 또한 간편해서 아래와 같이 작성하는 것만으로도 손쉽게 직렬화가 가능하다.

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

일반적으로 기존의 직렬화/역지렬화는 Custom Class의 map 정보가 필요하다. byte array에 index에 접근하여 역직렬화를 할 수 있도록 말이다. map은 클래스가 많아지거나 복잡해질 수록 노가다가 선행되고 클래스의 구조가 바뀌게 되는 경우 같이 수정되어야하는 번거로움이 있는데 그러한 번거로움을 모두 해결해준다. 이를 가능하게 하는 것은 아래와 같이 BinaryFormatter의 Serialize 함수 내에서 object의 map을 만들어서 내보내기 때문이다.

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

하지만 위와 같은 장점이 있는 것과 반대로 속도가 느릴 수 밖에 없는 단점이 존재한다. Deserialize에 대한 속도가 일반적으로 index map을 만들어 접근하는 속도에 비해 현저히 느려지게 된다. 약 4기가에 데이터를 전송하는데 25분 정도의 시간이 소요되었다. 그래서 아래와 같은 오픈소르를 참조하게 되어 포스팅을 남긴다.


### FlatBuffers & ZeroFormatter

#### FlatBuffers
> [https://github.com/evolutional/flatbuffers-net](https://github.com/evolutional/flatbuffers-net)

먼저, FlatBuffers를 테스트하였다. 속도에 관하여 가장 빠르다는 장점을 갖고 있었고 다양한 플랫폼을 지원해주기 때문에 C#에서도 사용이 가능하다는 부분에서 가장 먼저 테스트하게 되었다.

장점으로는, 속도적인 측면에서는 굉장히 빠르다는 장점이 있었다. 기본적으로 map을 구성하여 역직렬화를 하기 때문에 바로 index에 접근하여 데이터를 읽어오는 방식이어서 속도적인 측면에서는 월등하였다.
단점으로는, Serialize를 지원해야 하는 클래스 개수가 많은 상황에서 일일이 map을 구성하고 변경된 상황에서 유지보수 해주는데 손이 많이 간다. 현재 기존 코드의 직렬화 해야하는 클래스가 많고 member가 많은 상황이었기 때문에 조금 테스트 해보는 것만으로도 손이 많이 가는 단점이 있었다. 일일이 클래스 별로 virtual로 Serialize / Deserialize 함수를 따로 구성해야하는 상황이 발생한다.

#### ZeroFormatter
>[https://github.com/neuecc/ZeroFormatter](https://github.com/neuecc/ZeroFormatter)

다음은, ZeroFormatter를 테스트하였다. .NET 플랫폼만을 지원하는 오픈소스였지만 .NET을 지원하는 만큼 강력한 기능인 Reflection을 이용하여 수월하게 Deserialize를 할 수 있도록 도와준다.

장점으로는, FlatBuffers의 비견할만큼 빠른 속도를 지원한다. 최초 Reflection에 소요되는 비용이 있지만 최초에만 비용이 소모되고 이후에는 비용이 발생하지 않는다. Reflection을 지원하기 때문에 index map을 구성하는 노가다성 개발 비용이 발생하지 않는다. 물론 몇가지 규칙을 맞춰주기는 해야하지만 굉장히 개발비용을 줄일 수 있었다.
단점으로는, 멤머를 공유하는 상속 계층이 깊은 클래스를 사용하는 경우 구조적으로 풀어야하는 부분이 필요하다. 그리고 아쉽게도 object[] 에 대한 Deserialize는 지원되지 않는디.


### 결과

ZeroFormatter와 BinaryFormatter 조합.. 이유는 다음에..
