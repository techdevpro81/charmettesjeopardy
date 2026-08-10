import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const introUrl = 'https://archive.org/download/tvtunes_29830/Jeopardy%20-%202008-2015.mp3';
const outroUrl = 'https://archive.org/download/tvtunes_29827/Jeopardy%20-%201997-2001.mp3';

const soundsDir = path.join(__dirname, 'public', 'sounds');

async function downloadFile(url, destName) {
  const destPath = path.join(soundsDir, destName);
  console.log(`Downloading ${url} -> ${destPath}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`Successfully downloaded ${destName}!`);
  } catch (error) {
    console.error(`Error downloading ${destName}:`, error);
  }
}

async function main() {
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }
  
  await downloadFile(introUrl, 'intro.mp3');
  await downloadFile(outroUrl, 'outro.mp3');
}

main();
