#!/usr/bin/env node
/**
 * Builds the home-page hero reel from the raw clips in video-src/hero:
 *   public/videos/hero.mp4, hero.webm and hero-poster.jpg
 *
 * Each SCENE is trimmed, sped up, lightly colour-matched and dissolved into the next. The last
 * scene dissolves back into the first, then the head is trimmed off, so <video loop> has no visible seam.
 *
 *   node scripts/build-hero-video.mjs
 *
 * Needs ffmpeg (winget install Gyan.FFmpeg) on PATH, or set FFMPEG=C:\path\to\ffmpeg.exe.
 *
 * Adding footage (e.g. interiors): drop the clip in video-src/hero, add a SCENE below, run the script.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ordered like a buyer's visit: the suburb at golden hour, arriving at the home, inside, then out to the pool.
// `speed` / `length` override SPEED / LENGTH per scene. Clips not listed (720p bedroom/front-of-house, the older modern-house
// clip) are kept in video-src/hero but left out.
const SCENES = [
  { file: "hero-suburb-drone-sunset-1080p.mp4", start: 0, speed: 1.4, length: 6, label: "Suburb at sunset" }, // opener holds a beat longer
  { file: "hero-suburban-aerial-720p.mp4", start: 0, label: "Over the rooftops" },   // 720p, upscaled; pairs with the opener as one aerial approach
  { file: "hero-house-facade-dusk-1080p.mp4", start: 0.5, speed: 1.6, label: "Arrival at dusk" },
  { file: "hero-living-room-1080p.mp4", start: 0, label: "Living room" },
  { file: "hero-kitchen-island-1080p.mp4", start: 2, label: "Kitchen" },
  { file: "hero-villa-pool-720p.mp4", start: 2, label: "Garden" },                   // 720p, upscaled; daylight garden before the warm pool finale
  { file: "hero-backyard-pool-1080p.mp4", start: 0.1, speed: 1.8, length: 6, label: "Backyard pool" }, // warm finale, slow dissolve back into the sunset
];
const SPEED = 2;    // default playback multiplier: 2 = "a bit fast-forward"
const LENGTH = 5;   // seconds each scene is on screen after speed-up (incl. the dissolve on each side)
const FADE = 1;      // seconds of dissolve between scenes
const LOOP_FADE = 1.5; // slower dissolve from the last scene back into the first, so the loop seam reads as a deliberate return
const SIZE = "1920:1080"; // the hero covers a 1080p viewport plus parallax overscan, so upscale once here (lanczos + light sharpen) instead of letting the browser blur it
const FPS = 30;
const GRADE = "eq=contrast=1.04:saturation=1.08,unsharp=5:5:0.3:5:5:0"; // tiny lift so three sources read as one shoot, plus a light sharpen after the upscale

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "video-src", "hero");
const outDir = path.join(root, "public", "videos");

const ffmpeg = findFfmpeg();
const n = SCENES.length;
const len = (s) => s.length ?? LENGTH;
// Where each scene starts on the timeline: the previous one's start plus its length minus the shared dissolve.
const starts = SCENES.reduce((acc, s, i) => (i ? [...acc, acc[i - 1] + len(SCENES[i - 1]) - FADE] : [0]), []);
const loopAt = starts[n - 1] + len(SCENES[n - 1]) - LOOP_FADE; // the first scene re-enters here
const inputs = SCENES.flatMap((s) => {
  const f = path.join(srcDir, s.file);
  if (!existsSync(f)) throw new Error("Missing clip: " + f);
  return ["-ss", String(s.start), "-t", String(len(s) * (s.speed ?? SPEED)), "-i", f];
});

const grade = (i) => `setpts=${1 / (SCENES[i].speed ?? SPEED)}*PTS,fps=${FPS},scale=${SIZE}:flags=lanczos,format=yuv420p,${GRADE}`;
const parts = [];
parts.push(`[0:v]${grade(0)},split[s0][loop]`);
for (let i = 1; i < n; i++) parts.push(`[${i}:v]${grade(i)}[s${i}]`);
let prev = "s0";
for (let i = 1; i < n; i++) {
  parts.push(`[${prev}][s${i}]xfade=transition=fade:duration=${FADE}:offset=${starts[i]}[x${i}]`);
  prev = `x${i}`;
}
parts.push(`[${prev}][loop]xfade=transition=fade:duration=${LOOP_FADE}:offset=${loopAt}[all]`);
// Drop the head so the reel starts where the looped copy becomes fully visible: last frame == first frame.
parts.push(`[all]trim=start=${LOOP_FADE}:end=${loopAt + LOOP_FADE},setpts=PTS-STARTPTS,split[v1][v2]`);

run([
  "-v", "error", "-stats", "-y", ...inputs,
  "-filter_complex", parts.join(";"),
  "-map", "[v1]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-profile:v", "high", "-pix_fmt", "yuv420p", "-g", String(FPS * 2), "-movflags", "+faststart", path.join(outDir, "hero.mp4"),
  "-map", "[v2]", "-an", "-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-deadline", "good", "-cpu-used", "2", "-row-mt", "1", "-g", String(FPS * 2), path.join(outDir, "hero.webm"),
]);
run(["-v", "error", "-y", "-i", path.join(outDir, "hero.mp4"), "-frames:v", "1", "-q:v", "3", path.join(outDir, "hero-poster.jpg")]);

console.log(`
Done: ${loopAt}s reel.`);
SCENES.forEach((s, i) => console.log(`  ${s.label.padEnd(18)} ${Math.max(0, starts[i] - LOOP_FADE)}s - ${starts[i] + len(s) - LOOP_FADE}s`));

function run(args) {
  const r = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
function findFfmpeg() {
  const candidates = [process.env.FFMPEG, "ffmpeg"];
  // winget (Gyan.FFmpeg) drops the build under %LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*\bin.
  const pkgs = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
  if (pkgs && existsSync(pkgs)) {
    for (const d of readdirSync(pkgs).filter((d) => d.startsWith("Gyan.FFmpeg"))) {
      for (const v of readdirSync(path.join(pkgs, d))) candidates.push(path.join(pkgs, d, v, "bin", "ffmpeg.exe"));
    }
  }
  for (const c of candidates.filter(Boolean)) if (spawnSync(c, ["-version"], { stdio: "ignore" }).status === 0) return c;
  throw new Error("ffmpeg not found. Install with `winget install Gyan.FFmpeg` or set the FFMPEG env var to the full path of ffmpeg.exe");
}
