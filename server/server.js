const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = 3001;

// Ensure 'videos' directory exists
const videosDir = path.resolve(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/convert', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'No URL provided' });
    }

    const videoId = new URL(url).searchParams.get('v');
    const outputPath = path.resolve(videosDir, `${videoId}.mp4`);
    const tempPath = path.resolve(videosDir, `${videoId}.temp.mp4`);

    // Download video using yt-dlp
    exec(`yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${tempPath}" "${url}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error downloading video:', error);
            return res.status(500).json({ message: 'Error downloading video', error: error.message });
        }

        console.log('Download complete:', stdout);

        // Convert to MP4 if needed (yt-dlp already handles conversion)
        // Uncomment if further conversion is needed
        
        ffmpeg(tempPath)
            .output(outputPath)
            .on('end', () => {
                fs.unlinkSync(tempPath); // Clean up temp file
                res.json({ downloadUrl: `/videos/${videoId}.mp4` });
            })
            .on('error', (err) => {
                console.error('Error converting video:', err);
                res.status(500).json({ message: 'Error converting video', error: err.message });
            })
            .run();
        
        
        // If yt-dlp already produces an MP4 file, move or rename as needed
        fs.rename(tempPath, outputPath, (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                return res.status(500).json({ message: 'Error renaming file', error: err.message });
            }
            res.json({ downloadUrl: `/videos/${videoId}.mp4` });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
