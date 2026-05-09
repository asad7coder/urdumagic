/**
 * Next.js Config Plugin for UrduMagic
 */
module.exports = function withUrduMagic(nextConfig = {}) {
  return {
    ...nextConfig,
    
    // Auto-configure i18n
    i18n: {
      locales: nextConfig.locales || ['en', 'ur', 'roman'],
      defaultLocale: nextConfig.defaultLocale || 'en',
      ...nextConfig.i18n,
    },
    
    // Ensure package is transpiled
    transpilePackages: [
      'urdumagic',
      ...(nextConfig.transpilePackages || [])
    ],
    
    webpack(config, options) {
      // Split dictionary into separate chunk
      if (!options.isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization?.splitChunks,
            cacheGroups: {
              ...config.optimization?.splitChunks?.cacheGroups,
              urduDictionary: {
                test: /english-urdu-dictionary\.json/,
                name: 'urdu-dictionary',
                chunks: 'async', // Only load when needed
                priority: 10,
              },
            },
          },
        }
      }
      
      // Allow user to extend dictionary
      if (nextConfig.dictionaryPath) {
        config.resolve.alias['urdumagic/custom-dict'] = 
          nextConfig.dictionaryPath
      }
      
      // Call user's webpack config if exists
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }
      
      return config
    },
  }
}
