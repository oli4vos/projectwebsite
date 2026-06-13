import { describe, expect, it } from "vitest";
import {
  knowledgeDocumentGroupEntries,
  knowledgeSourceEntries,
  knowledgeSourceHierarchy,
  knowledgeSources,
} from "./knowledge-sources";

describe("knowledge sources", () => {
  it("keeps all source entries complete", () => {
    for (const [, source] of knowledgeSourceEntries) {
      expect(source.title).toBeTruthy();
      expect(source.publisher).toBeTruthy();
      expect(source.date).toBeTruthy();
      expect(source.description).toBeTruthy();
      expect(source.url).toMatch(/^https?:\/\//);
    }
  });

  it("keeps document groups aligned to known sources", () => {
    for (const [, sourceIds] of knowledgeDocumentGroupEntries) {
      for (const sourceId of sourceIds) {
        expect(knowledgeSources[sourceId]).toBeDefined();
      }
    }
  });

  it("keeps hierarchy aligned to known sources", () => {
    for (const level of knowledgeSourceHierarchy) {
      for (const sourceId of level.sourceIds) {
        expect(knowledgeSources[sourceId]).toBeDefined();
      }
    }
  });
});
