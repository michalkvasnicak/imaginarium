import { Response, SuperTest, Test } from 'supertest';

export const gravity = [
  'center',
  'east',
  'south',
  'southeast',
  'southwest',
  'north',
  'northeast',
  'northwest',
  'west',
];
export const position = [
  'bottom',
  'left',
  'left-bottom',
  'left-top',
  'right',
  'right-bottom',
  'right-top',
  'top',
];
export const strategy = ['attention', 'entropy'];

export function wrap(request: Test): Promise<Response> {
  return new Promise((resolve, reject) => {
    request.end((err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
}

export async function expectResponse(
  request: SuperTest<any>,
  path: string,
  acceptType: string,
  statusCode: number,
  matchSnapshot: boolean = false,
): Promise<Response> {
  const response = await wrap(request.get(path).set('Accept', acceptType));

  expect(response.status).toBe(statusCode);
  expect(response.get('Content-Type')).toMatch(acceptType);

  if (matchSnapshot) {
    expect(response.body).toMatchImageSnapshot();
  }

  return response;
}
