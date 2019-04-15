const colorInt = '(0|[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-6])';
const colorHex = `(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})`;
const colorAlpha = '(0?\\.[0-9]|1)';
const rgb = `rgb\\(${colorInt},${colorInt},${colorInt}\\)`;
const rgba = `rgba\\(${colorInt},${colorInt},${colorInt},${colorAlpha}\\)`;
const color = `(${colorHex}|${rgb}|${rgba})`;
const qualityInt = '([1-9]|[1-9][0-9]|100)';
const blurSigma = '(0?.[3-9]|[0-9]{1,3}|1000)';

const alphaQuality = () => new RegExp(`alphaQuality\\(${qualityInt}\\)`, 'g');
const quality = () => new RegExp(`quality\\(${qualityInt}\\)`, 'g');
const blur = () => new RegExp(`blur(?:\\(${blurSigma}\\))?`, 'g');
const format = () => new RegExp(`(svg|jpeg|webp|png)`, 'gi');
const rotate = () =>
  new RegExp(`rotate\\((-?\\d{1,3})(?:,\\s*${color})?\\)`, 'g');
const progressive = () => /progressive(?:\((1|true|0|false)\))?/g;

export type Parameters = {
  alphaQuality?: number; // alphaQuality for webp format
  blur?: number | true; // if number, gaussian blur with sigma is used
  format?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml';
  progressive?: boolean;
  rotate?: {
    angle: number;
    background?: string;
  };
  quality?: number;
};

const formats: { [format: string]: Parameters['format'] } = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

export default function paramParser(params: string): Parameters {
  const parameters: Parameters = {};

  params.replace(alphaQuality(), (match: string, q: string) => {
    parameters.alphaQuality = Number(q);

    return match;
  });

  params.replace(blur(), (match: string, sigma: string | undefined) => {
    parameters.blur = sigma != null ? Number(sigma) : true;

    return match;
  });

  params.replace(format(), (match: string, format: string) => {
    parameters.format = formats[format.toLowerCase() as keyof (typeof formats)];

    return match;
  });

  params.replace(progressive(), (match: string, p: string | undefined) => {
    parameters.progressive = p == null ? true : p === '1' || p === 'true';

    return match;
  });

  params.replace(quality(), (match: string, q: string) => {
    parameters.quality = Number(q);

    return match;
  });

  params.replace(
    rotate(),
    (match: string, angle: string, color: string | undefined) => {
      parameters.rotate = {
        angle: Number(angle),
      };

      if (color) {
        parameters.rotate.background = color;
      }

      return match;
    },
  );

  return parameters;
}
