import config from '../config/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

function useLocalFallback() {
  return !config.oss.accessKeyId;
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  _mimeType: string
): Promise<{ ossKey: string; ossUrl: string }> {
  if (useLocalFallback()) {
    // Local filesystem fallback
    const filePath = path.join(uploadsDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return {
      ossKey: key,
      ossUrl: `/uploads/${key}`,
    };
  }

  // Alibaba Cloud OSS
  const OSS = (await import('ali-oss')).default;
  const client = new OSS({
    region: config.oss.region,
    accessKeyId: config.oss.accessKeyId,
    accessKeySecret: config.oss.accessKeySecret,
    bucket: config.oss.bucket,
  });

  const result = await client.put(key, buffer);
  return {
    ossKey: key,
    ossUrl: result.url,
  };
}

export async function deleteFile(key: string): Promise<void> {
  if (useLocalFallback()) {
    const filePath = path.join(uploadsDir, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return;
  }

  const OSS = (await import('ali-oss')).default;
  const client = new OSS({
    region: config.oss.region,
    accessKeyId: config.oss.accessKeyId,
    accessKeySecret: config.oss.accessKeySecret,
    bucket: config.oss.bucket,
  });

  await client.delete(key);
}
