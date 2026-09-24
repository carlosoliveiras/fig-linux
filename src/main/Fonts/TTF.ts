const TABLE_HEAD_OFFSET = 12;
const TABLE_HEAD_SIZE = 16;
const TAG_OFFSET = 0;
const TAG_SIZE = 4;
const CHECKSUM_OFFSET = TAG_OFFSET + TAG_SIZE;
const CHECKSUM_SIZE = 4;
const CONTENTS_PTR_OFFSET = CHECKSUM_OFFSET + CHECKSUM_SIZE;
const CONTENTS_PTR_SIZE = 4;
const LENGTH_OFFSET = TABLE_HEAD_SIZE + CONTENTS_PTR_OFFSET;
const VERSION_OFFSET = 0;
const WEIGHT_CLASS_OFFSET = 4;
const WIDTH_CLASS_OFFSET = 6;
const FORMAT_OFFSET = 0;
const ITALIC_ANGLE_OFFSET = FORMAT_OFFSET + 4;
const UNDERLINE_POSITION_OFFSET = ITALIC_ANGLE_OFFSET + 8;
const UNDERLINE_THICKNESS_OFFSET = UNDERLINE_POSITION_OFFSET + 2;
const IS_FIXED_PITCH_OFFSET = UNDERLINE_THICKNESS_OFFSET + 2;

// usWidthClass steps, from 1 (Ultra-condensed, 50%) to 9 (Ultra-expanded, 200%).
const WIDTH_CLASS_PERCENT = [50, 62.5, 75, 87.5, 100, 112.5, 125, 150, 200];

const toWidthClass = (percent: number) => {
  let nearest = 0;
  WIDTH_CLASS_PERCENT.forEach((p, i) => {
    if (Math.abs(p - percent) < Math.abs(WIDTH_CLASS_PERCENT[nearest] - percent)) nearest = i;
  });

  return nearest + 1;
};

export default class TTF {
  private tableCount: number = 0;
  private tableMap = new Map<string, Fonts.TableName>();
  constructor(private buffer: Buffer, private offset: number = 0) {
    this.readHead();
    this.readTablesInfo();
  }

  private readTablesInfo() {
    for (let i = 0; i < this.tableCount; ++i) {
      const o = this.offset + TABLE_HEAD_OFFSET + i * TABLE_HEAD_SIZE;
      const tag = this.buffer.subarray(o, o + CONTENTS_PTR_SIZE).toString();

      this.tableMap.set(tag, {
        checksum: this.buffer.readUInt32BE(o + CHECKSUM_OFFSET),
        contents: this.buffer.readUInt32BE(o + CONTENTS_PTR_OFFSET),
        length: this.buffer.readUInt32BE(o + LENGTH_OFFSET),
      });
    }
  }

  private readHead() {
    const o = this.offset;
    const majorVersion = this.buffer.readUInt16BE(o);
    const minorVersion = this.buffer.readUInt16BE(o + 2);

    if (majorVersion != 1 || minorVersion != 0) {
      const tag =
        String.fromCharCode(this.buffer[o]) +
        String.fromCharCode(this.buffer[o + 1]) +
        String.fromCharCode(this.buffer[o + 2]) +
        String.fromCharCode(this.buffer[o + 3]);

      if (!["OTTO", "true", "ttcf"].includes(tag)) {
        throw new Error("Is not a TrueType font");
      }
    }

    this.tableCount = this.buffer.readUInt16BE(o + 4);
  }
  public getNameTable(): Fonts.NameTableResult {
    const tableNameInfo = this.tableMap.get("name");
    const ntOffset = tableNameInfo.contents;
    const tableVersion = this.buffer.readUInt16BE(ntOffset);
    const numberNameRecords = this.buffer.readUInt16BE(ntOffset + 2);
    const offsetStorage = this.buffer.readUInt16BE(ntOffset + 4);

    if (tableVersion != 0 && tableVersion != 1) {
      throw new Error('Invalid the "name" table');
    }
    const storage = offsetStorage + ntOffset;

    const info: any = {};
    for (let j = 0; j < numberNameRecords; j++) {
      const o = ntOffset + 6 + j * 12;

      const platformId = this.buffer.readUInt16BE(o);
      const nameId: string | number = this.buffer.readUInt16BE(o + 6);
      const stringLength = this.buffer.readUInt16BE(o + 8);
      const stringOffset = this.buffer.readUInt16BE(o + 10);

      const fieldNames = [
        "copyright",
        "fontFamily",
        "fontSubFamily",
        "fontIdentifier",
        "fontName",
        "fontVersion",
        "postscriptName",
        "trademark",
        "manufacturer",
        "designer",
        "description",
        "vendorURL",
        "designerURL",
        "license",
        "licenseURL",
        "reserved",
        "preferredFamily",
        "preferredSubFamily",
        "compatibleFullName",
        "sampleText",
        "postScriptCIDfindfontName",
        "WWSFamilyName",
        "WWSSubFamilyName",
      ];
      // IDs past the standard ones (e.g. fvar instance names) are kept by number.
      const name = fieldNames[nameId] ?? nameId;

      if (!info[name]) {
        info[name] = "";

        for (let k = 0; k < stringLength; k++) {
          const charCode = this.buffer[storage + stringOffset + k];
          if (charCode === 0) continue;
          info[name] += String.fromCharCode(charCode);
        }
      }
    }

    return info;
  }

  public getPostTable() {
    const o = this.tableMap.get("post").contents;

    return {
      format: this.fixed16dot16(this.buffer.readUInt32BE(o + FORMAT_OFFSET)),
      italicAngle: this.fixed16dot16(this.buffer.readUInt32BE(o + ITALIC_ANGLE_OFFSET)),
      underlinePosition: this.buffer.readInt16BE(o + UNDERLINE_POSITION_OFFSET),
      underlineThickness: this.buffer.readInt16BE(o + UNDERLINE_THICKNESS_OFFSET),
      isFixedPitch: this.buffer.readUInt32BE(o + IS_FIXED_PITCH_OFFSET),
      minMemType42: this.buffer.readUInt32BE(o + 7),
      maxMemType42: this.buffer.readUInt32BE(o + 9),
      minMemType1: this.buffer.readUInt32BE(o + 11),
      maxMemType1: this.buffer.readUInt32BE(o + 13),
    };
  }
  public getOS2Table() {
    const o = this.tableMap.get("OS/2")?.contents;

    return {
      version: o ? this.buffer.readUInt16BE(o + VERSION_OFFSET) : 0,
      weightClass: o ? this.buffer.readUInt16BE(o + WEIGHT_CLASS_OFFSET) : 0,
      widthClass: o ? this.buffer.readUInt16BE(o + WIDTH_CLASS_OFFSET) : 5,
    };
  }

  public getFvarTable(nameTable: Fonts.NameTableResult) {
    const o = this.tableMap.get("fvar")?.contents;

    if (o === undefined) {
      return { axes: [], instances: [] };
    }

    const axesOffset = o + this.buffer.readUInt16BE(o + 4);
    const axisCount = this.buffer.readUInt16BE(o + 8);
    const axisSize = this.buffer.readUInt16BE(o + 10);
    const instanceCount = this.buffer.readUInt16BE(o + 12);
    const instanceSize = this.buffer.readUInt16BE(o + 14);
    const fixed = (at: number) => this.buffer.readInt32BE(at) / 65536;

    const axes: Fonts.VariationAxis[] = [];
    for (let i = 0; i < axisCount; i++) {
      const a = axesOffset + i * axisSize;
      const tag = this.buffer.subarray(a, a + 4).toString();

      axes.push({
        tag,
        name: nameTable[this.buffer.readUInt16BE(a + 18)] ?? tag,
        min: fixed(a + 4),
        default: fixed(a + 8),
        value: fixed(a + 8),
        max: fixed(a + 12),
        hidden: (this.buffer.readUInt16BE(a + 16) & 1) === 1,
      });
    }

    const instancesOffset = axesOffset + axisCount * axisSize;
    // The PostScript name ID is optional and only present when the record has room for it.
    const hasPostscript = instanceSize >= axisCount * 4 + 6;
    const instances = [];
    for (let i = 0; i < instanceCount; i++) {
      const r = instancesOffset + i * instanceSize;
      const postscriptId = hasPostscript ? this.buffer.readUInt16BE(r + 4 + axisCount * 4) : 0xffff;

      instances.push({
        style: nameTable[this.buffer.readUInt16BE(r)],
        postscript: postscriptId === 0xffff ? undefined : nameTable[postscriptId],
        coordinates: axes.map((_, j) => fixed(r + 4 + j * 4)),
      });
    }

    return { axes, instances };
  }

  public getData(): Fonts.IFontsFigmaItem[] {
    const nameTable = this.getNameTable();
    const os2Table = this.getOS2Table();
    // IDs 1/2 cap a family at four styles, so e.g. "Inter SemiBold" shows up as
    // its own family. IDs 16/17 carry the real family and style when present.
    const family = nameTable.preferredFamily || nameTable.fontFamily;
    const style = nameTable.preferredSubFamily || nameTable.fontSubFamily || "Regular";
    const { axes, instances } = this.getFvarTable(nameTable);

    const base: Fonts.IFontsFigmaItem = {
      postscript: nameTable.postscriptName,
      family,
      id: family,
      style,
      weight: os2Table.weightClass,
      stretch: os2Table.widthClass,
      italic: /italic|oblique/i.test(style),
      ...(axes.length ? { variationAxes: axes } : {}),
    };

    if (!instances.length) {
      return [base];
    }

    // A variable font is listed once per named instance, the way Figma's own
    // font agent does it; Figma applies the axis values when rendering.
    return instances.map((instance) => {
      const item = { ...base, variationAxes: axes.map((axis) => ({ ...axis })) };

      item.style = instance.style ?? style;
      item.postscript =
        instance.postscript ?? `${family}-${item.style}`.replace(/[^\x21-\x7e]|[[\](){}<>/%]/g, "");
      let italic = base.italic;
      let oblique = false;
      item.variationAxes.forEach((axis, j) => {
        axis.value = instance.coordinates[j];

        if (axis.tag === "wght") item.weight = Math.round(axis.value);
        if (axis.tag === "wdth") item.stretch = toWidthClass(axis.value);
        if (axis.tag === "ital") italic = axis.value !== 0;
        if (axis.tag === "slnt") oblique = axis.value !== 0;
      });
      item.italic = italic || oblique;

      return item;
    });
  }

  private fixed16dot16(fixed: number) {
    if (fixed & 0x80000000) {
      fixed = -(~fixed + 1);
    }

    return fixed / 65536;
  }
}
