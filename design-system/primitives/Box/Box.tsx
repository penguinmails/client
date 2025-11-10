// Componente primitivo Box - contenedor base del design-system
// Proporciona layout y estilos fundamentales

import React from 'react';
import { cn } from '@/lib/utils';

// Propiedades del componente Box
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
  
  // Espaciado
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
  
  // Dimensiones
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  
  // Posicionamiento
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: string | number;
  
  // Bordes
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string | number;
  borderColor?: string;
  
  // Fondo
  backgroundColor?: string;
  background?: string;
  
  // Sombras
  boxShadow?: string;
  
  // Transiciones
  transition?: string;
  
  // Estados interactivos
  hover?: {
    backgroundColor?: string;
    color?: string;
    transform?: string;
    boxShadow?: string;
  };
  
  // Estados de focus
  focus?: {
    outline?: string;
    boxShadow?: string;
  };
  
  // Responsive
  sm?: Partial<BoxProps>;
  md?: Partial<BoxProps>;
  lg?: Partial<BoxProps>;
  xl?: Partial<BoxProps>;
  '2xl'?: Partial<BoxProps>;
}

// Generar clases de Tailwind dinámicamente
const generateTailwindClasses = (props: BoxProps): string => {
  const classes: string[] = [];
  
  // Layout
  if (props.display) classes.push(`display-${props.display}`);
  if (props.position) classes.push(`position-${props.position}`);
  if (props.overflow) classes.push(`overflow-${props.overflow}`);
  
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
  
  // Espaciado
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
  
  // Dimensiones
  if (props.width) classes.push(`w-[${props.width}]`);
  if (props.height) classes.push(`h-[${props.height}]`);
  if (props.minWidth) classes.push(`min-w-[${props.minWidth}]`);
  if (props.minHeight) classes.push(`min-h-[${props.minHeight}]`);
  if (props.maxWidth) classes.push(`max-w-[${props.maxWidth}]`);
  if (props.maxHeight) classes.push(`max-h-[${props.maxHeight}]`);
  
  // Posicionamiento
  if (props.top) classes.push(`top-[${props.top}]`);
  if (props.right) classes.push(`right-[${props.right}]`);
  if (props.bottom) classes.push(`bottom-[${props.bottom}]`);
  if (props.left) classes.push(`left-[${props.left}]`);
  if (props.zIndex) classes.push(`z-[${props.zIndex}]`);
  
  // Bordes
  if (props.border) classes.push(`border-[${props.border}]`);
  if (props.borderTop) classes.push(`border-t-[${props.borderTop}]`);
  if (props.borderRight) classes.push(`border-r-[${props.borderRight}]`);
  if (props.borderBottom) classes.push(`border-b-[${props.borderBottom}]`);
  if (props.borderLeft) classes.push(`border-l-[${props.borderLeft}]`);
  if (props.borderRadius) classes.push(`rounded-[${props.borderRadius}]`);
  if (props.borderColor) classes.push(`border-[${props.borderColor}]`);
  
  // Fondo
  if (props.backgroundColor) classes.push(`bg-[${props.backgroundColor}]`);
  if (props.background) classes.push(`bg-[${props.background}]`);
  
  // Sombras
  if (props.boxShadow) classes.push(`shadow-[${props.boxShadow}]`);
  
  // Transiciones
  if (props.transition) classes.push(`transition-[${props.transition}]`);
  
  return classes.join(' ');
};

// Generar estilos inline para propiedades no soportadas por Tailwind
const generateInlineStyles = (props: BoxProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Propiedades directas que no se pueden manejar con Tailwind
  if (props.width) styles.width = props.width as string;
  if (props.height) styles.height = props.height as string;
  
  return styles;
};

// Generar clases responsive
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

// Componente Box principal
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    className, 
    children, 
    style,
    hover,
    focus,
    ...props 
  }, ref) => {
    // Generar clases
    const boxClasses = cn(
      generateResponsiveClasses(props),
      className
    );
    
    // Generar estilos
    const boxStyles = {
      ...generateInlineStyles(props),
      ...style,
      
      // Estilos de hover simplificados
      ...(hover && {
        '&:hover': {
          backgroundColor: hover.backgroundColor,
          color: hover.color,
          transform: hover.transform,
          boxShadow: hover.boxShadow
        }
      })
    };
    
    return (
      <div
        ref={ref}
        className={boxClasses}
        style={boxStyles}
        {...(props as any)}
      >
        {children}
      </div>
    );
  }
);

Box.displayName = 'Box';

// Variantes predefinidas de Box
export const Container = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn(
          'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Container.displayName = 'Container';

export const Section = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn('py-12 sm:py-16 lg:py-20', className)}
        padding="4rem 0"
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Section.displayName = 'Section';

export default Box;
