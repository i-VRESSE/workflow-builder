import { expect, describe, it } from "vitest";
import { walk } from "./searchreplace";

describe("walk()", () => {
  it('should replace "foo" with "bar"', () => {
    const input = "foo";
    const result = walk(
      input,
      (v) => v === "foo",
      (v) => "bar"
    );
    const expected = "bar";
    expect(result).toEqual(expected);
  });

  it('should replace {a:"foo"} with {a:"bar"}', () => {
    const input = { a: "foo" };
    const result = walk(
      input,
      (v) => v === "foo",
      (v) => "bar"
    );
    const expected = { a: "bar" };
    expect(result).toEqual(expected);
  });

  it('should replace ["foo"] with ["bar"]', () => {
    const input = ["foo"];
    const result = walk(
      input,
      (v) => v === "foo",
      (v) => "bar"
    );
    const expected = ["bar"];
    expect(result).toEqual(expected);
  });

  it('should not replace "bla"', () => {
    const input = "bla";
    const result = walk(
      input,
      (v) => v === "foo",
      (v) => "bar"
    );
    const expected = "bla";
    expect(result).toEqual(expected);
  });

  it('should not replace ["bla"]', () => {
    const input = ["bla"];
    const result = walk(
      input,
      (v) => v === "foo",
      (v) => "bar"
    );
    const expected = ["bla"];
    expect(result).toEqual(expected);
  });

  it('should not replace {a:"bla"}', () => {
    const input = { a: "bla" };
    const result = walk(
      input,
      (v) => v === "foo",
      (v) => "bar"
    );
    const expected = { a: "bla" };
    expect(result).toEqual(expected);
  });
});
