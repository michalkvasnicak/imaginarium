// @ts-ignore
import { AWSError, getObjectMock } from 'aws-sdk';
import request from 'supertest';
import app from '../app';
import { jpegBigFixture, owlFixture } from './fixtures';
import { expectResponse, wrap } from './helpers';

const getObject: jest.Mock = getObjectMock;
const server = request(app);

describe('app', () => {
  beforeEach(() => {
    getObject.mockClear();
  });

  it('returns 405 if method is not GET', async () => {
    await wrap(server.post('/test-filename/smart').expect(405));
  });

  it('returns 404 if unknown route is used', async () => {
    await wrap(server.get('/img/test-filename/trololo').expect(404));
  });

  it('returns 404 if photo is not found', async () => {
    const err: AWSError = new Error('Not found') as any;
    err.statusCode = 404;

    getObject.mockRejectedValueOnce(err);

    await wrap(server.get('/test-filename/resize/w100').expect(404));
  });

  it('returns 406 if content could not be negotiated', async () => {
    getObject.mockResolvedValueOnce({
      Body: jpegBigFixture,
    });

    await wrap(
      server
        .get('/test-file-name/resize/w100')
        .set('Accept', 'text/plain')
        .expect(406),
    );
  });

  it('returns jpeg as default content type for any type', async () => {
    getObject.mockResolvedValueOnce({
      Body: jpegBigFixture,
    });

    await wrap(
      server
        .get('/test-file-name/resize/w100')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', /image\/jpeg/),
    );
  });

  it('returns a webp for complex header', async () => {
    getObject.mockResolvedValueOnce({
      Body: jpegBigFixture,
    });

    await wrap(
      server
        .get('/test-file-name/resize/w100')
        .set(
          'Accept',
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        )
        .expect(200)
        .expect('Content-Type', /image\/webp/),
    );
  });

  it('returns original of image (without parameters)', async () => {
    getObject.mockResolvedValueOnce({
      Body: owlFixture,
    });

    await expectResponse(server, `/test-file-name`, 'image/png', 200, true);
  });

  it('returns original of image (with parameters)', async () => {
    getObject.mockResolvedValueOnce({
      Body: owlFixture,
    });

    await expectResponse(
      server,
      `/test-file-name/quality(30)blur(10)`,
      'image/png',
      200,
      true,
    );
  });
});
