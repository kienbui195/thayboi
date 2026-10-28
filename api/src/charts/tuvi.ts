import { astro } from "iztro";
import { birthInstant, type BirthInput } from "./birth-time.js";

export type TuViStar = { name: string; brightness: string; mutagen: string };

export type TuViPalace = {
  name: string;
  stem: string;
  branch: string;
  isBody: boolean;
  majorStars: TuViStar[];
  minorStars: TuViStar[];
  adjectiveStars: TuViStar[];
  decadal: [number, number];
  changsheng: string;
};

export type TuViChart = {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  hourName: string;
  hourRange: string;
  zodiac: string;
  soulStar: string;
  bodyStar: string;
  fiveElementsClass: string;
  palaces: TuViPalace[];
};

/** Giờ → chỉ số giờ của iztro: 0 = Tý sớm (00–01h), 1 = Sửu (01–03h) … 11 = Hợi, 12 = Tý muộn (23–24h). */
export function hourIndex(hour: number): number {
  return hour === 23 ? 12 : Math.floor((hour + 1) / 2);
}

type IztroStar = { name: string; brightness?: string; mutagen?: string };
const star = (s: IztroStar): TuViStar => ({ name: s.name, brightness: s.brightness ?? "", mutagen: s.mutagen ?? "" });

/**
 * Lá số tử vi theo iztro. Giờ sinh được quy về giờ Việt Nam (UTC+7) trước khi an sao,
 * vì âm lịch và 12 canh giờ của tử vi Việt tính theo UTC+7 — kể cả khi đồng hồ nơi sinh lúc đó chạy UTC+8.
 * Không rõ giờ sinh thì không lập (BR14): gọi hàm này chỉ khi có giờ.
 */
export function computeTuVi(input: BirthInput & { gender: "male" | "female" }): TuViChart {
  if (input.birthTime === null) throw new Error("Tử vi cần giờ sinh");
  const vn = birthInstant(input).setZone("UTC+7");
  const a = astro.bySolar(`${vn.year}-${vn.month}-${vn.day}`, hourIndex(vn.hour), input.gender, true, "vi-VN");
  return {
    solarDate: vn.toISODate()!,
    lunarDate: a.lunarDate,
    chineseDate: a.chineseDate,
    hourName: a.time,
    hourRange: a.timeRange,
    zodiac: a.zodiac,
    soulStar: a.soul,
    bodyStar: a.body,
    fiveElementsClass: a.fiveElementsClass,
    palaces: a.palaces.map((p) => ({
      name: p.name,
      stem: p.heavenlyStem,
      branch: p.earthlyBranch,
      isBody: p.isBodyPalace,
      majorStars: p.majorStars.map(star),
      minorStars: p.minorStars.map(star),
      adjectiveStars: p.adjectiveStars.map(star),
      decadal: p.decadal.range,
      changsheng: p.changsheng12,
    })),
  };
}
