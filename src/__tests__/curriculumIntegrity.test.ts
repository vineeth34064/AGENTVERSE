import { describe, expect, it } from 'vitest';
import { CONCEPT_BRIEFS, CURRICULUM_STAGES, FLAGSHIP_LESSONS } from '../data/curriculum';
import { ENGINEERING_PROJECTS } from '../data/projects';
import { DEPENDENCY_EDGES, DEPENDENCY_NODES, RESEARCH_LIBRARY } from '../data/reference';

describe('University Curriculum & Navigation Integrity', () => {
  const allLessonIds = new Set(
    CURRICULUM_STAGES.flatMap((stage) => stage.lessons.map((l) => l.id))
  );

  it('covers all 14 stages (00 through 13) with zero orphan lessons', () => {
    expect(CURRICULUM_STAGES).toHaveLength(14);
    for (const id of allLessonIds) {
      const hasContent = Boolean(FLAGSHIP_LESSONS[id] || CONCEPT_BRIEFS[id]);
      expect(hasContent, `Missing lesson or brief for ${id}`).toBe(true);
    }
  });

  it('verifies all 5 flagship labs have 9 steps, Python code, math equations, challenges, and quizzes', () => {
    const flagships = Object.values(FLAGSHIP_LESSONS);
    expect(flagships).toHaveLength(5);
    for (const lesson of flagships) {
      expect(lesson.steps).toHaveLength(9);
      expect(lesson.pythonFromScratch.code.length).toBeGreaterThan(100);
      expect(lesson.mathFoundation.equations.length).toBeGreaterThanOrEqual(3);
      expect(lesson.challenge).toBeDefined();
      expect(lesson.quiz).toHaveLength(3);
    }
  });

  it('verifies all dependency graph links, research papers, and 21 projects point to valid lessons', () => {
    expect(ENGINEERING_PROJECTS).toHaveLength(21);
    const nodeIds = new Set(DEPENDENCY_NODES.map((n) => n.id));
    for (const node of DEPENDENCY_NODES) {
      expect(allLessonIds.has(node.lessonId), `Invalid node lessonId ${node.lessonId}`).toBe(true);
    }
    for (const edge of DEPENDENCY_EDGES) {
      expect(nodeIds.has(edge.from)).toBe(true);
      expect(nodeIds.has(edge.to)).toBe(true);
    }
    for (const paper of RESEARCH_LIBRARY) {
      expect(allLessonIds.has(paper.relatedLessonId)).toBe(true);
    }
    for (const proj of ENGINEERING_PROJECTS) {
      if (proj.relatedLessonId) {
        expect(allLessonIds.has(proj.relatedLessonId)).toBe(true);
      }
    }
  });
});
