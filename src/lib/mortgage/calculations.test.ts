import { describe, expect, it } from "vitest";
import {
  calculateAnnuityPayment,
  calculatePresentValueFromMonthlyPayment,
} from "@/lib/mortgage";

describe("mortgage calculations", () => {
  it("returns 0 when the principal or monthly payment is 0", () => {
    expect(
      calculateAnnuityPayment({ principal: 0, annualRate: 4.1, years: 30 }),
    ).toBe(0);
    expect(
      calculatePresentValueFromMonthlyPayment({
        monthlyPayment: 0,
        annualRate: 4.1,
        years: 30,
      }),
    ).toBe(0);
  });

  it("uses straight-line division when interest is 0", () => {
    expect(
      calculateAnnuityPayment({ principal: 120000, annualRate: 0, years: 10 }),
    ).toBe(1000);
    expect(
      calculatePresentValueFromMonthlyPayment({
        monthlyPayment: 1000,
        annualRate: 0,
        years: 10,
      }),
    ).toBe(120000);
  });

  it("returns 0 when the term is 0", () => {
    expect(
      calculateAnnuityPayment({ principal: 120000, annualRate: 4.1, years: 0 }),
    ).toBe(0);
    expect(
      calculatePresentValueFromMonthlyPayment({
        monthlyPayment: 1000,
        annualRate: 4.1,
        years: 0,
      }),
    ).toBe(0);
  });

  it("sanitizes negative and non-finite input defensively", () => {
    expect(
      calculateAnnuityPayment({ principal: -120000, annualRate: 4.1, years: 30 }),
    ).toBe(0);
    expect(
      calculatePresentValueFromMonthlyPayment({
        monthlyPayment: Number.NaN,
        annualRate: 4.1,
        years: 30,
      }),
    ).toBe(0);
  });

  it("calculates normal annuity and present-value examples", () => {
    expect(
      calculateAnnuityPayment({ principal: 300000, annualRate: 4.1, years: 30 }),
    ).toBe(1449.6);
    expect(
      calculatePresentValueFromMonthlyPayment({
        monthlyPayment: 1200,
        annualRate: 4.1,
        years: 30,
      }),
    ).toBe(248345.21);
  });

  it("matches the mortgage-impact student-debt example values", () => {
    expect(
      calculateAnnuityPayment({ principal: 28000, annualRate: 2.33, years: 30 }),
    ).toBe(108.17);
    expect(
      calculatePresentValueFromMonthlyPayment({
        monthlyPayment: 200,
        annualRate: 4.1,
        years: 30,
      }),
    ).toBe(41390.87);
  });
});
