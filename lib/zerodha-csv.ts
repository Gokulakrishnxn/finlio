// Reads a Zerodha holdings export (Kite "Holdings → Download" or Console).
// Only symbol, quantity and average cost are used.

export type CsvHolding = { symbol: string; quantity: number; avgCost: number };

function splitRow(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else cell += ch;
  }
  cells.push(cell);
  return cells.map((c) => c.trim());
}

const toNumber = (s: string) => Number(s.replace(/[₹,\s]/g, ""));

export function parseZerodhaCsv(text: string): { rows: CsvHolding[]; error?: string } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  // Console exports start with a few title lines; find the real header.
  const headerAt = lines.findIndex((l) => /instrument|symbol/i.test(l) && /qty|quantity/i.test(l));
  if (headerAt === -1) {
    return { rows: [], error: "This doesn't look like a Zerodha holdings file (no Instrument/Symbol and Qty columns)." };
  }
  const header = splitRow(lines[headerAt]).map((h) => h.toLowerCase());
  const col = (re: RegExp) => header.findIndex((h) => re.test(h));
  const symbolCol = col(/^(instrument|symbol|tradingsymbol)$/);
  const qtyCol = col(/quantity available/) >= 0 ? col(/quantity available/) : col(/^qty|quantity/);
  const avgCol = col(/avg|average/);
  if (symbolCol < 0 || qtyCol < 0 || avgCol < 0) {
    return { rows: [], error: "Couldn't find the symbol, quantity and average cost columns." };
  }

  const rows: CsvHolding[] = [];
  for (const line of lines.slice(headerAt + 1)) {
    const cells = splitRow(line);
    const symbol = cells[symbolCol]?.replace(/-(BE|EQ|BZ|SM)$/i, "").toUpperCase();
    const quantity = toNumber(cells[qtyCol] ?? "");
    const avgCost = toNumber(cells[avgCol] ?? "");
    if (symbol && quantity > 0 && avgCost > 0) rows.push({ symbol, quantity, avgCost });
  }
  return rows.length ? { rows } : { rows, error: "No holdings with a quantity and average cost were found." };
}
