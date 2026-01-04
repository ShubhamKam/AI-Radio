import fs from 'fs/promises';
import path from 'path';

export async function createDirectories(): Promise<void> {
  const directories = [
    process.env.UPLOAD_DIR || './uploads',
    './logs',
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }
}
