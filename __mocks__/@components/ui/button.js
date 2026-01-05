import React from 'react';

const Button = React.forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'default', 
  asChild = false, 
  disabled = false, 
  onClick, 
  className,
  ...props 
}, ref) => {
  const Comp = asChild ? 'span' : 'button';
  return React.createElement(Comp, {
    ref,
    className,
    disabled,
    onClick,
    'data-variant': variant,
    'data-size': size,
    ...props
  }, children);
});
Button.displayName = 'Button';

export { Button };