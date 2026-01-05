import React from 'react';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card"
      className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card-header"
      className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card-title"
      className={`leading-none font-semibold ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardDescription = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card-description"
      className={`text-muted-foreground text-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card-content"
      className={`px-6 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card-footer"
      className={`flex items-center px-6 [.border-t]:pt-6 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardAction = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="card-action"
      className={`col-start-2 row-span-2 row-start-1 self-start justify-self-end ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
};