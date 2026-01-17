import { describe, it, expect } from 'vitest';
import { generateSchedule } from './scheduler';

// Mock Problem Data
const mockProblems = [
    { title: "Two Sum", difficulty: "Easy", companies: ["Google", "Amazon"], relatedTopics: [{ name: "Array" }], duration: 20, company_count: 50 },
    { title: "3Sum", difficulty: "Medium", companies: ["Facebook"], relatedTopics: [{ name: "Array" }], duration: 30, company_count: 30 },
    { title: "Hard Graph", difficulty: "Hard", companies: ["Google"], relatedTopics: [{ name: "Graph" }], duration: 45, company_count: 10 },
    { title: "Easy String", difficulty: "Easy", companies: ["Microsoft"], relatedTopics: [{ name: "String" }], duration: 15, company_count: 20 },
];

describe('Scheduler Logic', () => {

    it('should generate a schedule for 4 weeks', () => {
        const config = {
            weeks: 4,
            hoursPerWeek: 5,
            selectedDifficulties: ["Easy", "Medium", "Hard"],
            selectedCompanies: [],
            selectedTopics: [],
            experienceLevel: "Intermediate"
        };

        const schedule = generateSchedule(mockProblems, config);
        expect(schedule).toHaveLength(4);
    });

    it('should filter by company correctly', () => {
        const config = {
            weeks: 2,
            hoursPerWeek: 5,
            selectedDifficulties: ["Easy", "Medium", "Hard"],
            selectedCompanies: ["Google"], // Only Google
            selectedTopics: [],
            experienceLevel: "Intermediate"
        };

        const schedule = generateSchedule(mockProblems, config);
        const allScheduledProblems = schedule.flatMap(w => w.problems);

        // Should only have "Two Sum" and "Hard Graph"
        expect(allScheduledProblems.length).toBeGreaterThan(0);
        allScheduledProblems.forEach(p => {
            expect(p.companies).toContain("Google");
        });
    });

    it('should filter by difficulty', () => {
        const config = {
            weeks: 2,
            hoursPerWeek: 5,
            selectedDifficulties: ["Hard"], // Only Hard
            selectedCompanies: [],
            selectedTopics: [],
            experienceLevel: "Expert"
        };

        const schedule = generateSchedule(mockProblems, config);
        const allScheduledProblems = schedule.flatMap(w => w.problems);

        expect(allScheduledProblems.length).toBe(1);
        expect(allScheduledProblems[0].title).toBe("Hard Graph");
    });

    it('should respect topic constraints', () => {
        const config = {
            weeks: 1,
            hoursPerWeek: 5,
            selectedDifficulties: ["Easy", "Medium"],
            selectedCompanies: [],
            selectedTopics: ["String"], // Only String
            experienceLevel: "Beginner"
        };

        const schedule = generateSchedule(mockProblems, config);
        const allScheduledProblems = schedule.flatMap(w => w.problems);

        expect(allScheduledProblems.length).toBe(1);
        expect(allScheduledProblems[0].title).toBe("Easy String");
    });
});
