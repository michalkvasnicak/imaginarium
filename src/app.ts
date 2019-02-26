import { S3 } from 'aws-sdk';
import express from 'express';
import sharp, { ResizeOptions, Sharp, cache } from 'sharp';
import parseParameters, { Parameters } from './parseParameters';

const region = process.env.AWS_REGION;
const bucket: string = process.env.S3_IMAGE_BUCKET || '';
const fileKeyPattern: string = process.env.S3_IMAGE_KEY_PATTERN || ':filename';

if (!region) {
  throw new Error('Please set up AWS_REGION');
}

if (!bucket) {
  throw new Error('Please set up S3_IMAGE_BUCKET');
}

const app = express();
const s3 = new S3({
  region,
});

type ManipulationParameters = Parameters & {
  format: 'image/jpeg' | 'image/webp' | 'image/png' | 'image/svg+xml';
  resize?: ResizeOptions;
};

// type ManipulationFn = (image: sharp.Sharp) => sharp.Sharp;

const defaultS3Params = {
  Bucket: bucket,
};

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.send(405);
  }

  next();
});

async function processImage(
  image: Buffer,
  {
    alphaQuality,
    blur,
    format,
    progressive,
    quality,
    resize,
    rotate,
  }: ManipulationParameters,
): Promise<Buffer> {
  let source = sharp(image);
  const sourceMetadata = await source.metadata();

  if (sourceMetadata.format !== 'svg' && format === 'image/svg+xml') {
    // we don't do any manipulations because we can't

    const err = new Error(`Cannot convert ${sourceMetadata.format} to SVG`);
    (err as any).statusCode = 406;

    throw err;
  }

  // if source image is svg and we want svg, return as is
  // because wa can't perform any manipulations without rasterization
  if (sourceMetadata.format === 'svg' && format === 'image/svg+xml') {
    return image;
  }

  // if source is svg, detect if we have resize parameter
  // then we need to calculate correct density so we the output image is
  // as sharp as possible
  if (sourceMetadata.format === 'svg' && resize != null) {
    // default pixel density according to
    // https://www.w3.org/TR/CSS21/syndata.html
    let density = 96;

    if (resize.width != null) {
      density = 96 * (resize.width / sourceMetadata.width!);
    } else if (resize.height != null) {
      density = 96 * (resize.height / sourceMetadata.height!);
    } else {
      throw new Error(
        'Cannot perform resize without at least one desired dimension',
      );
    }

    // create new source
    source = sharp(image, { density });
  }

  // apply resize
  if (resize != null) {
    source = source.resize(undefined, undefined, resize);
  }

  // apply rotation
  if (rotate != null) {
    source = source.rotate(rotate.angle, {
      background: rotate.background,
    });
  }

  // apply blur
  if (blur != null) {
    source = source.blur(blur !== true ? blur : undefined);
  }

  // now convert to desired output format
  switch (format) {
    case 'image/jpeg': {
      return source.jpeg({ progressive, quality }).toBuffer();
    }
    case 'image/png': {
      return source.png({ progressive }).toBuffer();
    }
    case 'image/webp': {
      return source.webp({ alphaQuality, quality }).toBuffer();
    }
    default: {
      throw new Error(`Unknown format ${format}`);
    }
  }
}

const manipulator: express.RequestHandler = async (req, res, next) => {
  // check if there is a manipulator
  /* if ((req as any).manipulation == null) {
    return res.sendStatus(404);
  }*/

  try {
    const {
      // manipulation,
      manipulationParameters,
    }: {
      // manipulation: ManipulationFn;
      manipulationParameters: Parameters & { resize?: ResizeOptions };
    } = req as any;
    const file = await s3
      .getObject({
        ...defaultS3Params,
        Key: fileKeyPattern.replace(':filename', req.params.filename),
      })
      .promise();
    const cacheControl = 'max-age=31556926, immutable'; // 1 year of immutable
    const originalImage = sharp(file.Body as Buffer);
    const {
      alphaQuality,
      blur,
      progressive,
      quality = 80,
      rotate,
    } = manipulationParameters;
    /* const applyOperations = (originalImage: Sharp) => {
      let image = manipulation(originalImage);

      // apply operations
      if (rotate != null) {
        image = image.rotate(rotate.angle, {
          background: rotate.background,
        });
      }

      if (blur != null) {
        image = image.blur(blur !== true ? blur : undefined);
      }

      return image;
    };*/

    const requestedContentType = req.accepts([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ]) as ManipulationParameters['format'] | false;

    if (requestedContentType === false) {
      return res.send(406);
    }

    const parameters: ManipulationParameters = {
      ...manipulationParameters,
      format: requestedContentType,
    };

    const body = await processImage(file.Body as Buffer, parameters);

    res.set('Content-Type', requestedContentType);
    res.set('Content-Length', body.byteLength.toString());
    res.set('Cache-Control', cacheControl);
    res.status(200);

    return res.send(body);
  } catch (e) {
    if ((e as any).statusCode != null) {
      // @ts-ignore
      return res.send(e.statusCode, e.message);
    }

    next(e);
  }
};

const parameters = ':parameters?';
const height = ':height([1-9][0-9]{0,3})';
const width = ':width([1-9][0-9]{0,3})';
const gravity =
  'center|centre|east|south|southeast|southwest|north|northeast|northwest|west';
const position =
  'bottom|center|centre|left|left-bottom|left-top|right|right-bottom|right-top|top';
const strategy = 'attention|entropy';

// resize respecting aspect ratio
// object-fit cover
// https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
app.get(
  [
    `/:filename/resize/w${width}/${parameters}`,
    `/:filename/:unlarge(unlarge)/resize/w${width}/${parameters}`,
    `/:filename/cover/w${width}/${parameters}`,
    `/:filename/:unlarge(unlarge)/cover/w${width}/${parameters}`,
    `/:filename/resize/h${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/resize/h${height}/${parameters}`,
    `/:filename/cover/h${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/cover/h${height}/${parameters}`,
    `/:filename/resize/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/resize/${width}x${height}/${parameters}`,
    `/:filename/cover/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/cover/${width}x${height}/${parameters}`,
    `/:filename/cover/:position(${gravity}|${position}|${strategy})/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/cover/:position(${gravity}|${position}|${strategy})/${width}x${height}/${parameters}`,
  ],
  (req, res, next) => {
    const {
      height,
      position = 'center',
      parameters = '',
      unlarge = false,
      width,
    } = req.params;
    const normalizedPosition: string = position.replace('-', ' ');
    const resize: ResizeOptions = {
      height: height ? Number(height) : undefined,
      width: width ? Number(width) : undefined,
      fit: sharp.fit.cover,
      position:
        (sharp.gravity as any)[normalizedPosition] ||
        (sharp.strategy as any)[normalizedPosition] ||
        normalizedPosition,
      withoutEnlargement: !!unlarge,
    };
    /* const manipulation: ManipulationFn = image => {
      const normalizedPosition: string = position.replace('-', ' ');

      return image.resize(
        width ? Number(width) : undefined,
        height ? Number(height) : undefined,
        {
          fit: sharp.fit.cover,
          position:
            (sharp.gravity as any)[normalizedPosition] ||
            (sharp.strategy as any)[normalizedPosition] ||
            normalizedPosition,
          withoutEnlargement: !!unlarge,
        },
      );
    };*/
    const manipulationParameters = parseParameters(parameters);

    // (req as any).manipulation = { ...manipulationParameters, resize };
    (req as any).manipulationParameters = { ...manipulationParameters, resize };

    next();
  },
  manipulator,
);

// resizes respecting aspect ratio
// object-fit container
// https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
app.get(
  [
    `/:filename/contain/${width}x${height}/${parameters}`,
    `/:filename/contain/bg:background/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/contain/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/contain/bg:background/${width}x${height}/${parameters}`,
    `/:filename/contain/:position(${gravity}|${position})/${width}x${height}/${parameters}`,
    `/:filename/contain/bg:background/:position(${gravity}|${position})/${width}x${height}/${parameters}`,
    `/:filename/contain/:position(${gravity}|${position})/bg:background/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/contain/:position(${gravity}|${position})/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/contain/bg:bgcolor/:position(${gravity}|${position})/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/contain/:position(${gravity}|${position})/bg:bgcolor/${width}x${height}/${parameters}`,
  ],
  (req, rest, next) => {
    const {
      background = 'rgba(0,0,0,1)', // parseable by color module https://www.npmjs.com/package/color
      height,
      position = 'center',
      parameters = '',
      unlarge = false,
      width,
    } = req.params;
    const normalizedPosition: string = position.replace('-', ' ');
    const resize: ResizeOptions = {
      background,
      fit: sharp.fit.contain,
      height: Number(height),
      width: Number(width),
      position:
        (sharp.gravity as any)[normalizedPosition] || normalizedPosition,
      withoutEnlargement: !!unlarge,
    };

    const manipulationParameters = parseParameters(parameters);

    // (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = { ...manipulationParameters, resize };

    next();
  },
  manipulator,
);

// resizes ignoring aspect ratio
// object-fit fill
// https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
app.get(
  [
    `/:filename/fill/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/fill/${width}x${height}/${parameters}`,
  ],
  (req, rest, next) => {
    const { height, parameters = '', unlarge = false, width } = req.params;
    const resize: ResizeOptions = {
      fit: sharp.fit.fill,
      height: Number(height),
      width: Number(width),
      withoutEnlargement: !!unlarge,
    };
    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulationParameters = { ...manipulationParameters, resize };

    next();
  },
  manipulator,
);

// Preserving aspect ratio, resize the image to be as large as possible while ensuring
// its dimensions are less than or equal to both those specified.
// http://sharp.pixelplumbing.com/en/stable/api-resize/
app.get(
  [
    `/:filename/inside/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/inside/${width}x${height}/${parameters}`,
  ],
  (req, rest, next) => {
    const { height, parameters = '', unlarge = false, width } = req.params;
    const resize: ResizeOptions = {
      fit: sharp.fit.inside,
      height: Number(height),
      width: Number(width),
      withoutEnlargement: !!unlarge,
    };
    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulationParameters = { ...manipulationParameters, resize };

    next();
  },
  manipulator,
);

// Preserving aspect ratio, resize the image to be as small as possible while ensuring
// its dimensions are greater than or equal to both those specified.
// http://sharp.pixelplumbing.com/en/stable/api-resize/
app.get(
  [
    `/:filename/outside/${width}x${height}/${parameters}`,
    `/:filename/:unlarge(unlarge)/outside/${width}x${height}/${parameters}`,
  ],
  (req, rest, next) => {
    const { height, parameters = '', unlarge = false, width } = req.params;

    const resize: ResizeOptions = {
      fit: sharp.fit.outside,
      height: Number(height),
      width: Number(width),
      withoutEnlargement: !!unlarge,
    };
    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulationParameters = { ...manipulationParameters, resize };

    next();
  },
  manipulator,
);

app.get(
  `/:filename/${parameters}`,
  (req, res, next) => {
    const { parameters = '' } = req.params;
    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulationParameters = manipulationParameters;

    next();
  },
  manipulator,
);

export default app;
