import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    failureThreshold: 0.02, // 2%
  }),
});
