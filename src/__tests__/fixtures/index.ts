import { readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';

export const jpegBigFixture = readFileSync(
  resolvePath(__dirname, './big.jpeg'),
);
export const owlFixture = readFileSync(resolvePath(__dirname, './owl.jpeg'));
export const pngFixture = readFileSync(resolvePath(__dirname, './logo.png'));
