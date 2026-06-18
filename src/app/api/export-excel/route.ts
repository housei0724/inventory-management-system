import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";

/** API受信用の明細アイテム型 */
interface ExportItem {
  type?: 'item' | 'heading';
  name: string;       // 材料名
  spec: string;       // 仕様
  dimension: string;  // 寸法
  quantity: number;    // 数量
  unit: string;       // 単位
  unit_price: number;  // 単価
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let projectName: string = body.projectName || "";
    let addressee: string = body.addressee || "";
    let exportItems: ExportItem[] = (body.items || []).map((item: any) => ({
      type: item.type || 'item',
      name: item.name || "",
      spec: item.spec || "",
      dimension: item.dimension || "",
      quantity: item.quantity || 0,
      unit: item.unit || "",
      unit_price: item.unit_price || 0,
    }));

    // テンプレートExcelを読み込む
    const templatePath = path.join(process.cwd(), "template.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // シート1: 表紙への書き込み
    const ws1 = workbook.worksheets[0]; // インデックスで取得
    if (ws1) {
      if (addressee) {
        safeSetCellValue(ws1, "A5", addressee);
      }
      safeSetCellValue(ws1, "B17", projectName);
    }

    // シート2: 内訳への「3行1セット」書き込み
    const ws2 = workbook.getWorksheet("内訳");
    if (ws2) {
      const maxSets = Math.min(exportItems.length, 10);

      exportItems.slice(0, maxSets).forEach((item, index) => {
        const baseRow = 2 + (index * 3);

        safeSetCellValue(ws2, `A${baseRow}`, item.name);

        if (item.type !== 'heading') {
          const specAndDimension = [item.spec, item.dimension].filter(Boolean).join("  ");
          safeSetCellValue(ws2, `A${baseRow + 1}`, specAndDimension);

          safeSetCellValue(ws2, `E${baseRow + 2}`, item.quantity);
          safeSetCellValue(ws2, `F${baseRow + 2}`, item.unit);
          safeSetCellValue(ws2, `G${baseRow + 2}`, item.unit_price);
          safeSetCellValue(ws2, `H${baseRow + 2}`, item.quantity * item.unit_price);
        } else {
          // 見出し行の場合は品名以外は空欄にする（または上書きしない）
          safeSetCellValue(ws2, `A${baseRow + 1}`, "");
          safeSetCellValue(ws2, `E${baseRow + 2}`, "");
          safeSetCellValue(ws2, `F${baseRow + 2}`, "");
          safeSetCellValue(ws2, `G${baseRow + 2}`, "");
          safeSetCellValue(ws2, `H${baseRow + 2}`, "");
        }
      });
    }

    // バッファに書き出し
    const buffer = await workbook.xlsx.writeBuffer();

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const fileName = `見積書_${projectName || "無題"}_${dateStr}.xlsx`;
    const encodedFileName = encodeURIComponent(fileName);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch (error) {
    console.error("[Excel出力エラー]", error);
    return NextResponse.json(
      { error: "Excel出力中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

function safeSetCellValue(
  ws: ExcelJS.Worksheet,
  cellAddress: string,
  value: string | number
) {
  const cell = ws.getCell(cellAddress);

  if (cell.value && typeof cell.value === "object" && "formula" in cell.value) {
    return;
  }

  const existingStyle = { ...cell.style };
  cell.value = value;
  cell.style = existingStyle;
}
