import type { UrduMagicInstance, UrduMagicConfig } from '../types.js';

/**
 * Safe magic mode options
 */
export interface SafeMagicModeOptions {
  selector?: string;
  exclude: {
    tags: string[];
    classes: string[];
    attributes?: string[];
    selectors: string[];
  };
  debounce?: number;
  preserveOriginal?: boolean;
  maxNodes?: number;
  skipProcessed?: boolean;
}

/**
 * Safe magic mode controller
 * - Prevents performance issues
 * - Respects exclusions
 * - Avoids re-processing
 * - Handles edge cases
 */
export class SafeMagicMode {
  private instance: UrduMagicInstance;
  private config: UrduMagicConfig;
  private options: Required<SafeMagicModeOptions>;
  private enabled: boolean = false;
  private observer: MutationObserver | null = null;
  private processedNodes: WeakSet<Node> = new WeakSet();
  private debounceTimer: any = null;
  private isTranslating: boolean = false;
  private stats = {
    nodesProcessed: 0,
    nodesSkipped: 0,
    errors: 0,
    lastUpdate: 0
  };

  constructor(
    instance: UrduMagicInstance,
    config: UrduMagicConfig,
    options: SafeMagicModeOptions = {} as any
  ) {
    this.instance = instance;
    this.config = config;

    // Merge options with safe defaults
    this.options = {
      selector: options.selector || config.magicMode?.selector || 'body',
      exclude: {
        tags: options.exclude?.tags || config.magicMode?.skipTags || ['script', 'style', 'noscript'],
        classes: options.exclude?.classes || config.magicMode?.skipClasses || ['no-translate', 'code', 'pre'],
        attributes: options.exclude?.attributes || config.magicMode?.attributes || ['title', 'alt', 'placeholder'],
        selectors: options.exclude?.selectors || []
      },
      debounce: options.debounce || config.magicMode?.debounceMs || 500,
      preserveOriginal: options.preserveOriginal ?? config.magicMode?.preserveOriginal ?? true,
      maxNodes: options.maxNodes || 1000, // Safety limit
      skipProcessed: options.skipProcessed ?? true
    };
  }

  /**
   * Enable safe magic mode
   */
  enable(): void {
    if (this.enabled) {
      console.warn('Safe magic mode already enabled');
      return;
    }

    try {
      // Find target container
      const container = this.getContainer();
      if (!container) {
        throw new Error('Magic mode container not found');
      }

      // Process existing content
      void this.processContainer(container);

      // Set up observer for dynamic content
      this.setupObserver(container);

      this.enabled = true;
      console.log('Safe magic mode enabled', this.getStats());
    } catch (error) {
      console.error('Failed to enable safe magic mode:', error);
      throw error;
    }
  }

  /**
   * Disable safe magic mode
   */
  disable(): void {
    if (!this.enabled) return;

    // Clean up observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.enabled = false;
    console.log('Safe magic mode disabled');
  }

  /**
   * Check if magic mode is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Process a specific container
   */
  async processContainer(container: Element): Promise<void> {
    if (this.isTranslating) return;
    this.isTranslating = true;

    const startTime = performance.now();

    try {
      // Get all text nodes
      const textNodes = this.getTextNodes(container);

      // Apply safety limits
      const nodesToProcess = textNodes.slice(0, this.options.maxNodes);

      if (textNodes.length > this.options.maxNodes) {
        console.warn(`Magic mode: Limited to ${this.options.maxNodes} nodes (found ${textNodes.length})`);
        this.stats.nodesSkipped += textNodes.length - this.options.maxNodes;
      }

      // Process each node
      for (const node of nodesToProcess) {
        await this.processNode(node);
      }

      this.stats.lastUpdate = Date.now();

      if (this.config.monitoring?.enabled) {
        console.log(`Magic mode: Processed ${nodesToProcess.length} nodes in ${performance.now() - startTime}ms`);
      }
    } catch (error) {
      this.stats.errors++;
      console.error('Magic mode processing error:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getContainer(): Element | null {
    const selector = this.options.selector;
    const container = document.querySelector(selector);

    if (!container) {
      console.error(`Magic mode: Container not found with selector "${selector}"`);
      return null;
    }

    return container;
  }

  private setupObserver(container: Element): void {
    if (typeof window === 'undefined' || !window.MutationObserver) {
      console.warn('MutationObserver not supported, magic mode will not update dynamically');
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      if (this.isTranslating) return;

      const relevantMutations = mutations.filter(m => {
        const target = m.target as Element;
        if (target.hasAttribute?.('data-urdu-magic')) return false;
        if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return false;
        return m.type === 'childList' || m.type === 'characterData';
      });

      if (relevantMutations.length === 0) return;

      // Debounce rapid mutations
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.handleMutations(relevantMutations);
      }, this.options.debounce);
    });

    // Observe for changes
    this.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false // Don't observe attribute changes for performance
    });
  }

  private handleMutations(mutations: MutationRecord[]): void {
    const nodesToProcess: Node[] = [];

    for (const mutation of mutations) {
      // Handle added nodes
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1) { // Node.ELEMENT_NODE
            // Get text nodes from added element
            const textNodes = this.getTextNodes(node as Element);
            nodesToProcess.push(...textNodes);
          } else if (node.nodeType === 3) { // Node.TEXT_NODE
            nodesToProcess.push(node);
          }
        }
      }

      // Handle text changes
      if (mutation.type === 'characterData') {
        nodesToProcess.push(mutation.target);
      }
    }

    // Process new/changed nodes
    void this.processNodesAsync(nodesToProcess);
  }

  private async processNodesAsync(nodes: Node[]): Promise<void> {
    if (this.isTranslating || nodes.length === 0) return;
    this.isTranslating = true;

    try {
      // Process in batches to avoid blocking UI
      const batchSize = 10;
      for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);

        // Process batch
        await Promise.all(batch.map(node => this.processNode(node)));

        // Small delay to prevent blocking
        if (i + batchSize < nodes.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    } finally {
      this.isTranslating = false;
    }
  }

  private getTextNodes(container: Element): Node[] {
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip empty text nodes
          if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;

          // Skip if parent should be excluded
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          if (this.shouldExcludeElement(parent)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  private shouldExcludeElement(element: Element): boolean {
    // Check tag exclusions
    if (this.options.exclude.tags.includes(element.tagName.toLowerCase())) {
      return true;
    }

    // Check class exclusions
    for (const className of this.options.exclude.classes) {
      if (element.classList.contains(className)) {
        return true;
      }
    }

    // Check selector exclusions
    for (const selector of this.options.exclude.selectors) {
      try {
        if (element.matches(selector)) {
          return true;
        }
      } catch (error) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }

    // Check for data-no-translate attribute
    if (element.hasAttribute('data-no-translate')) {
      return true;
    }

    return false;
  }

  private async processNode(node: Node): Promise<void> {
    if (!node.textContent?.trim()) return;

    // Skip already processed nodes
    if (this.options.skipProcessed && this.processedNodes.has(node)) {
      this.stats.nodesSkipped++;
      return;
    }

    try {
      const originalText = node.textContent.trim();

      // Don't translate if it's just numbers, symbols, or already in target language
      if (this.shouldSkipText(originalText)) {
        this.stats.nodesSkipped++;
        return;
      }

      // Get current language
      const targetLang = this.instance.getCurrentLang() === 'en' ? 'ur' : 'en';

      // Translate text
      const translatedText = await this.instance.translate(originalText, targetLang);

      // Apply translation
      if (translatedText && translatedText !== originalText) {
        const parent = node.parentElement;
        if (parent) {
          // Create translated element
          const translatedElement = document.createElement('span');
          translatedElement.textContent = translatedText;
          translatedElement.setAttribute('data-urdu-magic', 'translated');
          translatedElement.setAttribute('data-original', originalText);

          // Replace or preserve original
          if (this.options.preserveOriginal) {
            // Hide original and show translated
            const originalElement = document.createElement('span');
            originalElement.textContent = originalText;
            originalElement.setAttribute('data-urdu-magic', 'original');
            originalElement.style.display = 'none';

            parent.insertBefore(translatedElement, node);
            parent.insertBefore(originalElement, node);
          } else {
            // Replace original
            parent.replaceChild(translatedElement, node);
          }

          this.stats.nodesProcessed++;
        }
      }

      // Mark as processed
      this.processedNodes.add(node);

    } catch (error) {
      this.stats.errors++;
      console.error('Failed to translate node:', error);
    }
  }

  private shouldSkipText(text: string): boolean {
    // Skip if it's just numbers
    if (/^\d+$/.test(text)) return true;

    // Skip if it's just symbols
    if (/^[^\w\s]+$/.test(text)) return true;

    // Skip if it's very short (likely not meaningful)
    if (text.length < 2) return true;

    // Skip if it looks like a code snippet
    if (/[{}();<>[\]]/.test(text)) return true;

    // Skip if it's already in Urdu script
    if (/[\u0600-\u06FF]/.test(text)) return true;

    return false;
  }
}

export { SafeMagicMode as default };
