// @ts-ignore
import { getObjectMock } from 'aws-sdk';
import request from 'supertest';
import app from '../app';
import { owlFixture } from './fixtures';
import { expectResponse, wrap } from './helpers';

const getObject: jest.Mock = getObjectMock;
const server = request(app);

getObject.mockResolvedValue({
  Body: owlFixture,
});

describe('parameters', () => {
  it('resizes with background color', async () => {
    await expectResponse(
      server,
      '/owl/contain/500x500/bg(%23ff0000)',
      'image/png',
      200,
      true,
    );
  });

  it('blurs image', async () => {
    await expectResponse(
      server,
      '/owl/cover/attention/100x100/blur(10)',
      'image/png',
      200,
      true,
    );
  });

  it('rotates image', async () => {
    await expectResponse(
      server,
      '/owl/cover/attention/100x100/rotate(45)',
      'image/png',
      200,
      true,
    );
    await expectResponse(
      server,
      '/owl/cover/attention/100x100/rotate(45,%23fff)',
      'image/png',
      200,
      true,
    );
  });

  it('sets output quality', async () => {
    await expectResponse(
      server,
      '/owl/cover/attention/100x100/quality(5)',
      'image/png',
      200,
      true,
    );
  });

  it('overrides Accept header using format parameters', async () => {
    await wrap(
      server
        .get('/owl/cover/attention/100x100/webp')
        .set('Accept', 'image/png')
        .expect(200)
        .expect('Content-Type', /image\/webp/),
    );
  });
});
