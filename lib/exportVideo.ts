import { Member, Keyframe } from '@/types';
import { interpolatePositions } from './interpolation';

type ExportOptions = {
  videoElement: HTMLVideoElement;
  members: Member[];
  keyframes: Keyframe[];
  gridSize: { width: number; height: number };
  onProgress?: (progress: number) => void;
};

export async function exportVideo({
  videoElement,
  members,
  keyframes,
  gridSize,
  onProgress,
}: ExportOptions): Promise<void> {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

  const ffmpeg = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  const fps = 30;
  const duration = videoElement.duration;
  const totalFrames = Math.ceil(duration * fps);

  const videoWidth = videoElement.videoWidth || 640;
  const videoHeight = videoElement.videoHeight || 360;
  const floormapHeight = Math.round(videoWidth * 0.6);

  // 各フレームのCanvas描画
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = videoWidth;
  frameCanvas.height = videoHeight + floormapHeight;
  const ctx = frameCanvas.getContext('2d')!;

  const videoCanvas = document.createElement('canvas');
  videoCanvas.width = videoWidth;
  videoCanvas.height = videoHeight;
  const videoCtx = videoCanvas.getContext('2d')!;

  for (let i = 0; i < totalFrames; i++) {
    const timestamp = i / fps;
    videoElement.currentTime = timestamp;

    await new Promise<void>((resolve) => {
      videoElement.onseeked = () => resolve();
    });

    // 上半分：動画フレーム
    videoCtx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

    ctx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    ctx.drawImage(videoCanvas, 0, 0);

    // 下半分：床面図
    drawFloormapFrame(
      ctx,
      videoWidth,
      videoHeight,
      floormapHeight,
      members,
      keyframes,
      timestamp,
      gridSize
    );

    const blob = await new Promise<Blob>((resolve) => {
      frameCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85);
    });

    const frameData = new Uint8Array(await blob.arrayBuffer());
    await ffmpeg.writeFile(`frame${String(i).padStart(6, '0')}.jpg`, frameData);

    onProgress?.(i / totalFrames);
  }

  await ffmpeg.exec([
    '-framerate', String(fps),
    '-i', 'frame%06d.jpg',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    'output.mp4',
  ]);

  const outputData = await ffmpeg.readFile('output.mp4');
  const blobPart =
    outputData instanceof Uint8Array
      ? new Uint8Array(outputData)
      : (outputData as unknown as ArrayBuffer);
  const outputBlob = new Blob([blobPart], { type: 'video/mp4' });
  const url = URL.createObjectURL(outputBlob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'formation.mp4';
  a.click();
  URL.revokeObjectURL(url);

  onProgress?.(1);
}

function drawFloormapFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  offsetY: number,
  height: number,
  members: Member[],
  keyframes: Keyframe[],
  timestamp: number,
  gridSize: { width: number; height: number }
): void {
  // 背景
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, offsetY, canvasWidth, height);

  // グリッド
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  const cellW = canvasWidth / gridSize.width;
  const cellH = height / gridSize.height;
  for (let x = 0; x <= gridSize.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellW, offsetY);
    ctx.lineTo(x * cellW, offsetY + height);
    ctx.stroke();
  }
  for (let y = 0; y <= gridSize.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, offsetY + y * cellH);
    ctx.lineTo(canvasWidth, offsetY + y * cellH);
    ctx.stroke();
  }

  // メンバーの点を描画
  const positions = interpolatePositions(keyframes, timestamp);
  for (const pos of positions) {
    const member = members.find((m) => m.id === pos.memberId);
    if (!member) continue;
    const x = pos.x * canvasWidth;
    const y = offsetY + pos.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = member.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (member.name) {
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(member.name, x, y + 24);
    }
  }
}
