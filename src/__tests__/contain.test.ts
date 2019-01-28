// @ts-ignore
import { getObjectMock } from 'aws-sdk';
import request from 'supertest';
import app from '../app';
import { jpegBigFixture, owlFixture, pngFixture } from './fixtures';
import { expectResponse, gravity, position, wrap } from './helpers';

const getObject: jest.Mock = getObjectMock;
const server = request(app);

describe('resize (contain)', () => {
  describe('resize to width', () => {
    it('does not support this type', async () => {
      await wrap(server.get('/test-file-name/contain/w100').expect(404));
    });
  });

  describe('resize to height', () => {
    it('does not support this type', async () => {
      await wrap(server.get('/test-file-name/contain/h100').expect(404));
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
        '/test-file-name/contain/100x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/contain/100x100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/contain/100x100',
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
        '/test-file-name/contain/100x100',
        'image/png',
        200,
        true,
      );
      await expectResponse(
        server,
        '/test-file-name/contain/100x100',
        'image/webp',
        200,
      );
      await expectResponse(
        server,
        '/test-file-name/contain/100x100',
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
        '/test-file-name/unlarge/contain/800x800',
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
        '/test-file-name/contain/800x800',
        'image/png',
        200,
        true,
      );
    });

    it('resizes with custom background color', async () => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      // test snapshot only here because image snapshot does not support other formats
      await expectResponse(
        server,
        '/test-file-name/contain/bgrgba(255,255,255,0.5)/800x800',
        'image/png',
        200,
        true,
      );
    });
  });

  describe('resize to width and height (position, gravity)', () => {
    test.each([...position, ...gravity])('%s mode', async input => {
      getObject.mockResolvedValue({
        Body: owlFixture,
      });

      await expectResponse(
        server,
        `/test-file-name/contain/${input}/100x100`,
        'image/png',
        200,
        true,
      );
    });
  });
});
