import React from 'react';

const Separator = ({ className, orientation = 'horizontal', ...props }) => 
  React.createElement('div', { 
    className, 
    'data-orientation': orientation,
    ...props 
  });

export { Separator };