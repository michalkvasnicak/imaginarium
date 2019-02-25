import { S3 } from 'aws-sdk';
import express from 'express';
import sharp, { Sharp } from 'sharp';
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

type ManipulationFn = (image: sharp.Sharp) => sharp.Sharp;

const defaultS3Params = {
  Bucket: bucket,
};

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.send(405);
  }

  next();
});

const manipulator: express.RequestHandler = async (req, res, next) => {
  // check if there is a manipulator
  if ((req as any).manipulation == null) {
    return res.sendStatus(404);
  }

  try {
    const {
      manipulation,
      manipulationParameters,
    }: {
      manipulation: ManipulationFn;
      manipulationParameters: Parameters;
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
    const applyOperations = (originalImage: Sharp) => {
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
    };

    // negotiate content
    switch (
      req.accepts(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
    ) {
      case 'image/webp': {
        const body = await applyOperations(originalImage)
          .toFormat('webp', { alphaQuality, quality })
          .toBuffer();
        res.set('Content-Type', 'image/webp');
        res.set('Content-Length', body.byteLength.toString());
        res.set('Cache-Control', cacheControl);
        res.status(200);
        return res.send(body);
      }
      case 'image/png': {
        const body = await applyOperations(originalImage)
          .toFormat('png', { progressive, quality })
          .toBuffer();
        res.set('Content-Type', 'image/png');
        res.set('Content-Length', body.byteLength.toString());
        res.set('Cache-Control', cacheControl);
        res.status(200);
        return res.send(body);
      }
      case 'image/jpeg': {
        const body = await applyOperations(originalImage)
          .toFormat('jpeg', { progressive, quality })
          .toBuffer();
        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Length', body.byteLength.toString());
        res.set('Cache-Control', cacheControl);
        res.status(200);
        return res.send(body);
      }
      case 'image/svg+xml': {
        const metadata = await originalImage.metadata();

        if (metadata.format !== 'svg') {
          // @ts-ignore
          return res.send(406, `Can't convert ${metadata.format} to SVG`);
        }

        res.set('Content-Type', 'image/svg+xml');
        res.set(
          'Content-Length',
          (typeof file.Body === 'string'
            ? Buffer.from(file.Body, 'ascii')
            : (file.Body as Buffer)
          ).byteLength.toString(),
        );
        res.set('Cache-Control', cacheControl);
        res.status(200);
        return res.send(file.Body);
      }
      default: {
        return res.sendStatus(406);
      }
    }
  } catch (e) {
    if ((e as AWS.AWSError).statusCode === 404) {
      return res.sendStatus(404);
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
    const manipulation: ManipulationFn = image => {
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
    };
    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = manipulationParameters;

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
    const manipulation: ManipulationFn = image => {
      const normalizedPosition: string = position.replace('-', ' ');

      return image.resize(Number(width), Number(height), {
        background,
        fit: sharp.fit.contain,
        position:
          (sharp.gravity as any)[normalizedPosition] || normalizedPosition,
        withoutEnlargement: !!unlarge,
      });
    };

    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = manipulationParameters;

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
    const manipulation: ManipulationFn = image => {
      return image.resize(Number(width), Number(height), {
        fit: sharp.fit.fill,
        withoutEnlargement: !!unlarge,
      });
    };

    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = manipulationParameters;

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
    const manipulation: ManipulationFn = image => {
      return image.resize(Number(width), Number(height), {
        fit: sharp.fit.inside,
        withoutEnlargement: !!unlarge,
      });
    };

    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = manipulationParameters;

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
    const manipulation: ManipulationFn = image => {
      return image.resize(Number(width), Number(height), {
        fit: sharp.fit.outside,
        withoutEnlargement: !!unlarge,
      });
    };

    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = manipulationParameters;

    next();
  },
  manipulator,
);

app.get(
  `/:filename/${parameters}`,
  (req, res, next) => {
    const { parameters = '' } = req.params;
    const manipulation: ManipulationFn = image => image;
    const manipulationParameters = parseParameters(parameters);

    (req as any).manipulation = manipulation;
    (req as any).manipulationParameters = manipulationParameters;

    next();
  },
  manipulator,
);

export default app;
