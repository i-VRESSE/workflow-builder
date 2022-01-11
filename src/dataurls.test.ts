import { expect, describe, it } from "vitest";
import { externalizeDataUrls, internalizeDataUrls } from "./dataurls";

describe("externalizeDataUrls()", () => {
  it("should replace dataurl like strings with filename", () => {
    const body = btoa("Hello, world");
    const input = {
      a: "data:text/plain;name=hello.txt;base64," + body,
      b: ["data:text/plain;name=hello2.txt;base64," + body],
      c: {
        d: "data:text/plain;name=hello3.txt;base64," + body,
      },
      e: [
        {
          f: "data:text/plain;name=hello4.txt;base64," + body,
        },
      ],
    };
    const files: Record<string, string> = {};
    const result = externalizeDataUrls(input, files);
    const expected = {
      a: "hello.txt",
      b: ["hello2.txt"],
      c: {
        d: "hello3.txt",
      },
      e: [
        {
          f: "hello4.txt",
        },
      ],
    };
    expect(result).toEqual(expected);
    const expectedFiles = {
      "hello.txt": "data:text/plain;name=hello.txt;base64," + body,
      "hello2.txt": "data:text/plain;name=hello2.txt;base64," + body,
      "hello3.txt": "data:text/plain;name=hello3.txt;base64," + body,
      "hello4.txt": "data:text/plain;name=hello4.txt;base64," + body,
    };
    expect(files).toEqual(expectedFiles);
  });
});

describe("internalizeDataUrls()", () => {
  it("should replace filenames with dataurls", () => {
    const body = btoa("Hello, world");
    const input = {
      a: "hello.txt",
      b: ["hello2.txt"],
      c: {
        d: "hello3.txt",
      },
      e: [
        {
          f: "hello4.txt",
        },
      ],
    };
    const files = {
      "hello.txt": "data:text/plain;name=hello.txt;base64," + body,
      "hello2.txt": "data:text/plain;name=hello2.txt;base64," + body,
      "hello3.txt": "data:text/plain;name=hello3.txt;base64," + body,
      "hello4.txt": "data:text/plain;name=hello4.txt;base64," + body,
    };
    const result = internalizeDataUrls(input, files);
    const expected = {
      a: "data:text/plain;name=hello.txt;base64," + body,
      b: ["data:text/plain;name=hello2.txt;base64," + body],
      c: {
        d: "data:text/plain;name=hello3.txt;base64," + body,
      },
      e: [
        {
          f: "data:text/plain;name=hello4.txt;base64," + body,
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});
