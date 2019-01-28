import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    customDiffConfig: {
      threshold: 0.02, // 2% threshold
    },
  }),
});
