import React from 'react';

const Badge = ({ children, className, variant = 'default', ...props }) => 
  React.createElement('span', { 
    className, 
    'data-variant': variant,
    ...props 
  }, children);

export { Badge };