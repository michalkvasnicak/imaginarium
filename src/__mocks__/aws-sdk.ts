export const getObjectMock = jest.fn();

export class S3 {
  getObject() {
    return {
      promise: getObjectMock,
    };
  }
}
