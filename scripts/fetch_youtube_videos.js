import fs from 'fs';
import path from 'path';
import { YOUTUBE_API_KEY, UPLOADS_PLAYLIST_ID } from '../admin/youtube_config.js';
import { extractProblemIds } from './utils/video_matcher.js';

const PROBLEMS_FILE = path.join(process.cwd(), 'src/data/problems.json');
const MAX_RESULTS = 50; // Max allowed by API per page

async function fetchAllPlaylistVideos(playlistId) {
    let videos = [];
    let nextPageToken = '';
    let pageCount = 0;

    console.log(`📡 Connecting to YouTube Data API...`);

    do {
        pageCount++;
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            // Extract relevant video data
            const items = data.items.map(item => ({
                id: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
            }));

            videos = videos.concat(items);
            nextPageToken = data.nextPageToken || '';

            console.log(`   Page ${pageCount}: Fetched ${items.length} videos. (Total: ${videos.length})`);

        } catch (error) {
            console.error("❌ Fetch Error:", error.message);
            break;
        }

    } while (nextPageToken);

    return videos;
}

async function main() {
    try {
        // 1. Fetch All Videos
        const videos = await fetchAllPlaylistVideos(UPLOADS_PLAYLIST_ID);
        console.log(`✅ Total Videos Scanned: ${videos.length}`);

        if (videos.length === 0) {
            console.warn("⚠️ No videos found. Check API Key or Playlist ID.");
            return;
        }

        // 2. Load Problems
        const problemsRaw = fs.readFileSync(PROBLEMS_FILE, 'utf-8');
        const problems = JSON.parse(problemsRaw);

        // 3. Match Videos to Problems
        let matchCount = 0;

        // Reset existing video URLs to avoid stale data
        problems.forEach(p => {
            delete p.videoUrl;
            delete p.videoThumbnail;
        });

        videos.forEach(video => {
            const { title, id, thumbnail } = video;
            const url = `https://www.youtube.com/watch?v=${id}`;

            const matchedIds = extractProblemIds(title);

            // Apply video to ALL matched problems
            matchedIds.forEach(problemId => {
                const problem = problems.find(p => p.id === problemId);
                if (problem) {
                    problem.videoUrl = url;
                    problem.videoThumbnail = thumbnail;
                    matchCount++;
                }
            });
        });

        console.log(`🎉 matched ${matchCount} videos out of ${videos.length} to LeetCode problems.`);

        // 4. Save
        fs.writeFileSync(PROBLEMS_FILE, JSON.stringify(problems, null, 2), 'utf-8');
        console.log(`💾 Updated ${PROBLEMS_FILE}`);

    } catch (e) {
        console.error("❌ Critical Error:", e);
        process.exit(1);
    }
}

main();
