/**
 * Google Apps Script for NIFTY 50 Google Sheet Visualizer
 * 
 * FEATURES:
 * - Automatically computes Gap % and Gap Type for any row where it is missing or blank in the Google Sheet.
 * - Formats dates cleanly into dd-MMM-yy.
 * - Serves JSON data directly to the React Dashboard.
 * - Optional utility 'autoFillSheetGaps()' to write calculated Gap % & Gap Type directly back onto your Google Sheet.
 *
 * INSTRUCTIONS:
 * 1. Open your Google Sheet named "Data" containing your NIFTY 50 trading data.
 * 2. Click Extensions -> Apps Script.
 * 3. Replace the content in Code.gs with this entire file.
 * 4. Click 'Deploy' -> 'New deployment'.
 * 5. Select type 'Web app'.
 * 6. Set 'Execute as': 'Me'.
 * 7. Set 'Who has access': 'Anyone'.
 * 8. Click 'Deploy', authorize permissions, and copy the Web App Deployment URL.
 * 9. Paste the Web App URL into the NIFTY 50 React Web App to fetch live data directly!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    
    if (!data || data.length <= 1) {
      return responseJSON({
        status: "success",
        count: 0,
        data: [],
        message: "Sheet is empty or contains only headers."
      });
    }
    
    var rawRows = [];
    var startIndex = 1;
    
    // Detect header row vs data row
    var firstRowStr = String(data[0][0] || "") + String(data[0][1] || "");
    if (!firstRowStr.toLowerCase().includes("date") && !firstRowStr.toLowerCase().includes("index") && !firstRowStr.toLowerCase().includes("nifty")) {
      startIndex = 0; // No header row
    }
    
    for (var i = startIndex; i < data.length; i++) {
      var row = data[i];
      if (!row || row.length < 5) continue;
      
      var indexName = "NIFTY 50";
      var dateVal = "";
      var open = 0, high = 0, low = 0, close = 0;
      var gapPercent = null;
      var gapType = "N/A";
      var openCloseReturn = 0;
      var dayRange = 0;
      
      // Check column layout
      if (String(row[0]).toUpperCase().indexOf("NIFTY") !== -1) {
        // Col 0: Index Name, Col 1: Date, Col 2: Open, Col 3: High, Col 4: Low, Col 5: Close
        indexName = String(row[0]);
        dateVal = parseSheetDate(row[1]);
        open = Number(row[2]) || 0;
        high = Number(row[3]) || 0;
        low = Number(row[4]) || 0;
        close = Number(row[5]) || 0;
        gapPercent = (row[6] !== "" && row[6] !== null && !isNaN(row[6])) ? Number(row[6]) : null;
        gapType = String(row[7] || "").trim();
        if (gapType === "" || gapType === "undefined") gapType = "N/A";
        openCloseReturn = (row[8] !== "" && row[8] !== null && !isNaN(row[8])) ? Number(row[8]) : 0;
        dayRange = (row[9] !== "" && row[9] !== null && !isNaN(row[9])) ? Number(row[9]) : 0;
      } else {
        // Col 0: Date, Col 1: Open, Col 2: High, Col 3: Low, Col 4: Close
        dateVal = parseSheetDate(row[0]);
        open = Number(row[1]) || 0;
        high = Number(row[2]) || 0;
        low = Number(row[3]) || 0;
        close = Number(row[4]) || 0;
        gapPercent = (row[5] !== "" && row[5] !== null && !isNaN(row[5])) ? Number(row[5]) : null;
        gapType = String(row[6] || "").trim();
        if (gapType === "" || gapType === "undefined") gapType = "N/A";
        openCloseReturn = (row[7] !== "" && row[7] !== null && !isNaN(row[7])) ? Number(row[7]) : 0;
        dayRange = (row[8] !== "" && row[8] !== null && !isNaN(row[8])) ? Number(row[8]) : 0;
      }
      
      if (dateVal && open > 0 && close > 0) {
        rawRows.push({
          indexName: indexName,
          date: dateVal,
          open: open,
          high: high,
          low: low,
          close: close,
          gapPercent: gapPercent,
          gapType: gapType,
          openCloseReturn: openCloseReturn,
          dayRange: dayRange
        });
      }
    }
    
    // Sort chronologically to accurately calculate Gap % and Gap Type
    rawRows.sort(function(a, b) {
      var dateA = new Date(a.date).getTime() || 0;
      var dateB = new Date(b.date).getTime() || 0;
      return dateA - dateB;
    });

    // Auto-calculate missing Gap %, Gap Type, Open-Close, and Day Range
    for (var k = 0; k < rawRows.length; k++) {
      var r = rawRows[k];

      if (r.dayRange === 0 && r.high >= r.low) {
        r.dayRange = Math.round((r.high - r.low) * 100) / 100;
      }

      if (r.openCloseReturn === 0 && r.open > 0) {
        r.openCloseReturn = Math.round(((r.close - r.open) / r.open) * 10000) / 100;
      }

      // Calculate Gap % automatically from previous day's close if missing
      if (r.gapPercent === null && k > 0) {
        var prevClose = rawRows[k - 1].close;
        if (prevClose > 0) {
          r.gapPercent = Math.round(((r.open - prevClose) / prevClose) * 10000) / 100;
        }
      }

      // Calculate Gap Type automatically if missing
      if (r.gapType === "N/A" || !r.gapType) {
        if (r.gapPercent !== null && !isNaN(r.gapPercent)) {
          if (r.gapPercent > 0.05) {
            r.gapType = "GapUp";
          } else if (r.gapPercent < -0.05) {
            r.gapType = "GapDown";
          } else {
            r.gapType = "Flat";
          }
        } else {
          r.gapType = "Flat";
        }
      }
    }
    
    return responseJSON({
      status: "success",
      count: rawRows.length,
      data: rawRows
    });
    
  } catch (err) {
    return responseJSON({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * OPTIONAL UTILITY: Run this function directly inside Apps Script
 * to automatically compute and write Gap % & Gap Type into empty Google Sheet columns!
 */
function autoFillSheetGaps() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var isExtended = String(data[0][0]).toUpperCase().indexOf("NIFTY") !== -1;
  var gapColIdx = isExtended ? 6 : 5; // 0-indexed (Col G or Col F)
  var typeColIdx = isExtended ? 7 : 6; // 0-indexed (Col H or Col G)
  var closeColIdx = isExtended ? 5 : 4;
  var openColIdx = isExtended ? 2 : 1;

  for (var i = 2; i < data.length; i++) {
    var prevClose = Number(data[i - 1][closeColIdx]) || 0;
    var currentOpen = Number(data[i][openColIdx]) || 0;
    
    if (prevClose > 0 && currentOpen > 0) {
      var existingGap = data[i][gapColIdx];
      var calcGap = ((currentOpen - prevClose) / prevClose) * 100;
      
      if (existingGap === "" || existingGap === null || isNaN(existingGap)) {
        sheet.getRange(i + 1, gapColIdx + 1).setValue(Math.round(calcGap * 100) / 100);
      }
      
      var existingType = String(data[i][typeColIdx] || "").trim();
      if (!existingType || existingType === "N/A") {
        var gType = "Flat";
        if (calcGap > 0.05) gType = "GapUp";
        else if (calcGap < -0.05) gType = "GapDown";
        sheet.getRange(i + 1, typeColIdx + 1).setValue(gType);
      }
    }
  }
}

function parseSheetDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT", "dd-MMM-yy");
  }
  return String(val).trim();
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
