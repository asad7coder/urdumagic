/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMagicDom } from '../client/dom-walker.js';

describe('magic.ts - DOM Scanning & RTL', () => {
  let mockTranslate: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
    mockTranslate = vi.fn().mockResolvedValue('اردو ترجمہ');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should scan text nodes and exclude <script> and <style> tags', async () => {
    document.body.innerHTML = `
      <div id="target">Hello World</div>
      <script>const x = 1;</script>
      <style>.test { color: red; }</style>
      <span>Nested Text</span>
    `;

    const controller = createMagicDom(document, {
      debounceMs: 0,
      translate: mockTranslate
    });

    controller.snapshotAndMark();
    await controller.applyLanguage('ur');

    expect(mockTranslate).toHaveBeenCalledWith('Hello World', 'ur');
    expect(mockTranslate).toHaveBeenCalledWith('Nested Text', 'ur');
    expect(mockTranslate).not.toHaveBeenCalledWith('const x = 1;', 'ur');
    
    const div = document.getElementById('target');
    expect(div?.textContent).toBe('اردو ترجمہ');
    
    controller.destroy();
  });

  it('should set dir="rtl" and lang="ur" on the document when switching to Urdu', async () => {
    document.body.innerHTML = `<div id="el">Test</div>`;

    const controller = createMagicDom(document, {
      debounceMs: 0,
      translate: mockTranslate
    });

    await controller.applyLanguage('ur');

    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ur');
    
    const style = document.getElementById('urdumagic-rtl-styles');
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('Noto Nastaliq Urdu');
    
    controller.destroy();
  });

  it('should restore dir="ltr" and lang="en" when switching back to English', async () => {
    const controller = createMagicDom(document, {
      debounceMs: 0,
      translate: mockTranslate
    });

    // First switch to Urdu
    await controller.applyLanguage('ur');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');

    // Then switch back to English
    await controller.applyLanguage('en');

    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    
    controller.destroy();
  });
});
