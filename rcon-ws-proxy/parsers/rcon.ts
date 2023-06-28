const playerlistpos_re = {
  keyRow_re: /^SteamID\s+DisplayName\s+POS\s+ROT$/,
  dataRow_re:
    /^(\d{17})\s+(.+)\((-?\d+\.-?\d+,\s+-?\d+\.-?\d+,\s+-?\d+\.-?\d+)\)\s+\((-?\d+\.-?\d+,\s+-?\d+\.-?\d+,\s+-?\d+\.-?\d+)\)$/,
} satisfies Record<string, RegExp>;

/** Parsed output of RCON command `playerlistpos`. */
interface Iplayerlistpos {
  SteamID: string;
  DisplayName: string;
  POS: [number, number, number];
  ROT: [number, number, number];
}

/**
 * @example
 * `SteamID           DisplayName POS                     ROT
 * 76561199122118055 edgey       (324.6, 39.9, 456.1)    (-0.5, -0.4, -0.8)
 * 76561198135242017 jka         (1533.4, 0.1, 1435.5)   (-0.6, -0.2, 0.8)  `
 * // is parsed into
 * [
 *   { SteamID: "76561199122118055", DisplayName: "edgey", POS: [324.6, 39.9, 456.1], ROT: [-0.5, -0.4, -0.8] },
 *   { SteamID: "76561198135242017", DisplayName: "jka", POS: [1533.4, 0.1, 1435.5], ROT: [-0.6, -0.2, 0.8] },
 * ]
 */
export const playerlistpos = (str: string): Array<Iplayerlistpos> => {
  const rows: string[] = str
    .split("\n")
    .map((n) => n.trim())
    .filter((n) => n);
  if (rows.length < 2) return []; // case no data (the 1st row is the keys)

  const [keyRow, ...dataRows] = rows;
  if (!keyRow.match(playerlistpos_re.keyRow_re)) {
    throw new Error(
      `Key row '${keyRow}' doesn't match the expected pattern '${playerlistpos_re.keyRow_re}'. Whole data:\n` + str
    );
  }

  const parsed: Array<Iplayerlistpos> = [];
  for (const row of dataRows) {
    const mg = row.match(playerlistpos_re.dataRow_re);
    if (!mg) {
      throw new Error(
        `Data row '${row}' doesn't match the expected pattern '${playerlistpos_re.dataRow_re}'. Whole data:\n` + str
      );
    }
    let [, ...groups] = mg;
    groups = groups.map((n) => n.trim());
    let [SteamID, DisplayName, __POS, __ROT] = groups;
    const _POS: string[] = __POS.split(",").map((n) => n.trim());
    const _ROT: string[] = __ROT.split(",").map((n) => n.trim());
    const POS = _POS.map(Number.parseFloat) as any;
    const ROT = _ROT.map(Number.parseFloat) as any;
    parsed.push({ SteamID, DisplayName, POS, ROT });
  }
  return parsed;
};
