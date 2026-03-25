import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names and resolves tailwind conflicts", () => {
      expect(cn("px-2", "text-sm", "px-4")).toBe("text-sm px-4");
    });

    it("ignores falsey values", () => {
      expect(cn("base", undefined, null, false && "hidden")).toBe("base");
    });
  });
});
