// ============================================================================
// SAFE MAGIC MODE UX
// Developer-safe usage with explicit confirmation
// ============================================================================

import UrduMagic from '../UrduMagic.js';
import type { UrduMagicConfig } from '../types.js';

/**
 * Safe Magic Mode Options
 */
export interface SafeMagicOptions {
  selector?: string;
  confirm?: boolean;
  warning?: boolean;
  skipClasses?: string[];
  preserveOriginal?: boolean;
}

/**
 * Magic Mode Confirmation Dialog
 */
class MagicModeDialog {
  private static instance: MagicModeDialog | null = null;

  static getInstance(): MagicModeDialog {
    if (!MagicModeDialog.instance) {
      MagicModeDialog.instance = new MagicModeDialog();
    }
    return MagicModeDialog.instance;
  }

  /**
   * Show confirmation dialog
   */
  showConfirmation(options: SafeMagicOptions): boolean {
    if (typeof window === 'undefined') return true; // Node.js environment

    const selector = options.selector || 'body';
    const isBody = selector === 'body';
    
    // Build message based on scope
    let message = '🪄 UrduMagic: Translate this page to Urdu?\n\n';
    
    if (isBody) {
      message += '⚠️  This will translate the ENTIRE PAGE.\n\n';
      message += '• All English text will become Urdu\n';
      message += '• Original text will be preserved\n';
      message += '• You can undo by refreshing the page\n\n';
      message += 'Are you sure you want to continue?';
    } else {
      message += `This will translate content in: "${selector}"\n\n`;
      message += '• English text will become Urdu\n';
      message += '• Original text will be preserved\n';
      message += '• You can undo by refreshing the page\n\n';
      message += 'Continue with translation?';
    }

    const result = window.confirm(message);
    
    if (result) {
      // Show success message
      this.showSuccessMessage(selector);
    }
    
    return result;
  }

  /**
   * Show warning for potentially unsafe usage
   */
  showWarning(options: SafeMagicOptions): boolean {
    if (typeof window === 'undefined') return true;

    const selector = options.selector || 'body';
    const warnings: string[] = [];

    // Check for potentially unsafe selectors
    if (selector === 'body' || selector === 'html') {
      warnings.push('⚠️  Translating entire page may affect navigation and forms');
    }

    if (selector.includes('script') || selector.includes('style')) {
      warnings.push('⚠️  Translating scripts/styles may break functionality');
    }

    if (selector.includes('input') || selector.includes('textarea')) {
      warnings.push('⚠️  Translating form inputs may affect user input');
    }

    if (warnings.length === 0) return true;

    const message = warnings.join('\n') + '\n\nContinue anyway?';
    return window.confirm(message);
  }

  /**
   * Show success message
   */
  private showSuccessMessage(selector: string): void {
    if (typeof window === 'undefined') return;

    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    
    const isBody = selector === 'body';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">✨</span>
        <div>
          <div style="font-weight: 600;">UrduMagic Active</div>
          <div style="font-size: 12px; opacity: 0.9;">
            ${isBody ? 'Entire page' : `"${selector}"`} is now in Urdu
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Show error message
   */
  showErrorMessage(error: string): void {
    if (typeof window === 'undefined') return;

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">❌</span>
        <div>
          <div style="font-weight: 600;">UrduMagic Error</div>
          <div style="font-size: 12px; opacity: 0.9;">${error}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

/**
 * Safe Magic Mode Controller
 */
export class SafeMagicMode {
  private static instance: UrduMagicInstance | null = null;
  private static dialog = MagicModeDialog.getInstance();

  /**
   * Enable magic mode with safety checks
   * 
   * @param options - Magic mode options
   * @returns Promise<boolean> - Success status
   * 
   * @example
   * ```typescript
   * // Safe usage with confirmation
   * const success = await SafeMagicMode.enable();
   * 
   * // Specific selector with confirmation
   * const success = await SafeMagicMode.enable({
   *   selector: '.content',
   *   confirm: true
   *   });
   * 
   * // Developer-confirmed (no confirmation dialog)
   * const success = await SafeMagicMode.enable({
   *   selector: '.content',
   *   confirm: false
   * });
   * ```
   */
  static async enable(options: SafeMagicOptions = {}): Promise<boolean> {
    try {
      // Default safety options
      const safeOptions: SafeMagicOptions = {
        selector: 'body',
        confirm: true,
        warning: true,
        skipClasses: ['no-translate', 'code', 'pre', 'script', 'style'],
        preserveOriginal: true,
        ...options
      };

      // Show confirmation if required
      if (safeOptions.confirm) {
        const confirmed = this.dialog.showConfirmation(safeOptions);
        if (!confirmed) return false;
      }

      // Show warning if needed
      if (safeOptions.warning) {
        const warned = this.dialog.showWarning(safeOptions);
        if (!warned) return false;
      }

      // Initialize UrduMagic with safe defaults
      this.instance = UrduMagic.init({
        defaultLang: 'en',
        modes: ['en', 'ur', 'roman'],
        magicMode: {
          enabled: true,
          selector: safeOptions.selector,
          skipTags: ['script', 'style', 'noscript', 'iframe'],
          skipClasses: safeOptions.skipClasses,
          attributes: ['title', 'alt', 'placeholder'],
          preserveOriginal: safeOptions.preserveOriginal,
          debounceMs: 500 // Conservative debounce
        },
        performance: {
          cacheTTL: 3600000,
          rateLimitMs: 200 // Conservative rate limiting
        }
      });

      // Enable magic mode
      this.instance.enableMagicMode();

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.dialog.showErrorMessage(errorMessage);
      return false;
    }
  }

  /**
   * Disable magic mode
   */
  static disable(): void {
    if (this.instance) {
      this.instance.disableMagicMode();
      this.instance.destroy();
      this.instance = null;
    }
  }

  /**
   * Check if magic mode is enabled
   */
  static isEnabled(): boolean {
    return this.instance?.isMagicModeEnabled() || false;
  }

  /**
   * Get current instance
   */
  static getInstance(): UrduMagicInstance | null {
    return this.instance;
  }

  /**
   * Quick enable for developer use (no confirmation)
   * 
   * @example
   * ```typescript
   * // Developer knows what they're doing
   * SafeMagicMode.quickEnable('.content');
   * ```
   */
  static async quickEnable(selector: string = '.content'): Promise<boolean> {
    return await this.enable({
      selector,
      confirm: false,
      warning: false
    });
  }

  /**
   * Enable with custom selector and confirmation
   * 
   * @example
   * ```typescript
   * // User-facing enable with confirmation
   * SafeMagicMode.enableWithConfirmation('#main-content');
   * ```
   */
  static async enableWithConfirmation(selector: string): Promise<boolean> {
    return await this.enable({
      selector,
      confirm: true,
      warning: true
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SafeMagicMode;
