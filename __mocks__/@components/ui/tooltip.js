import React from 'react';

const Tooltip = ({ children, ...props }) => 
  React.createElement('div', props, children);

const TooltipContent = ({ children, className, ...props }) => 
  React.createElement('div', { className, ...props }, children);

const TooltipProvider = ({ children }) => 
  React.createElement('div', {}, children);

const TooltipTrigger = ({ children, ...props }) => 
  React.createElement('div', props, children);

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};