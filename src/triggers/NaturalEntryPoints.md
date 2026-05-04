# UrduMagic Natural Entry Points

## 🎯 POST-ACTION HINTS AFTER TRANSLATE()

### **Contextual Hints After Translation**
```typescript
class PostActionHints {
  private static instance: PostActionHints;
  private hintHistory: Map<string, HintHistory>;
  private usageTracker: UsageTracker;
  private conditionChecker: ConditionChecker;
  
  static getInstance(): PostActionHints {
    if (!PostActionHints.instance) {
      PostActionHints.instance = new PostActionHints();
    }
    return PostActionHints.instance;
  }
  
  constructor() {
    this.hintHistory = new Map();
    this.usageTracker = new UsageTracker();
    this.conditionChecker = new ConditionChecker();
  }
  
  // Called after each translate() operation
  async showPostActionHint(result: TranslationResult, context: TranslationContext): Promise<void> {
    // Only show hints in debug mode
    if (!this.isDebugMode()) return;
    
    // Check cooldown to avoid spam
    if (this.isInCooldown('post_action')) return;
    
    // Determine relevant hint based on context
    const hint = this.selectRelevantHint(result, context);
    if (!hint) return;
    
    // Display hint in console
    this.displayHint(hint);
    
    // Update hint history
    this.updateHintHistory('post_action', hint);
  }
  
  private selectRelevantHint(result: TranslationResult, context: TranslationContext): PostActionHint | null {
    const hints: PostActionHint[] = [];
    
    // Performance hint for slow translations
    if (result.duration > 100) {
      hints.push({
        type: 'performance',
        title: 'Slow translation detected',
        message: 'This translation took longer than expected. Enable caching for faster responses.',
        code: 'UrduMagic.init({ cache: true })',
        condition: 'slow_translation',
        priority: 'medium'
      });
    }
    
    // Multiple translations hint
    if (this.usageTracker.getRecentTranslations(60).length > 10) {
      hints.push({
        type: 'batch',
        title: 'Multiple translations detected',
        message: 'You\'re doing many translations. Consider batch processing for better performance.',
        code: 'const results = await UrduMagic.batch(texts);',
        condition: 'multiple_translations',
        priority: 'high'
      });
    }
    
    // Error handling hint
    if (result.confidence < 0.7) {
      hints.push({
        type: 'reliability',
        title: 'Low confidence translation',
        message: 'This translation has low confidence. Consider using safe translation methods.',
        code: 'const result = await UrduMagic.safeTranslate(text);',
        condition: 'low_confidence',
        priority: 'high'
      });
    }
    
    // Magic mode hint for page content
    if (context.isPageContent && !this.usesMagicMode()) {
      hints.push({
        type: 'feature',
        title: 'Page content detected',
        message: 'Translating page content? Magic mode can automate this for you.',
        code: 'UrduMagic.magic("#content-area");',
        condition: 'page_content_no_magic',
        priority: 'medium'
      });
    }
    
    // Live typing hint for input fields
    if (context.isInputField && !this.usesLiveTyping()) {
      hints.push({
        type: 'feature',
        title: 'Input field detected',
        message: 'Add live typing for real-time Urdu conversion.',
        code: 'UrduMagic.liveTyping("#input-field");',
        condition: 'input_field_no_live_typing',
        priority: 'medium'
      });
    }
    
    // Select highest priority hint
    return hints.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))[0] || null;
  }
  
  private displayHint(hint: PostActionHint): void {
    console.log(`💡 UrduMagic Tip: ${hint.title}`);
    console.log(`${hint.message}`);
    console.log(`💻 ${hint.code}`);
    console.log(`🔍 Type UrduMagic.getTips() for more suggestions`);
  }
}

// Integration with translate() method
class UrduMagicTranslator {
  private postActionHints: PostActionHints;
  
  constructor() {
    this.postActionHints = PostActionHints.getInstance();
  }
  
  async translate(text: string, options?: TranslationOptions): Promise<TranslationResult> {
    const startTime = Date.now();
    
    try {
      // Perform translation
      const result = await this.performTranslation(text, options);
      
      // Calculate duration
      result.duration = Date.now() - startTime;
      
      // Create context
      const context = this.createTranslationContext(text, options);
      
      // Show post-action hint
      await this.postActionHints.showPostActionHint(result, context);
      
      return result;
      
    } catch (error) {
      // Show error handling hint
      if (this.isDebugMode()) {
        console.log(`💡 UrduMagic Tip: Translation failed. Use safe translation for better error handling.`);
        console.log(`💻 const result = await UrduMagic.safeTranslate(text);`);
      }
      
      throw error;
    }
  }
}

// Example console output:
// 💡 UrduMagic Tip: Slow translation detected
// This translation took longer than expected. Enable caching for faster responses.
// 💻 UrduMagic.init({ cache: true })
// 🔍 Type UrduMagic.getTips() for more suggestions
```

---

## 🌟 FIRST-TIME USAGE HINT SYSTEM

### **Onboarding Hints for New Developers**
```typescript
class FirstTimeHints {
  private static instance: FirstTimeHints;
  private usageCount: number = 0;
  private hasShownHints: Map<string, boolean> = new Map();
  
  static getInstance(): FirstTimeHints {
    if (!FirstTimeHints.instance) {
      FirstTimeHints.instance = new FirstTimeHints();
    }
    return FirstTimeHints.instance;
  }
  
  // Called on first translation
  showFirstTranslationHint(): void {
    if (!this.isDebugMode()) return;
    if (this.hasShownHints.get('first_translation')) return;
    
    console.log(`🎉 Welcome to UrduMagic! Your first translation is complete.`);
    console.log(`💡 Pro tip: Enable caching for faster translations`);
    console.log(`💻 UrduMagic.init({ cache: true })`);
    console.log(`🔍 Type UrduMagic.getTips() for more suggestions`);
    
    this.hasShownHints.set('first_translation', true);
  }
  
  // Called on 5th translation
  showFrequentUsageHint(): void {
    this.usageCount++;
    if (this.usageCount !== 5) return;
    if (!this.isDebugMode()) return;
    if (this.hasShownHints.get('frequent_usage')) return;
    
    console.log(`🚀 Great! You've used UrduMagic 5 times.`);
    console.log(`💡 Consider batch processing for multiple translations`);
    console.log(`💻 const results = await UrduMagic.batch(texts);`);
    console.log(`🔍 Type UrduMagic.insights() to see usage stats`);
    
    this.hasShownHints.set('frequent_usage', true);
  }
  
  // Called on first error
  showFirstErrorHint(error: Error): void {
    if (!this.isDebugMode()) return;
    if (this.hasShownHints.get('first_error')) return;
    
    console.log(`⚠️ Translation failed. Here's how to handle errors gracefully:`);
    console.log(`💡 Use safe translation for automatic fallback`);
    console.log(`💻 const result = await UrduMagic.safeTranslate(text);`);
    console.log(`🔍 Type UrduMagic.getTips() for error handling tips`);
    
    this.hasShownHints.set('first_error', true);
  }
  
  // Called when Magic mode is first used
  showFirstMagicModeHint(): void {
    if (!this.isDebugMode()) return;
    if (this.hasShownHints.get('first_magic_mode')) return;
    
    console.log(`✨ Magic mode activated! Translating page content automatically.`);
    console.log(`💡 Limit Magic mode to specific areas for better performance`);
    console.log(`💻 UrduMagic.magic("#content-area");`);
    console.log(`🔍 Type UrduMagic.devtools.open() for optimization tools`);
    
    this.hasShownHints.set('first_magic_mode', true);
  }
  
  // Called when first batch operation is detected
  showFirstBatchHint(): void {
    if (!this.isDebugMode()) return;
    if (this.hasShownHints.get('first_batch')) return;
    
    console.log(`📦 Batch processing detected! Smart move for performance.`);
    console.log(`💡 Add progress tracking for better UX`);
    console.log(`💻 UrduMagic.batch(texts, { progress: true });`);
    console.log(`🔍 Type UrduMagic.getTips() for batch optimization tips`);
    
    this.hasShownHints.set('first_batch', true);
  }
}

// Integration with main UrduMagic class
class UrduMagicMain {
  private firstTimeHints: FirstTimeHints;
  private translationCount: number = 0;
  
  constructor() {
    this.firstTimeHints = FirstTimeHints.getInstance();
  }
  
  async translate(text: string): Promise<string> {
    this.translationCount++;
    
    try {
      const result = await this.performTranslation(text);
      
      // Show first-time hints
      if (this.translationCount === 1) {
        this.firstTimeHints.showFirstTranslationHint();
      } else if (this.translationCount === 5) {
        this.firstTimeHints.showFrequentUsageHint();
      }
      
      return result;
      
    } catch (error) {
      // Show error hint on first error
      if (this.translationCount === 1) {
        this.firstTimeHints.showFirstErrorHint(error);
      }
      
      throw error;
    }
  }
  
  magic(selector: string): void {
    this.performMagicMode(selector);
    
    // Show first Magic mode hint
    this.firstTimeHints.showFirstMagicModeHint();
  }
  
  async batch(texts: string[]): Promise<string[]> {
    const results = await this.performBatch(texts);
    
    // Show first batch hint
    this.firstTimeHints.showFirstBatchHint();
    
    return results;
  }
}
```

---

## ⚡ DEVTOOLS SHORTCUT

### **Easy Access to Development Tools**
```typescript
class DevToolsShortcut {
  private static instance: DevToolsShortcut;
  private shortcutRegistered: boolean = false;
  
  static getInstance(): DevToolsShortcut {
    if (!DevToolsShortcut.instance) {
      DevToolsShortcut.instance = new DevToolsShortcut();
    }
    return DevToolsShortcut.instance;
  }
  
  // Register global shortcut for easy access
  registerShortcut(): void {
    if (this.shortcutRegistered) return;
    if (!this.isDebugMode()) return;
    
    // Register UrduMagic global shortcut
    if (typeof window !== 'undefined') {
      (window as any).UrduMagicAssistant = {
        insights: () => UrduMagic.insights(),
        tips: () => UrduMagic.getTips(),
        fix: (type: string) => UrduMagic.fix(type),
        devtools: () => UrduMagic.devtools.open(),
        help: () => this.showHelp()
      };
      
      // Show shortcut registration hint
      console.log(`🔧 UrduMagic Assistant shortcuts available:`);
      console.log(`💻 UrduMagicAssistant.insights() - Show performance insights`);
      console.log(`💻 UrduMagicAssistant.tips() - Get optimization tips`);
      console.log(`💻 UrduMagicAssistant.fix('cache') - Apply quick fixes`);
      console.log(`💻 UrduMagicAssistant.devtools() - Open dev tools`);
      console.log(`💻 UrduMagicAssistant.help() - Show all commands`);
      
      this.shortcutRegistered = true;
    }
  }
  
  private showHelp(): void {
    console.log(`🛠️ UrduMagic Assistant Commands:`);
    console.log(``);
    console.log(`📊 Insights:`);
    console.log(`  UrduMagicAssistant.insights()     - Show performance and usage insights`);
    console.log(`  UrduMagic.insights()             - Same as above`);
    console.log(``);
    console.log(`💡 Tips:`);
    console.log(`  UrduMagicAssistant.tips()        - Get optimization suggestions`);
    console.log(`  UrduMagic.getTips()               - Same as above`);
    console.log(``);
    console.log(`🔧 Quick Fixes:`);
    console.log(`  UrduMagicAssistant.fix('cache')   - Enable caching`);
    console.log(`  UrduMagicAssistant.fix('performance') - Optimize performance`);
    console.log(`  UrduMagicAssistant.fix('magic-mode') - Optimize Magic mode`);
    console.log(`  UrduMagic.fix(type)               - Same as above`);
    console.log(``);
    console.log(`🛠️ Dev Tools:`);
    console.log(`  UrduMagicAssistant.devtools()     - Open development tools`);
    console.log(`  UrduMagic.devtools.open()         - Same as above`);
    console.log(``);
    console.log(`🆘 Help:`);
    console.log(`  UrduMagicAssistant.help()         - Show this help message`);
  }
}

// Auto-register shortcuts when UrduMagic loads with debug mode
class UrduMagicInitializer {
  private devToolsShortcut: DevToolsShortcut;
  
  constructor(options: UrduMagicOptions) {
    this.devToolsShortcut = DevToolsShortcut.getInstance();
    
    if (options.debug) {
      // Register shortcuts after initialization
      setTimeout(() => {
        this.devToolsShortcut.registerShortcut();
      }, 1000);
    }
  }
}

// Usage examples in console:
// UrduMagicAssistant.insights()
// UrduMagicAssistant.tips()
// UrduMagicAssistant.fix('cache')
// UrduMagicAssistant.devtools()
// UrduMagicAssistant.help()
```

---

## 📈 INLINE PERFORMANCE SUGGESTIONS

### **Real-time Performance Optimization Hints**
```typescript
class InlinePerformanceSuggestions {
  private static instance: InlinePerformanceSuggestions;
  private performanceMonitor: PerformanceMonitor;
  private suggestionCooldown: Map<string, number> = new Map();
  
  static getInstance(): InlinePerformanceSuggestions {
    if (!InlinePerformanceSuggestions.instance) {
      InlinePerformanceSuggestions.instance = new InlinePerformanceSuggestions();
    }
    return InlinePerformanceSuggestions.instance;
  }
  
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }
  
  // Check performance after each operation
  checkPerformance(operation: string, metrics: PerformanceMetrics): void {
    if (!this.isDebugMode()) return;
    
    // Check for performance issues
    const suggestions = this.analyzePerformance(operation, metrics);
    
    // Show relevant suggestions
    suggestions.forEach(suggestion => {
      if (this.shouldShowSuggestion(suggestion)) {
        this.showPerformanceSuggestion(suggestion);
        this.updateCooldown(suggestion.type);
      }
    });
  }
  
  private analyzePerformance(operation: string, metrics: PerformanceMetrics): PerformanceSuggestion[] {
    const suggestions: PerformanceSuggestion[] = [];
    
    // Slow operation suggestion
    if (metrics.duration > 200) {
      suggestions.push({
        type: 'slow_operation',
        title: 'Slow operation detected',
        message: `This ${operation} took ${metrics.duration}ms. Consider optimization.`,
        code: this.getOptimizationCode(operation),
        impact: `Could reduce to ${Math.round(metrics.duration * 0.5)}ms`,
        priority: 'high'
      });
    }
    
    // Memory usage suggestion
    if (metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB
      suggestions.push({
        type: 'high_memory',
        title: 'High memory usage',
        message: `Using ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB memory. Consider cleanup.`,
        code: 'UrduMagic.cleanup(); // Clear cache and free memory',
        impact: `Could reduce to ${(metrics.memoryUsage * 0.3 / 1024 / 1024).toFixed(1)}MB`,
        priority: 'medium'
      });
    }
    
    // Low cache hit rate
    if (operation === 'translate' && metrics.cacheHitRate < 0.3) {
      suggestions.push({
        type: 'low_cache_hit',
        title: 'Low cache hit rate',
        message: `Cache hit rate is ${(metrics.cacheHitRate * 100).toFixed(1)}%. Enable better caching.`,
        code: 'UrduMagic.init({ cache: { strategy: "aggressive" } });',
        impact: 'Could improve to 80%+ hit rate',
        priority: 'high'
      });
    }
    
    // API rate limiting
    if (metrics.apiCallsPerMinute > 100) {
      suggestions.push({
        type: 'high_api_usage',
        title: 'High API usage',
        message: `${metrics.apiCallsPerMinute} API calls per minute. Consider batching.`,
        code: 'const results = await UrduMagic.batch(texts);',
        impact: 'Could reduce to 20 calls per minute',
        priority: 'high'
      });
    }
    
    return suggestions;
  }
  
  private getOptimizationCode(operation: string): string {
    const optimizations = {
      'translate': 'UrduMagic.init({ cache: true }); // Enable caching',
      'magic': 'UrduMagic.magic("#specific-area"); // Limit scope',
      'batch': 'UrduMagic.batch(texts, { parallel: false }); // Reduce parallelism',
      'default': 'UrduMagic.init({ performance: "optimized" }); // General optimization'
    };
    
    return optimizations[operation] || optimizations.default;
  }
  
  private shouldShowSuggestion(suggestion: PerformanceSuggestion): boolean {
    const cooldown = this.suggestionCooldown.get(suggestion.type) || 0;
    const now = Date.now();
    
    // Respect cooldown to avoid spam
    if (now - cooldown < 5 * 60 * 1000) { // 5 minutes cooldown
      return false;
    }
    
    // Only show high priority suggestions frequently
    if (suggestion.priority === 'high') {
      return true;
    }
    
    // Show medium priority suggestions less frequently
    if (suggestion.priority === 'medium') {
      return Math.random() < 0.3; // 30% chance
    }
    
    return false;
  }
  
  private showPerformanceSuggestion(suggestion: PerformanceSuggestion): void {
    console.log(`⚡ UrduMagic Performance: ${suggestion.title}`);
    console.log(`${suggestion.message}`);
    console.log(`💡 Expected improvement: ${suggestion.impact}`);
    console.log(`💻 ${suggestion.code}`);
    console.log(`🔍 Type UrduMagic.fix('performance') for auto-optimization`);
  }
  
  private updateCooldown(type: string): void {
    this.suggestionCooldown.set(type, Date.now());
  }
}

// Integration with performance monitoring
class UrduMagicPerformance {
  private inlineSuggestions: InlinePerformanceSuggestions;
  
  constructor() {
    this.inlineSuggestions = InlinePerformanceSuggestions.getInstance();
  }
  
  async translate(text: string): Promise<string> {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = await this.performTranslation(text);
      
      // Calculate performance metrics
      const metrics = {
        duration: Date.now() - startTime,
        memoryUsage: this.getMemoryUsage() - startMemory,
        cacheHitRate: this.getCacheHitRate(),
        apiCallsPerMinute: this.getApiCallsPerMinute()
      };
      
      // Check for performance suggestions
      this.inlineSuggestions.checkPerformance('translate', metrics);
      
      return result;
      
    } catch (error) {
      throw error;
    }
  }
}

// Example console output:
// ⚡ UrduMagic Performance: Slow operation detected
// This translate took 250ms. Consider optimization.
// 💡 Expected improvement: Could reduce to 125ms
// 💻 UrduMagic.init({ cache: true }); // Enable caching
// 🔍 Type UrduMagic.fix('performance') for auto-optimization
```

---

## 🐛 DEBUG-ONLY ASSISTANT MESSAGES

### **Helpful Messages Only in Debug Mode**
```typescript
class DebugAssistantMessages {
  private static instance: DebugAssistantMessages;
  private messageHistory: Map<string, number> = new Map();
  
  static getInstance(): DebugAssistantMessages {
    if (!DebugAssistantMessages.instance) {
      DebugAssistantMessages.instance = new DebugAssistantMessages();
    }
    return DebugAssistantMessages.instance;
  }
  
  // Show helpful debug messages
  showDebugMessage(type: string, message: string, action?: string): void {
    if (!this.isDebugMode()) return;
    
    // Check cooldown to avoid spam
    if (this.isInCooldown(type)) return;
    
    // Show message with helpful formatting
    console.log(`🔍 UrduMagic Debug: ${message}`);
    if (action) {
      console.log(`💡 ${action}`);
    }
    
    this.updateMessageHistory(type);
  }
  
  // Configuration optimization hint
  showConfigurationHint(config: UrduMagicConfig): void {
    if (!this.isDebugMode()) return;
    
    const suggestions = this.analyzeConfiguration(config);
    
    if (suggestions.length > 0) {
      console.log(`⚙️ UrduMagic Configuration Optimization:`);
      suggestions.forEach(suggestion => {
        console.log(`💡 ${suggestion}`);
      });
      console.log(`🔧 Type UrduMagic.fix('performance') to apply optimizations`);
    }
  }
  
  // Feature discovery hint
  showFeatureDiscoveryHint(feature: string, description: string): void {
    if (!this.isDebugMode()) return;
    if (this.messageHistory.has(feature)) return;
    
    console.log(`✨ UrduMagic Feature: ${feature}`);
    console.log(`${description}`);
    console.log(`🔍 Type UrduMagic.getTips() to discover more features`);
    
    this.messageHistory.set(feature, Date.now());
  }
  
  // Best practice reminder
  showBestPracticeReminder(practice: string, code: string): void {
    if (!this.isDebugMode()) return;
    if (this.isInCooldown('best_practice')) return;
    
    console.log(`💡 UrduMagic Best Practice: ${practice}`);
    console.log(`💻 ${code}`);
    console.log(`🔍 Type UrduMagic.getTips() for more best practices`);
    
    this.updateMessageHistory('best_practice');
  }
  
  // Learning opportunity hint
  showLearningOpportunity(topic: string, description: string, resource?: string): void {
    if (!this.isDebugMode()) return;
    if (this.isInCooldown('learning')) return;
    
    console.log(`📚 UrduMagic Learning: ${topic}`);
    console.log(`${description}`);
    if (resource) {
      console.log(`🔗 Learn more: ${resource}`);
    }
    console.log(`🔍 Type UrduMagic.getTips() for more learning resources`);
    
    this.updateMessageHistory('learning');
  }
  
  private analyzeConfiguration(config: UrduMagicConfig): string[] {
    const suggestions: string[] = [];
    
    if (!config.cache) {
      suggestions.push('Enable caching for better performance: UrduMagic.init({ cache: true })');
    }
    
    if (!config.errorHandling) {
      suggestions.push('Add error handling for reliability: UrduMagic.init({ errorHandling: true })');
    }
    
    if (config.performance === 'basic') {
      suggestions.push('Upgrade to performance mode: UrduMagic.init({ performance: "optimized" })');
    }
    
    return suggestions;
  }
  
  private isInCooldown(type: string): boolean {
    const lastShown = this.messageHistory.get(type) || 0;
    const cooldown = this.getCooldownDuration(type);
    
    return Date.now() - lastShown < cooldown;
  }
  
  private getCooldownDuration(type: string): number {
    const cooldowns = {
      'configuration': 10 * 60 * 1000, // 10 minutes
      'feature_discovery': 30 * 60 * 1000, // 30 minutes
      'best_practice': 15 * 60 * 1000, // 15 minutes
      'learning': 60 * 60 * 1000, // 1 hour
      'default': 5 * 60 * 1000 // 5 minutes
    };
    
    return cooldowns[type] || cooldowns.default;
  }
}

// Integration with main UrduMagic class
class UrduMagicDebug {
  private debugMessages: DebugAssistantMessages;
  
  constructor(options: UrduMagicOptions) {
    this.debugMessages = DebugAssistantMessages.getInstance();
    
    if (options.debug) {
      this.showWelcomeMessage();
    }
  }
  
  private showWelcomeMessage(): void {
    console.log(`🔧 UrduMagic Debug Mode Enabled`);
    console.log(`💡 You'll see helpful hints and suggestions as you work`);
    console.log(`🔍 Type UrduMagicAssistant.help() for available commands`);
    console.log(`🛠️ Type UrduMagic.devtools.open() for development tools`);
  }
  
  // Show configuration hints on init
  onInit(config: UrduMagicConfig): void {
    this.debugMessages.showConfigurationHint(config);
  }
  
  // Show feature discovery hints
  onFeatureUsed(feature: string, description: string): void {
    this.debugMessages.showFeatureDiscoveryHint(feature, description);
  }
  
  // Show best practice reminders
  onOperationComplete(operation: string): void {
    const practices = {
      'translate': 'Use safe translation for error handling',
      'batch': 'Add progress tracking for better UX',
      'magic': 'Limit Magic mode to specific areas'
    };
    
    if (practices[operation]) {
      this.debugMessages.showBestPracticeReminder(
        practices[operation],
        this.getBestPracticeCode(operation)
      );
    }
  }
  
  private getBestPracticeCode(operation: string): string {
    const codes = {
      'translate': 'const result = await UrduMagic.safeTranslate(text);',
      'batch': 'UrduMagic.batch(texts, { progress: true });',
      'magic': 'UrduMagic.magic("#specific-area");'
    };
    
    return codes[operation] || '';
  }
}

// Example debug messages:
// 🔧 UrduMagic Debug Mode Enabled
// 💡 You'll see helpful hints and suggestions as you work
// 🔍 Type UrduMagicAssistant.help() for available commands
// 🛠️ Type UrduMagic.devtools.open() for development tools

// ⚙️ UrduMagic Configuration Optimization:
// 💡 Enable caching for better performance: UrduMagic.init({ cache: true })
// 🔧 Type UrduMagic.fix('performance') to apply optimizations

// ✨ UrduMagic Feature: Live Typing
// Enable real-time Roman Urdu to Urdu conversion as users type
// 🔍 Type UrduMagic.getTips() to discover more features

// 💡 UrduMagic Best Practice: Use safe translation for error handling
// 💻 const result = await UrduMagic.safeTranslate(text);
// 🔍 Type UrduMagic.getTips() for more best practices
```

---

## 🎯 ENTRY POINT RULES & CONDITIONS

### **When Hints Appear**
```typescript
class HintRules {
  private static instance: HintRules;
  
  static getInstance(): HintRules {
    if (!HintRules.instance) {
      HintRules.instance = new HintRules();
    }
    return HintRules.instance;
  }
  
  // Rules for post-action hints
  shouldShowPostActionHint(context: TranslationContext): boolean {
    return this.isDebugMode() &&
           !this.isInCooldown('post_action') &&
           this.hasRelevantCondition(context);
  }
  
  // Rules for first-time hints
  shouldShowFirstTimeHint(type: string): boolean {
    return this.isDebugMode() &&
           !this.hasSeenHint(type) &&
           this.meetsCondition(type);
  }
  
  // Rules for performance suggestions
  shouldShowPerformanceSuggestion(metrics: PerformanceMetrics): boolean {
    return this.isDebugMode() &&
           !this.isInCooldown('performance') &&
           this.hasPerformanceIssue(metrics);
  }
  
  // Rules for debug messages
  shouldShowDebugMessage(type: string): boolean {
    return this.isDebugMode() &&
           !this.isInCooldown(type) &&
           this.isRelevantContext(type);
  }
  
  // Anti-spam rules
  private isInCooldown(type: string): boolean {
    const cooldowns = {
      'post_action': 2 * 60 * 1000, // 2 minutes
      'first_time': 24 * 60 * 60 * 1000, // 24 hours
      'performance': 5 * 60 * 1000, // 5 minutes
      'debug_message': 10 * 60 * 1000, // 10 minutes
      'feature_discovery': 30 * 60 * 1000 // 30 minutes
    };
    
    const lastShown = this.getLastShownTime(type);
    const cooldown = cooldowns[type] || 5 * 60 * 1000;
    
    return Date.now() - lastShown < cooldown;
  }
  
  // Relevance conditions
  private hasRelevantCondition(context: TranslationContext): boolean {
    const conditions = [
      context.duration > 100, // Slow translation
      context.confidence < 0.7, // Low confidence
      context.isPageContent && !context.usesMagicMode, // Page content without Magic mode
      context.isInputField && !context.usesLiveTyping, // Input field without live typing
      this.getRecentTranslationCount() > 10 // Multiple translations
    ];
    
    return conditions.some(condition => condition);
  }
  
  private hasPerformanceIssue(metrics: PerformanceMetrics): boolean {
    const issues = [
      metrics.duration > 200, // Slow operation
      metrics.memoryUsage > 10 * 1024 * 1024, // High memory usage
      metrics.cacheHitRate < 0.3, // Low cache hit rate
      metrics.apiCallsPerMinute > 100 // High API usage
    ];
    
    return issues.some(issue => issue);
  }
}
```

### **Summary of Natural Entry Points**
1. **Post-Action Hints**: Contextual suggestions after translate() calls
2. **First-Time Hints**: Onboarding messages for new developers
3. **DevTools Shortcut**: Global UrduMagicAssistant object for easy access
4. **Performance Suggestions**: Real-time optimization hints
5. **Debug Messages**: Helpful messages only in debug mode

### **Anti-Spam Rules**
- **Cooldown Periods**: Different cooldowns for different hint types
- **Debug Mode Only**: All hints only show in debug mode
- **Relevance Filtering**: Only show hints when relevant to current context
- **Frequency Limits**: Limit how often same hint type appears
- **Priority System**: Show most important hints first

This natural entry point system provides helpful, contextual assistance without being annoying, creating a smooth developer experience that feels like a helpful assistant rather than intrusive notifications.
