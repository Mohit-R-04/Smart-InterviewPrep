import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleView from './ScheduleView';

// Mock canvas-confetti to avoid errors in JSDOM
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock scrollIntoView since it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockSchedule = [
    {
        weekNum: 1,
        time: 60,
        problems: [
            {
                id: '1',
                title: 'Two Sum',
                difficulty: 'Easy',
                duration: 15,
                url: 'https://leetcode.com/problems/two-sum',
                likes: 50000,
                company_count: 100,
                // Case 1: Video present
                videoUrl: 'https://www.youtube.com/watch?v=7jDS9KQEDbI',
                videoThumbnail: 'https://i.ytimg.com/vi/7jDS9KQEDbI/default.jpg'
            },
            {
                id: '2',
                title: 'Add Two Numbers',
                difficulty: 'Medium',
                duration: 20,
                url: 'https://leetcode.com/problems/add-two-numbers',
                likes: 20000,
                company_count: 50
                // Case 2: No video
            }
        ]
    }
];

describe('ScheduleView Component', () => {
    it('renders problem list correctly', () => {
        render(<ScheduleView schedule={mockSchedule} completed={new Set()} setCompleted={() => { }} />);

        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText('Add Two Numbers')).toBeInTheDocument();
        expect(screen.getByText('Week 1')).toBeInTheDocument();
    });

    it('renders video thumbnail when videoUrl is present', () => {
        render(<ScheduleView schedule={mockSchedule} completed={new Set()} setCompleted={() => { }} />);

        // Find the link with the correct href
        const videoLink = screen.getByTitle('Watch Solution: Two Sum');
        expect(videoLink).toBeInTheDocument();
        expect(videoLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=7jDS9KQEDbI');

        // Verify thumbnail image is inside
        const img = screen.getByAltText('Solution');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/7jDS9KQEDbI/default.jpg');
    });

    it('does NOT render video thumbnail when videoUrl is missing', () => {
        render(<ScheduleView schedule={mockSchedule} completed={new Set()} setCompleted={() => { }} />);

        // Add Two Numbers should NOT have a video link
        // We can query by title attribute for that specific problem
        const missingLink = screen.queryByTitle('Watch Solution: Add Two Numbers');
        expect(missingLink).toBeNull();
    });

    it('toggles completion status on click', () => {
        const setCompletedMock = vi.fn();
        render(<ScheduleView schedule={mockSchedule} completed={new Set()} setCompleted={setCompletedMock} />);

        const checkbox = screen.getAllByRole('checkbox')[0]; // Two Sum checkbox
        fireEvent.click(checkbox);

        expect(setCompletedMock).toHaveBeenCalled();
    });
});
