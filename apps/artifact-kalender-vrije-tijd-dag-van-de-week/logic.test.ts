import { describe, expect, it } from "vitest";
import { parseIsoDateInput } from "@/lib/calendar";
import { calculateDagVanDeWeek } from "./logic";

describe("calculateDagVanDeWeek", () => {
  it("returns Friday for 2026-05-29", () => {
    const result = calculateDagVanDeWeek({
      date: parseIsoDateInput("2026-05-29")!,
    });

    expect(result.weekdagNaam).toBe("vrijdag");
    expect(result.weekdagNummerISO).toBe(5);
  });

  it("returns Saturday for 2000-01-01", () => {
    const result = calculateDagVanDeWeek({
      date: parseIsoDateInput("2000-01-01")!,
    });

    expect(result.weekdagNaam).toBe("zaterdag");
    expect(result.weekdagNummerISO).toBe(6);
  });
});
