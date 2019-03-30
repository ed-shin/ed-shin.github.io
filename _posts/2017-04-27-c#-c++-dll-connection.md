---
layout: post
title: "C#에서 C++ 동적 라이브러리 사용"
date: 2018-04-27 19:30:00 +0000
description: C#, C++동적라이브러리 마샬링 및 맵핑에 대한 포스팅
categories: devlog
tags: C#
img: dotnet.jpg
---

C#을 사용하다 보면 C++로 생성된 dll을 사용할 일이 종종 발생한다. 요즘엔 OpenCV와 같은 소스들도 JAVA, .Net 용으로 호환되도록 만든 인터페이스 라이브러가 존재하지만, 아직도 필요할 때가 많다. 그래서 이번 포스팅에서 다루려고 한다.

<br>

___

### 1. C++ 동적 라이브러리 생성

다음 사이트에서 자세하게 생성 방법에 대해서 설명함으로 아래 사이트를 참고한다.
>[https://msdn.microsoft.com/ko-kr/library/ms235636.aspx](https://msdn.microsoft.com/ko-kr/library/ms235636.aspx)

>[https://docs.microsoft.com/ko-kr/cpp/build/walkthrough-creating-and-using-a-dynamic-link-library-cpp](https://docs.microsoft.com/ko-kr/cpp/build/walkthrough-creating-and-using-a-dynamic-link-library-cpp)

>[https://msdn.microsoft.com/en-us/library/ac7ay120(v=vs.100).aspx](https://msdn.microsoft.com/en-us/library/ac7ay120(v=vs.100).aspx)

<br>

___

### 2. 함수 마샬링 및 데이터 맵핑

#### - 인터페이스 매핑
C++
```csharp
typedef void(*Callback)(ObjContainer* obj);
```

C#
```csharp
[UnmanagedFunctionPointer(CallingConvention.Cdecl)]
private delegate void Callback(IntPtr objects);

[DllImport("native.dll", CallingConvention = CallingConvention.Cdecl)]
[return: MarshalAs(UnmanagedType.I1)]
private static extern bool SetCallback(IntPtr entry, Callback callback);
```

<br>

#### - 객체 전달받기
C++
```csharp
void GetObject(NativeLib* instance, ObjContainer* obj)
```

C#
```csharp
[DllImport("native.dll", CallingConvention = CallingConvention.Cdecl)]
private static extern void GetObject(IntPtr entry, ref ObjContainer obj);
```

<br>

#### - 배열 객체 전달받기
C++
```csharp
void GetArray(NativeLib* instance, ObjContainer** objs, int* length){
  int size = 10;
  *objs = new ObjContainer[size];
  *length = size;
}
```

C#
```csharp
[DllImport("native.dll", CallingConvention = CallingConvention.Cdecl)]
private static extern void GetArray(IntPtr entry, out IntPtr objs, out int length);
```

```csharp
// 배열의 길이
int length;
// 배열 포인터
IntPtr pArr = IntPtr.Zero;
// 배열 가져오기
GetArray(entry, out pArr, out length);

// 데이터 사이즈
int entrySize = Marshal.SizeOf(typeof(ObjContainer));
ObjContainer[] objArr = new ObjContainer[length];
for (int i = 0; i < length; i++)
{
    ObjContainer obj = (ObjContainer)Marshal.PtrToStructure(pArr, typeof(Obj));
    objArr[i] = obj;
    // 데이터 타입 크기만큼 배열 위치를 변경한다.
    pArr = new IntPtr(pArr.ToInt32() + entrySize);
}
```

<br>

___

### 3. 데이터 맵핑
C++
```csharp
#pragma pack(1)
struct ObjContainer
{
public:
  bool b;
  short s;
  int i;
  long l;
  float f;
  double d;
  char charArr[10];
};
```

C#
```csharp
[StructLayout(LayoutKind.Sequential, Pack = 1)]
public struct ObjContainer
{
  [MarshalAs(UnmanagedType.I1)]
  public bool b;
  [MarshalAs(UnmanagedType.I2)]
  public short s;
  [MarshalAs(UnmanagedType.I4)]
  public int i;
  [MarshalAs(UnmanagedType.U4)]
  public uint l;
  [MarshalAs(UnmanagedType.R4)]
  public float f;
  [MarshalAs(UnmanagedType.R8)]
  public double d;
  [MarshalAs(UnmanagedType.ByValArray, SizeConst = 10)]
  public char[] charArr;
}
```

<br>

___

##### 추가적으로 visual studio에서 동적 라이브러리 파일을 연결하여 디버깅하고 싶다면 `프로젝트 속성->디버그 네이티브 코드 디버깅 사용항목`을 체크해야 한다.
