---
layout: post
title: "C#으로 Excel 정보 PPT로 만들기"
date: 2018-04-27 19:30:00 +0000
description: C#을 사용해서 엑셀에 있는 정보들을 파워포인트 서식에 맞춰 데이터를 넣는 프로그램
categories: [C#, project]
tags: [C#, project]
img: dotnet.jpg
---

C#은 윈도우에 특화되어 쉽게 응용 프로그램을 만들 수 있는 장점을 가진 언어이다. 예를 들어 엑셀과 파워포인트를 제어할 수 있도록 많은 기능들을 쉽게 개발할 수 있도록 지원한다.

이번 포스팅에서는 지인의 요청으로 개발했던 엑셀 데이터를 파워포인트 특정 레이아웃으로 옮기는 프로그램에 대해 다루려고 한다.

<br>

___

### 1. C#에서 Excel 활용

#### - Excel library 참조

Visual Studio에서 엑셀을 사용하기 위해서 아래와 같이 참조를 추가해야 한다.

![visual-studio-excel-reference](/assets/img/post-src/visual-studio-excel-reference.jpg)

그리고 아래와 같이 namespace를 추가한다.

```csharp
using Microsoft.Office.Core;
using Excel = Microsoft.Office.Interop.Excel;
using System.Runtime.InteropServices;
```

<br>  

#### - Excel 열고 닫기

```csharp
private Excel.Application app = null;
private Excel.Workbook wb = null;
private Excel.Worksheet ws = null;

public void Open(string excelPath, int sheetNumber)
{
  try
  {
    app = new Excel.Application();
    // 엑셀파일을 열기
    wb = app.Workbooks.Open(path);
    // 작업할 엑셀시트를 가져오기
    ws = wb.Worksheets.get_Item(sheetNumber) as Excel.Worksheet;
  }
  catch
  {
    // 오류 핸들링
  }
}

public void Close()
{
  try
  {
    // 엑셀파일 닫기
    wb.Close(false);
    // 엑셀 라이브러리 객체 닫기
    app.Quit();
  }
  catch
  {
    // 오류 핸들링
  }
  finally
  {
      ReleaseExcelObject(ws);
      ReleaseExcelObject(wb);
      ReleaseExcelObject(app);
  }
}
```

<br>

```csharp
public void ReleaseExcelObject(object obj)
{
    try
    {
        if (obj != null)
        {
            Marshal.ReleaseComObject(obj);
            obj = null;
        }
    }
    catch (Exception ex)
    {
        obj = null;
    }
    finally
    {
        GC.Collect();
    }
}
```

<br>

#### - 텍스트 데이터 가져오기

아래는 엑셀파일에 접근해서 데이터를 가져올 수 있는 코드이다.
```csharp
public object[,] ReadExcel(Excel.Worksheet ws, int sheetNumber)
{
  return ws.UsedRange.Value;    // Worksheet에서 사용된 셀 값 전체를 반환합니다.
}
```

<br>

#### - 이미지 데이터 가져오기

아래 코드는 이해할 수 없는 방식으로 이미지를 가져와야 하는 부분이지만 바로 접근하는 부분에 대해서는 아직 찾지 못하였다.

전체 shape을 돌며 특정 구간에 있는 shape을 가져오는 방식이다.

```csharp
public Image GetImage(Excel.Worksheet ws, int row, int col)
{
  // 이미지가 존재하는 특정 row, col의 cell
  Excel.Range cell = ws.Cells[row, col];

  foreach (Excel.Shape shape in cell.Worksheet.Shapes)
  {
    if (shape.Type == MsoShapeType.msoPicture)
    {
        double err = 0.5;
        double left = (double)shape.Left - err;
        double top = (double)shape.Top - err;
        double right = (double)shape.Width + shapeLeft + err;
        double bottom = (double)shape.Height + shapeTop + err;

        if (left >= cell.Left && top >= cell.Top && right <= cell.Left + cell.Width && bottom <= cell.Top + cell.Height)
        {
            // 클립보드에 저장하기 위해 해상도 보존을 위해 스케일을 늘린다.
            shape.ScaleWidth(5.0f, MsoTriState.msoTrue);
            // 클립보드에 이미지를 복사한다.
            shape.CopyPicture(Excel.XlPictureAppearance.xlScreen, Excel.XlCopyPictureFormat.xlBitmap);
            Image img = Clipboard.GetImage();
            Clipboard.Clear();

            return img;
        }
     }
  }

  return null;
}
```

<br>

___

### 2. C#에서 PowerPoint 활용

#### - PowerPoint library 참조

Visual Studio에서 파워포인트를 사용하기 위해서 아래와 같이 참조를 추가해야 한다.

![visual-studio-ppt-reference](/assets/img/post-src/visual-studio-ppt-reference.jpg)

그리고 아래와 같이 namespace를 추가한다.

```csharp
using Microsoft.Office.Core;
using Ppt = Microsoft.Office.Interop.PowerPoint;
```

<br>

#### - PowerPoint 열고 닫기

```csharp
private Ppt.Application app;  // PowerPoint lib 객체
private Ppt.Presentation pt;  // 파워포인트 객체
private Ppt.Slides slides;    // 슬라이드 객체

public Instance()
{
  app = new Ppt.Application();
}

// 새로운 파워포인트 생성
public void New()
{
  // 파워포인트 생성
  pt = app.Presentations.Add(MsoTriState.msoFalse);
  // 파워포인트 슬라이드 사이즈 적용
  pt.PageSetup.SlideSize = Ppt.PpSlideSizeType.ppSlideSizeA4Paper;
  // 슬라이드 객체 가져오기
  slides = pt.Slides;
}

// 파워포인트 저장
public void Save(string path)
{
  pt.SaveAs(path, Ppt.PpSaveAsFileType.ppSaveAsDefault, MsoTriState.msoTrue);
}

// 파워포인트 열기
public void Open(string path)
{
  // 저장된 파워포인트 열기
  pt = app.Presentations.Open(path, MsoTriState.msoTrue, MsoTriState.msoTrue, MsoTriState.msoFalse);
  // 슬라이드 객체 가져오기
  slides = pt.Slides;
}

public void Close()
{
  if(pt != null)
    pt.Close();

  if(app != null)
    app.Quit();
}

```

<br>

#### - 슬라이드 레이아웃 복사 / 붙여넣기

```csharp
public Ppt.Slide CopySlide(int slideNumber)
{
  Ppt.Slide slide = slides[slideNumber];
  // 슬라이드를 클립보드에 복사
  slide.Copy();

  return slide;
}

public void PasteSlide(Ppt.Slide srcSlide, Ppt.Slides targetSlides, int slideIdx)
{
  // 특정 인덱스에 클립보드에 저장된 슬라이드를 붙여넣고 동일한 디자인을 적용
  targetSlides.Paste(slideIdx).Design = srcSlide.Design;
}
```

<br>

#### - 슬라이드 내 테이블에 데이터 삽입

테이블 인덱스 삽입
```csharp
// slideIdx: slide 위치
// tableShapeIdx: slide 내 shape들 중에 table shape의 위치
public void SetIndexOnTable(int slideIdx, int tableShapeIdx)
{
    // Table Shape 객체
    Ppt.Shape shape = slides[slideIdx].Shapes[tableShapeIdx];

    for (int iRow = 1; iRow <= shape.Table.Rows.Count; iRow++)
    {
        for (int iColumn = 1; iColumn <= shape.Table.Columns.Count; iColumn++)
        {
            shape.Table.Cell(iRow, iColumn).Shape.TextFrame.TextRange.Text = Convert.ToString(iRow) + "/" + Convert.ToString(iColumn);
            shape.Table.Cell(iRow, iColumn).Shape.TextFrame.TextRange.Font.Name = "Verdana";
            shape.Table.Cell(iRow, iColumn).Shape.TextFrame.TextRange.Font.Size = 8;
        }
    }
}        
```

텍스트 삽입
```csharp
// slideIdx: slide 위치
// tableShapeIdx: slide 내 shape들 중에 table shape의 위치
// row, col: table shape의 cell 위치
// text: 삽입할 텍스트
public void SetTextOnTable(int slideIdx, int tableShapeIdx, int row, int col, string text)
{
    Ppt.Shape shape = slides[slideIdx].Shapes[tableShapeIdx];

    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.Text = text;
    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.Font.Name = "Verdana";
    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.Font.Size = 8;
}             
```

이미지 삽입
```csharp
// slideIdx: slide 위치
// tableShapeIdx: slide 내 shape들 중에 table shape의 위치
// row, col: table shape의 cell 위치
// img: 삽입할 이미지
public void SetImageOnTable(int slideIdx, int tableShapeIdx, int row, int col, Image img)
{
    Ppt.Shapes shapes = slides[slideIdx].Shapes;
    Ppt.Shape shape = shapes[tableShapeIdx];

    string tempImgPath = @""; // 임시 이미지 저장 경로
    img.Save(tempImgPath, ImageFormat.Jpeg);

    // 이미지를 넣을 Cell 영역에 margin 값
    int margin = 5;
    Ppt.Shape tableShape = shape.Table.Cell(row, col).Shape;
    // 임시 저장된 이미지 파일을 Cell에 삽입
    shapes.AddPicture(tempImgPath, MsoTriState.msoFalse, MsoTriState.msoTrue, tableShape.Left+margin, tableShape.Top+ margin, tableShape.Width- (margin*2), tableShape.Height- (margin*2));

    // 임시 생성한 이미지 파일 삭제
    if (File.Exists(tempImgPath))
        File.Delete(tempImgPath);
}
```

하이퍼링크 삽입
```csharp
// slideIdx: slide 위치
// tableShapeIdx: slide 내 shape들 중에 table shape의 위치
// row, col: table shape의 cell 위치
// text: 삽입할 텍스트
// address: 하이퍼 링크 경로
public void SetHyperLinkOnTable(int slideIdx, int tableShapeIdx, int row, int col, string text, string address)
{
    Ppt.Shape shape = slides[slideIdx].Shapes[tableShapeIdx];

    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.Text = text;
    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.Font.Name = "Verdana";
    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.Font.Size = 8;
    shape.Table.Cell(row, col).Shape.TextFrame.TextRange.ActionSettings[Ppt.PpMouseActivation.ppMouseClick].Hyperlink.Address = address;
}        
```
