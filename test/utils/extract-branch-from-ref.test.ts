import { expect, it } from "vitest";

import { extractBranchFromRef } from "../../src/utils/extract-branch-from-ref.js";
import { mockedInvalidRefs } from "./fixtures/mocked-invalid-refs.js";
import { mockedValidRefs } from "./fixtures/mocked-valid-refs.js";

it.each(mockedInvalidRefs)("should return `null`", ref => {
  expect(extractBranchFromRef(ref)).toBeNull();
});
it.each(mockedValidRefs)("should return $expected", ({ ref, expected }) => {
  expect(extractBranchFromRef(ref)).toBe(expected);
});
