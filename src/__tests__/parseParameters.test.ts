import parseParameters from '../parseParameters';

describe('parseParameters', () => {
  it('parses parameters and filters from string and ignores everything other', () => {
    expect(parseParameters('adadsaquality(10)blur')).toEqual({
      quality: 10,
      blur: true,
    });

    expect(parseParameters('blur(10)quality(1)')).toEqual({
      blur: 10,
      quality: 1,
    });
  });

  it('parses format setting', () => {
    expect(parseParameters('svg')).toEqual({ format: 'image/svg+xml' });
    expect(parseParameters('SVG')).toEqual({ format: 'image/svg+xml' });
    expect(parseParameters('jpeg')).toEqual({ format: 'image/jpeg' });
    expect(parseParameters('JPEG')).toEqual({ format: 'image/jpeg' });
    expect(parseParameters('png')).toEqual({ format: 'image/png' });
    expect(parseParameters('PNG')).toEqual({ format: 'image/png' });
    expect(parseParameters('webp')).toEqual({ format: 'image/webp' });
    expect(parseParameters('WEBP')).toEqual({ format: 'image/webp' });
  });

  it('parses progressive setting', () => {
    expect(parseParameters('progressive')).toEqual({ progressive: true });
    expect(parseParameters('progressive(1)')).toEqual({ progressive: true });
    expect(parseParameters('progressive(true)')).toEqual({ progressive: true });
    expect(parseParameters('progressive(0)')).toEqual({ progressive: false });
    expect(parseParameters('progressive(false)')).toEqual({
      progressive: false,
    });
  });

  it('parses rotate', () => {
    expect(parseParameters('rotate')).toEqual({});
    expect(parseParameters('rotate()')).toEqual({});
    expect(parseParameters('rotate(1.1)')).toEqual({});
    expect(parseParameters('rotate(110)')).toEqual({ rotate: { angle: 110 } });
    expect(parseParameters('rotate(1)')).toEqual({ rotate: { angle: 1 } });
    expect(parseParameters('rotate(50)')).toEqual({ rotate: { angle: 50 } });
    expect(parseParameters('rotate(100,#000)')).toEqual({
      rotate: { angle: 100, background: '#000' },
    });
    expect(parseParameters('rotate(100, #000)')).toEqual({
      rotate: { angle: 100, background: '#000' },
    });
    expect(parseParameters('rotate(100, rgba(0,0,0,.1))')).toEqual({
      rotate: { angle: 100, background: 'rgba(0,0,0,.1)' },
    });
  });

  it('parses quality', () => {
    expect(parseParameters('quality')).toEqual({});
    expect(parseParameters('quality()')).toEqual({});
    expect(parseParameters('quality(1.1)')).toEqual({});
    expect(parseParameters('quality(110)')).toEqual({});
    expect(parseParameters('quality(1)')).toEqual({ quality: 1 });
    expect(parseParameters('quality(50)')).toEqual({ quality: 50 });
    expect(parseParameters('quality(100)')).toEqual({ quality: 100 });
  });

  it('parses blur', () => {
    expect(parseParameters('blur(99999)')).toEqual({ blur: true });
    expect(parseParameters('blur(0.3)')).toEqual({ blur: 0.3 });
    expect(parseParameters('blur(.3)')).toEqual({ blur: 0.3 });
    expect(parseParameters('blur(1000)')).toEqual({ blur: 1000 });
    expect(parseParameters('blur(1001)')).toEqual({ blur: true });
  });

  it('parses alphaQuality', () => {
    // for webp
    expect(parseParameters('alphaQuality')).toEqual({});
    expect(parseParameters('alphaQuality()')).toEqual({});
    expect(parseParameters('alphaQuality(1.1)')).toEqual({});
    expect(parseParameters('alphaQuality(110)')).toEqual({});
    expect(parseParameters('alphaQuality(1)')).toEqual({ alphaQuality: 1 });
    expect(parseParameters('alphaQuality(50)')).toEqual({ alphaQuality: 50 });
    expect(parseParameters('alphaQuality(100)')).toEqual({ alphaQuality: 100 });
  });

  it('parses background color', () => {
    // for webp
    expect(parseParameters('bg')).toEqual({});
    expect(parseParameters('bg()')).toEqual({});
    expect(parseParameters('bg(#000)')).toEqual({ background: '#000' });
    expect(parseParameters('bg(#000000)')).toEqual({ background: '#000000' });
    expect(parseParameters('bg(rgb(0,0,0))')).toEqual({
      background: 'rgb(0,0,0)',
    });
    expect(parseParameters('bg(rgba(0,0,0,0.1))')).toEqual({
      background: 'rgba(0,0,0,0.1)',
    });
  });
});
