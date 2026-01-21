# Bundle Analysis Guide

This guide explains how to analyze and optimize the application bundle size and composition.

## Running Bundle Analysis

### Next.js Bundle Analyzer

```bash
# Install the analyzer
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts:
# "analyze": "ANALYZE=true next build"
# "bundle-report": "npx @next/bundle-analyzer"

# Run analysis
npm run build
npm run analyze
```

### Webpack Bundle Analyzer

```bash
# For detailed webpack analysis
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

## Key Metrics to Monitor

### Bundle Size Metrics

- **Total Bundle Size**: Overall application size
- **First Load JS**: Critical JavaScript for initial page load
- **Route Chunks**: Individual page bundle sizes
- **Shared Chunks**: Common code across routes

### Code Quality Metrics

- **Tree-shaking Effectiveness**: Percentage of unused code eliminated
- **Code Duplication**: Duplicate code across chunks
- **Circular Dependencies**: Dependency cycles that prevent optimization

## Analysis Workflow

### 1. Generate Bundle Report

```bash
npm run build
# If analyze script is configured:
npm run analyze
# Or use npx directly:
npx @next/bundle-analyzer
```

### 2. Identify Large Chunks

Look for:

- Chunks > 100 KB
- Unexpected dependencies in chunks
- Duplicate code across chunks

### 3. Analyze Dependencies

```bash
# Check what's in a specific chunk
npx webpack-bundle-analyzer .next/static/chunks/[chunk-id].js
```

### 4. Identify Optimization Opportunities

- Large third-party libraries
- Unused exports in barrel files
- Components that could be code-split
- Duplicate utility functions

## Common Optimization Strategies

### Code Splitting

```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});

// Route-based splitting (automatic with Next.js pages)
// Component-based splitting for conditionally rendered components
```

### Tree Shaking Optimization

```typescript
// Instead of barrel imports
import { Button, Card, Input } from "@/components/ui";

// Use direct imports
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Duplicate Code Elimination

```typescript
// Consolidate similar components
// Move shared utilities to single location
// Use consistent import patterns
```

## Bundle Size Budgets

### Recommended Limits

- **Initial Bundle**: < 200 KB (gzipped)
- **Route Chunks**: < 100 KB each
- **Third-party Libraries**: < 500 KB total
- **Total Bundle**: < 6 MB

### Monitoring Thresholds

- **Warning**: 80% of budget used
- **Error**: Budget exceeded
- **Critical**: 150% of budget exceeded

## Automated Monitoring

### CI/CD Integration

```yaml
# Example GitHub Action for bundle monitoring
- name: Bundle Analysis
  run: |
    npm run build
    # Install and run bundle analyzer
    npm install --save-dev @next/bundle-analyzer
    npx @next/bundle-analyzer
    # Compare with previous build
    # Fail if budget exceeded
```

### Performance Budgets in Next.js

```javascript
// next.config.js
module.exports = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  // Bundle size limits
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};
```

## Troubleshooting Common Issues

### Large Bundle Size

1. **Check third-party dependencies**: Use `npm ls` to identify large packages
2. **Analyze import patterns**: Look for unnecessary imports
3. **Review dynamic imports**: Ensure proper code splitting
4. **Check for polyfills**: Remove unnecessary polyfills

### Poor Tree Shaking

1. **Review barrel exports**: Large index files prevent tree shaking
2. **Check side effects**: Ensure packages are marked as side-effect free
3. **Analyze import statements**: Use specific imports instead of namespace imports
4. **Review webpack configuration**: Ensure proper tree shaking settings

### Code Duplication

1. **Consolidate similar components**: Merge duplicate implementations
2. **Extract shared utilities**: Move common code to shared locations
3. **Review copy-paste patterns**: Identify and refactor duplicated code
4. **Use consistent patterns**: Establish and follow import conventions

## Best Practices

### Development

- Run bundle analysis regularly during development
- Monitor bundle size in pull requests
- Use dynamic imports for large, conditional components
- Prefer specific imports over barrel imports

### Maintenance

- Set up automated bundle monitoring
- Regular bundle audits (monthly/quarterly)
- Keep dependencies updated
- Monitor third-party library sizes

### Documentation

- Document bundle optimization decisions
- Track bundle size changes over time
- Maintain performance budgets
- Share optimization learnings with team
