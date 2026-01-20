import React from 'react';

const Progress = ({ value, className, ...props }) => 
  React.createElement('div', { 
    className, 
    'data-value': value,
    ...props 
  }, React.createElement('div', { style: { width: `${value}%` } }));

export { Progress };