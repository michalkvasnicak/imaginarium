# Imaginarium [![CircleCI](https://circleci.com/gh/michalkvasnicak/imaginarium.svg?style=svg&circle-token=b0329dc8351a6274382784ef0a750a146b597a7b)](https://circleci.com/gh/michalkvasnicak/imaginarium)

🖼️ Serverless javascript image processor based on [Sharp](http://sharp.pixelplumbing.com/en/stable/).

Supports:

- content negotiation based on `Accept` header with following output formats:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- resizing modes:
  - `cover`
  - `contain`
  - `fill`
  - `inside`
  - `outside`

## Structure of URL and supported operations

### Original

Returns the original image with applied parameters (`quality, blur, etc`).

```
/{filename}
/{filename}/parameters?
```

### Cover mode

The replaced content is sized to maintain its aspect ratio while filling the element’s entire content box. If the object's aspect ratio does not match the aspect ratio of its box, then the object will be clipped to fit.

```
/{filename}/{unlarge}?/resize|cover/w{width}/{settings/filters}?
/{filename}/{unlarge}?/resize|cover/h{width}/{settings/filters}?
/{filename}/{unlarge}?/resize|cover/{width}x{height}/{settings/filters}?
```

### Contain mode

The replaced content is scaled to maintain its aspect ratio while fitting within the element’s content box. The entire object is made to fill the box, while preserving its aspect ratio, so the object will be "letterboxed" if its aspect ratio does not match the aspect ratio of the box.

```
/filename/{unlarge}?/contain/{bgcolor}?/{width}x{height}/{filters}?
```

### Fill mode

The replaced content is sized to fill the element’s content box. The entire object will completely fill the box. If the object's aspect ratio does not match the aspect ratio of its box, then the object will be stretched to fit.

```
/filename/{unlarge}?/fill/{width}x{height}/{filters}?
```

### Inside mode

Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.

```
/filename/{unlarge}?/inside/{width}x{height}/{filters}?
```

### Outside mode

Preserving aspect ratio, resize the image to be as small as possible while ensuring its dimensions are greater than or equal to both those specified

```
/filename/{unlarge}?/outside/{width}x{height}/{filters}?
```

### Settings and filters

#### Blur

- `blur` - performs a fast, mild blur of the output image
- `blur(sigma)` - where `sigma` is number between `0.3` and `1000` performs a slower, more accurate Gaussian blur.

#### Quality

- `quality(value)` - where `value` is number between `1` and `100`, `default` is `80`

#### Progressive (only `jpeg` and `png`)

- `progressive(1|true)` - sets output image as progressive

#### Alpha Quality (only `webp`)

- `alphaQuality(value)` - where `value` is number between `1` and `100`

#### Rotate

- `rotate(angle)`
  - `angle` is angle of rotation
- `rotate(angle,color)`
  - `angle` is angle of rotation
  - `color` is hex color or `rgb()` or `rgba()`

## Installation

```console
git clone git@github.com:michalkvasnicak/imaginarium
cd imaginarium

# yarn is recommended because this project uses yarn
yarn install
# or
npm install
```

## Usage

### Configuration

Make sure you set these environment variables

- `AWS_REGION` (**required**): AWS Region where your function will be deployed
- `AWS_ACCESS_KEY_ID` (**required**): Access Key ID used to deploy to AWS
- `AWS_SECRET_ACCESS_KEY` (**required**): Secret key used to deploy to AWS
- `S3_IMAGE_BUCKET` (**required**): AWS S3 Bucket name where your image files are stored
- `S3_FUNCTION_BUCKET` (**required**): AWS S3 Bucket where function packages will be stored (you must create it before deploy)
- `S3_IMAGE_KEY_PATTERN` (**optional**, _`:filename`_): Optional image bucket key pattern. Use `:filename` as a placeholder for filename from URI, pattern cannot end or start with `/`.
- `CDN_CERTIFICATE_ARN` (**optional**): SSL Certificate ARN from AWS Certificate Manager (_`arn:aws:acm:us-east-1:{YOUR ACCOUNT ID}:certificate/{CERTIFICATE ID}`_)
- `CDN_ALIASES` (**optional**): The comma separated list of domains that will be associated with CloudFront distribution
- `STACK_NAME` (**optional**, _imaginarium_): Name of stack in AWS Cloud Formation

### Run locally

```console
yarn start
# or
npm start
```

And it will start to listen on [http://localhost:3000](http://localhost:3000)

### Deploy to AWS

```console
yarn deploy
# or
npm run deploy
```

This command will use [Docker](https://www.docker.com/) so make sure you have Docker installed on your system. Docker is used to prepare Sharp with binaries for AWS Lambda runtime.

Then it will deploy following resources:

- AWS Lambda Function
- AWS Lambda Api Gateway

## LICENSE

MIT
