// @ts-ignore
import { getObjectMock } from 'aws-sdk';
import request from 'supertest';
import app from '../app';
import {
  jpegBigFixture,
  owlFixture,
  pngFixture,
  smallSvgFixture,
} from './fixtures';
import { expectResponse, gravity, position, strategy } from './helpers';

const getObject: jest.Mock = getObjectMock;
const server = request(app);

describe('resize (cover)', () => {
  describe('resize to width', () => {
    it('resizes jpeg to width', async () => {
      getObject.mockResolvedValue({
        Body: jpegBigFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/jpeg',
        200,
      );
    });

    it('resizes png to width', async () => {
      getObject.mockResolvedValue({
        Body: pngFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
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
        '/test-file-name/resize/w100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
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
        '/test-file-name/resize/w20',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w20',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w20',
        'image/jpeg',
        200,
      );
    });

    it('resizes without enlargement', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/unlarge/resize/w800',
        'image/png',
        200,
        true,
      );
    });

    it('resizes with enlargement', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/w800',
        'image/png',
        200,
        true,
      );
    });
  });

  describe('resize to height', () => {
    it('resizes jpeg to height', async () => {
      getObject.mockResolvedValue({
        Body: jpegBigFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/h100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/jpeg',
        200,
      );
    });

    it('resizes png to height', async () => {
      getObject.mockResolvedValue({
        Body: pngFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/h100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
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
        '/test-file-name/resize/h100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/h100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/h100',
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
        '/test-file-name/resize/h20',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/h20',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/h20',
        'image/jpeg',
        200,
      );
    });

    it('resizes without enlargement', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/unlarge/resize/h500',
        'image/png',
        200,
        true,
      );
    });

    it('resizes with enlargement', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/h500',
        'image/png',
        200,
        true,
      );
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
        '/test-file-name/resize/100x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/jpeg',
        200,
      );
    });

    it('resizes png', async () => {
      getObject.mockResolvedValue({
        Body: pngFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/100x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/resize/w100',
        'image/jpeg',
        200,
      );
    });

    it('resizes without enlargement', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/unlarge/resize/800x800',
        'image/png',
        200,
        true,
      );
    });

    it('resizes with enlargement', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/resize/800x800',
        'image/png',
        200,
        true,
      );
    });
  });

  describe('resize to width and height (position, gravity, strategy)', () => {
    test.each([...position, ...gravity, ...strategy])(
      '%s position',
      async input => {
        getObject.mockResolvedValue({
          Body: owlFixture,
        });

        await expectResponse(
          server,
          `/test-file-name/cover/${input}/100x100`,
          'image/png',
          200,
          true,
        );
      },
    );
  });
});
