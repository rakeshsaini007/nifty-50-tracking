/**
 * Google Apps Script for NIFTY 50 Google Sheet Visualizer & Auto-Sync
 * File: Code.gs / Code.js
 * 
 * FEATURES:
 * - updateNiftyData(): Auto-fetches latest daily candle for NIFTY 50 (%5ENSEI) from Yahoo Finance and updates your Google Sheet!
 * - doGet(e): Auto-triggers updateNiftyData() and serves live JSON data directly to the React Dashboard.
 * - Auto-calculates Gap %, Gap Type ("Gap Up" / "Gap Down" / "Flat"), Open-Close %, and Day Range for any missing values.
 * - Formats dates cleanly into dd-MMM-yy.
 * - autoFillSheetGaps(): Utility to write missing Gap calculations directly back onto your Google Sheet.
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
 * 9. Optional: Set a daily Time-Driven Trigger on updateNiftyData() for automatic end-of-day market updates!
 */

function doGet(e) {
  try {
    // Auto-update latest NIFTY 50 market candle from Yahoo Finance before serving data
    try {
      updateNiftyData();
    } catch (updateErr) {
      Logger.log("Auto-update warning: " + updateErr.toString());
    }

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

      // Calculate Open-Close Return % formula: (close - open) * 100 / open
      if (r.open > 0 && (r.openCloseReturn === 0 || Math.abs(r.openCloseReturn) > 30)) {
        r.openCloseReturn = Math.round((((r.close - r.open) * 100) / r.open) * 100) / 100;
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
            r.gapType = "Gap Up";
          } else if (r.gapPercent < -0.05) {
            r.gapType = "Gap Down";
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
 * AUTO-SYNC FUNCTION:
 * Fetches latest daily candle for NIFTY 50 (%5ENSEI) from Yahoo Finance
 * and inserts it into row 2 of the Google Sheet if today's date does not exist.
 */
function updateNiftyData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];

    var url = "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=5d";

    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      Logger.log("Yahoo Finance API HTTP response: " + res.getResponseCode());
      return;
    }

    var json = JSON.parse(res.getContentText());
    if (!json.chart || !json.chart.result || !json.chart.result[0]) {
      Logger.log("Invalid chart response structure from Yahoo Finance.");
      return;
    }

    var result = json.chart.result[0];
    var quote = result.indicators.quote[0];
    if (!quote || !quote.close) return;

    // Find last valid candle
    var last = quote.close.length - 1;
    while (
      last >= 0 &&
      (quote.open[last] == null ||
        quote.high[last] == null ||
        quote.low[last] == null ||
        quote.close[last] == null)
    ) {
      last--;
    }

    if (last < 0) {
      Logger.log("No valid market candle found.");
      return;
    }

    var date = new Date(result.timestamp[last] * 1000);

    var open = Number(quote.open[last]);
    var high = Number(quote.high[last]);
    var low = Number(quote.low[last]);
    var close = Number(quote.close[last]);

    // Previous valid close for Gap calculation
    var prev = last - 1;
    while (prev >= 0 && quote.close[prev] == null) {
      prev--;
    }

    var previousClose = prev >= 0 ? Number(quote.close[prev]) : close;

    var gapPercent = Number(
      (((open - previousClose) / previousClose) * 100).toFixed(2)
    );

    var gapType =
      gapPercent > 0.05 ? "Gap Up" :
      gapPercent < -0.05 ? "Gap Down" :
      "Flat";

    // Open-Close % calculation: (close - open) * 100 / open
    var openClosePercent = Number((((close - open) * 100) / open).toFixed(2));
    var dayRange = Number((high - low).toFixed(2));

    var today = Utilities.formatDate(date, Session.getScriptTimeZone() || "GMT", "dd-MMM-yy");

    // Prevent duplicate entries by checking sheet dates
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var rowDate = parseSheetDate(data[i][1] || data[i][0]);
      if (rowDate === today) {
        Logger.log("Today's NIFTY 50 data (" + today + ") already exists in sheet.");
        return;
      }
    }

    // Insert new row right after header (Row 2)
    sheet.insertRowAfter(1);

    sheet.getRange(2, 1, 1, 10).setValues([[
      "NIFTY 50",
      date,
      Number(open.toFixed(2)),
      Number(high.toFixed(2)),
      Number(low.toFixed(2)),
      Number(close.toFixed(2)),
      gapPercent,
      gapType,
      openClosePercent, // Open-Close % formula: (close - open) * 100 / open
      dayRange
    ]]);

    sheet.getRange(2, 2).setNumberFormat("dd-MMM-yy");
    sheet.getRange(2, 3, 1, 8).setNumberFormat("0.00");

    Logger.log("NIFTY 50 data updated successfully for " + today);
  } catch (err) {
    Logger.log("Error in updateNiftyData: " + err.toString());
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
  var openColIdx = isExtended ? 2 : 1;
  var closeColIdx = isExtended ? 5 : 4;
  var gapColIdx = isExtended ? 6 : 5; // 0-indexed
  var typeColIdx = isExtended ? 7 : 6;
  var openCloseColIdx = isExtended ? 8 : 7; // 0-indexed (Col I or Col H)

  for (var i = 1; i < data.length; i++) {
    var openVal = Number(data[i][openColIdx]) || 0;
    var closeVal = Number(data[i][closeColIdx]) || 0;
    
    // Auto-calculate Open-Close %: (close - open) * 100 / open
    if (openVal > 0 && closeVal > 0) {
      var calcOpenClosePct = Math.round((((closeVal - openVal) * 100) / openVal) * 100) / 100;
      var existingOpenClose = data[i][openCloseColIdx];
      
      // Fill if empty, or if value looks like raw points (e.g. > 30 or < -30) instead of %
      if (existingOpenClose === "" || existingOpenClose === null || isNaN(existingOpenClose) || Math.abs(Number(existingOpenClose)) > 30) {
        sheet.getRange(i + 1, openCloseColIdx + 1).setValue(calcOpenClosePct);
      }
    }

    if (i >= 2) {
      var prevClose = Number(data[i - 1][closeColIdx]) || 0;
      if (prevClose > 0 && openVal > 0) {
        var existingGap = data[i][gapColIdx];
        var calcGap = ((openVal - prevClose) / prevClose) * 100;
        
        if (existingGap === "" || existingGap === null || isNaN(existingGap)) {
          sheet.getRange(i + 1, gapColIdx + 1).setValue(Math.round(calcGap * 100) / 100);
        }
        
        var existingType = String(data[i][typeColIdx] || "").trim();
        if (!existingType || existingType === "N/A") {
          var gType = "Flat";
          if (calcGap > 0.05) gType = "Gap Up";
          else if (calcGap < -0.05) gType = "Gap Down";
          sheet.getRange(i + 1, typeColIdx + 1).setValue(gType);
        }
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
