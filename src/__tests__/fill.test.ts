// @ts-ignore
import { getObjectMock } from 'aws-sdk';
import request from 'supertest';
import app from '../app';
import { jpegBigFixture, pngFixture, smallSvgFixture } from './fixtures';
import { expectResponse, wrap } from './helpers';

const getObject: jest.Mock = getObjectMock;
const server = request(app);

describe('resize (fill)', () => {
  describe('resize to width', () => {
    it('does not support this type', async () => {
      await wrap(server.get('/test-file-name/fill/w100').expect(404));
    });
  });

  describe('resize to height', () => {
    it('does not support this type', async () => {
      await wrap(server.get('/test-file-name/fill/h100').expect(404));
    });
  });

  describe('resize to width and height', () => {
    it('resizes jpeg', async () => {
      getObject.mockResolvedValue({
        Body: jpegBigFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/jpeg',
        200,
      );
    });

    it('resizes png', async () => {
      getObject.mockResolvedValue({
        Body: pngFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      // ask for non square bounding box because png is square
      await expectResponse(
        server,
        '/test-file-name/fill/80x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/jpeg',
        200,
      );
    });

    it('resizes svg (enlarge)', async () => {
      getObject.mockResolvedValue({
        Body: smallSvgFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/100x100',
        'image/jpeg',
        200,
      );
    });

    it('resizes svg (shrink)', async () => {
      getObject.mockResolvedValue({
        Body: smallSvgFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/fill/20x20',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/20x20',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/fill/20x20',
        'image/jpeg',
        200,
      );
    });
  });
});
