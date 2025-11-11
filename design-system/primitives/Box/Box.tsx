/* eslint-disable @typescript-eslint/no-unused-vars */
// Primitive Box component - base container of the design system
// Provides fundamental layout and styling

import React from 'react';
import { cn } from '@/lib/utils';

// Box component props
export interface BoxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  // Layout
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  overflow?: 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto';
  
  // Flexbox
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string | number;
  
  // Spacing
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  
  // Dimensions
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  
  // Positioning
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: string | number;
  
  // Borders
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string | number;
  borderColor?: string;
  
  // Background
  backgroundColor?: string;
  background?: string;
  
  // Shadows
  boxShadow?: string;
  
  // Transitions
  transition?: string;
  
  // Note: Interactive states (hover, focus) cannot be handled with inline styles in React.
  // Use Tailwind variant classes in className
  // Example: className="hover:bg-blue-100 focus:ring-2"
  
  // Responsive
  sm?: Partial<BoxProps>;
  md?: Partial<BoxProps>;
  lg?: Partial<BoxProps>;
  xl?: Partial<BoxProps>;
  '2xl'?: Partial<BoxProps>;
}

// Generate Tailwind classes dynamically
const generateTailwindClasses = (props: BoxProps): string => {
  const classes: string[] = [];
  
  // Layout
  if (props.display) classes.push(props.display);
  if (props.position) classes.push(props.position);
  if (props.overflow) classes.push(props.overflow);
  
  // Flexbox
  if (props.display?.includes('flex')) {
    if (props.direction) classes.push(`flex-${props.direction}`);
    if (props.justify) {
      const justifyMap: Record<string, string> = {
        'flex-start': 'justify-start',
        'center': 'justify-center',
        'flex-end': 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly'
      };
      classes.push(justifyMap[props.justify] || props.justify);
    }
    if (props.align) {
      const alignMap: Record<string, string> = {
        'flex-start': 'items-start',
        'center': 'items-center',
        'flex-end': 'items-end',
        'stretch': 'items-stretch',
        'baseline': 'items-baseline'
      };
      classes.push(alignMap[props.align] || props.align);
    }
    if (props.wrap) classes.push(`flex-${props.wrap}`);
    if (props.gap) classes.push(`gap-[${props.gap}]`);
  }
  
  // Spacing
  if (props.padding) classes.push(`p-[${props.padding}]`);
  if (props.paddingTop) classes.push(`pt-[${props.paddingTop}]`);
  if (props.paddingRight) classes.push(`pr-[${props.paddingRight}]`);
  if (props.paddingBottom) classes.push(`pb-[${props.paddingBottom}]`);
  if (props.paddingLeft) classes.push(`pl-[${props.paddingLeft}]`);
  
  if (props.margin) classes.push(`m-[${props.margin}]`);
  if (props.marginTop) classes.push(`mt-[${props.marginTop}]`);
  if (props.marginRight) classes.push(`mr-[${props.marginRight}]`);
  if (props.marginBottom) classes.push(`mb-[${props.marginBottom}]`);
  if (props.marginLeft) classes.push(`ml-[${props.marginLeft}]`);
  
  // Dimensions
  if (props.width) classes.push(`w-[${props.width}]`);
  if (props.height) classes.push(`h-[${props.height}]`);
  if (props.minWidth) classes.push(`min-w-[${props.minWidth}]`);
  if (props.minHeight) classes.push(`min-h-[${props.minHeight}]`);
  if (props.maxWidth) classes.push(`max-w-[${props.maxWidth}]`);
  if (props.maxHeight) classes.push(`max-h-[${props.maxHeight}]`);
  
  // Positioning
  if (props.top) classes.push(`top-[${props.top}]`);
  if (props.right) classes.push(`right-[${props.right}]`);
  if (props.bottom) classes.push(`bottom-[${props.bottom}]`);
  if (props.left) classes.push(`left-[${props.left}]`);
  if (props.zIndex) classes.push(`z-[${props.zIndex}]`);
  
  // Borders
  if (props.border) classes.push(`border-[${props.border}]`);
  if (props.borderTop) classes.push(`border-t-[${props.borderTop}]`);
  if (props.borderRight) classes.push(`border-r-[${props.borderRight}]`);
  if (props.borderBottom) classes.push(`border-b-[${props.borderBottom}]`);
  if (props.borderLeft) classes.push(`border-l-[${props.borderLeft}]`);
  if (props.borderRadius) classes.push(`rounded-[${props.borderRadius}]`);
  if (props.borderColor) classes.push(`border-[${props.borderColor}]`);
  
  // Background
  if (props.backgroundColor) classes.push(`bg-[${props.backgroundColor}]`);
  if (props.background) classes.push(`bg-[${props.background}]`);
  
  // Shadows
  if (props.boxShadow) classes.push(`shadow-[${props.boxShadow}]`);
  
  // Transitions
  if (props.transition) classes.push(`transition-[${props.transition}]`);
  
  return classes.join(' ');
};

// Generate inline styles for properties not supported by Tailwind
const generateInlineStyles = (props: BoxProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Direct properties that cannot be handled by Tailwind
  if (props.width) styles.width = props.width as string;
  if (props.height) styles.height = props.height as string;
  
  return styles;
};

// Extract styling props for class generation
const extractStylingProps = (props: BoxProps): Partial<BoxProps> => {
  const {
    // Extract styling props
    display, position, overflow, direction, justify, align, wrap, gap,
    padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
    margin, marginTop, marginRight, marginBottom, marginLeft,
    width, height, minWidth, minHeight, maxWidth, maxHeight,
    top, right, bottom, left, zIndex,
    border, borderTop, borderRight, borderBottom, borderLeft,
    borderRadius, borderColor, backgroundColor, background,
    boxShadow, transition, sm, md, lg, xl,
    // Responsive 2xl
    ['2xl']: responsive2xl,
    // System props to exclude
    className, style, children,
    // HTML attributes (everything else)
    ...htmlAttributes
  } = props;
  
  // Build styling props object with proper typing
  const stylingProps: Partial<BoxProps> = {
    display, position, overflow, direction, justify, align, wrap, gap,
    padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
    margin, marginTop, marginRight, marginBottom, marginLeft,
    width, height, minWidth, minHeight, maxWidth, maxHeight,
    top, right, bottom, left, zIndex,
    border, borderTop, borderRight, borderBottom, borderLeft,
    borderRadius, borderColor, backgroundColor, background,
    boxShadow, transition, sm, md, lg, xl
  };
  
  // Add 2xl responsive property if it exists
  if (responsive2xl) {
    stylingProps['2xl'] = responsive2xl;
  }
  
  // Filter out undefined values with proper typing
  (Object.keys(stylingProps) as Array<keyof typeof stylingProps>).forEach(key => {
    if (stylingProps[key] === undefined) {
      delete (stylingProps as any)[key];
    }
  });
  
  return stylingProps;
};

// Extract valid HTML attributes from BoxProps to avoid spreading invalid props
const extractHTMLAttributes = (props: BoxProps): React.HTMLAttributes<HTMLDivElement> => {
  const {
    // Exclude all Box-specific styling props and system props
    display, position, overflow, direction, justify, align, wrap, gap,
    padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
    margin, marginTop, marginRight, marginBottom, marginLeft,
    width, height, minWidth, minHeight, maxWidth, maxHeight,
    top, right, bottom, left, zIndex,
    border, borderTop, borderRight, borderBottom, borderLeft,
    borderRadius, borderColor, backgroundColor, background,
    boxShadow, transition, sm, md, lg, xl,
    // Use bracket notation for '2xl'
    ['2xl']: responsive2xl,
    className, style, children,
    // Only HTML attributes remain
    ...htmlAttributes
  } = props;
  
  return htmlAttributes;
};

// Generate responsive classes
const generateResponsiveClasses = (props: BoxProps): string => {
  const baseClasses = generateTailwindClasses(props);
  const responsiveClasses: string[] = [baseClasses];
  
  const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
  
  breakpoints.forEach(bp => {
    const bpProps = props[bp];
    if (bpProps) {
      const bpClasses = generateTailwindClasses(bpProps as BoxProps);
      if (bpClasses) {
        responsiveClasses.push(`${bp}:${bpClasses}`);
      }
    }
  });
  
  return responsiveClasses.filter(Boolean).join(' ');
};

// Main Box component
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({
    className,
    children,
    style,
    ...props
  }, ref) => {
    // Extract styling props and HTML attributes separately
    const stylingProps = extractStylingProps(props);
    const htmlAttributes = extractHTMLAttributes(props);
    
    // Generate classes using only styling props
    const boxClasses = cn(
      generateResponsiveClasses(stylingProps),
      className
    );
    
    // Generate styles using only styling props
    const boxStyles = {
      ...generateInlineStyles(stylingProps),
      ...style,
    };
    
    return (
      <div
        ref={ref}
        className={boxClasses}
        style={boxStyles}
        {...htmlAttributes}
      >
        {children}
      </div>
    );
  }
);

Box.displayName = 'Box';

// Predefined Box variants
export const Container = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, children, ...props }, ref) => {
    // Extract HTML attributes to avoid spreading invalid props
    const htmlAttributes = extractHTMLAttributes(props);
    
    return (
      <Box
        ref={ref}
        className={cn(
          'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
          className
        )}
        {...htmlAttributes}
      >
        {children}
      </Box>
    );
  }
);

Container.displayName = 'Container';

export const Section = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, children, ...props }, ref) => {
    // Extract HTML attributes to avoid spreading invalid props
    const htmlAttributes = extractHTMLAttributes(props);
    
    return (
      <Box
        ref={ref}
        className={cn('py-12 sm:py-16 lg:py-20', className)}
        padding="4rem 0"
        {...htmlAttributes}
      >
        {children}
      </Box>
    );
  }
);

Section.displayName = 'Section';

export default Box;
