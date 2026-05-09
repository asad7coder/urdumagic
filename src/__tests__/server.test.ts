import { describe, it, expect } from 'vitest';
import { renderToString } from '../server/renderToString';
import { extendDictionary } from '../server/extend-dictionary';

describe('Server-Side Rendering', () => {
  it('should translate basic HTML tags', async () => {
    // We need to make sure the dictionary has these words or they are in the engine
    // EnglishEngine.translateToUrdu('buy') might return something if it's in the dict
    const html = '<h1>Buy cow</h1>';
    const translated = await renderToString(html, 'ur');
    expect(translated).toContain('<h1>');
    expect(translated).toContain('</h1>');
    // Check if translation happened (at least changed from original)
    expect(translated).not.toBe(html);
  });

  it('should add dir="rtl" to <html> tag for Urdu', async () => {
    const html = '<html><body><p>Hello</p></body></html>';
    const translated = await renderToString(html, 'ur');
    expect(translated).toContain('dir="rtl"');
  });

  it('should support custom dictionary extensions', async () => {
    extendDictionary({ 'sahiwal': 'ساہیوال' });
    const html = '<p>sahiwal cow</p>';
    const translated = await renderToString(html, 'ur');
    expect(translated).toContain('ساہیوال');
  });

  it('should not have DOM dependencies', async () => {
    // This test runs in Vitest, we should ensure it doesn't rely on global document/window
    // node-html-parser is used which is a pure JS parser.
    const html = '<div>Test</div>';
    const result = await renderToString(html, 'roman');
    expect(result).toBeDefined();
    expect(typeof window).toBe('undefined');
  });

  it('should handle alt and placeholder attributes', async () => {
    const html = '<img src="test.jpg" alt="A beautiful cow"> <input placeholder="Search for animals">';
    const translated = await renderToString(html, 'ur');
    expect(translated).toContain('alt="');
    expect(translated).toContain('placeholder="');
    expect(translated).not.toContain('A beautiful cow');
    expect(translated).not.toContain('Search for animals');
  });
});
