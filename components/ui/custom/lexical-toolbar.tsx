/**
 * Lexical Editor Toolbar
 * 
 * Toolbar component for Lexical editor
 */

import React from 'react';
import { Button } from '@/components/ui/button/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image as ImageIcon
} from 'lucide-react';

interface ToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onQuote?: () => void;
  onLink?: () => void;
  onImage?: () => void;
  className?: string;
}

export function LexicalToolbar({
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onNumberedList,
  onQuote,
  onLink,
  onImage,
  className = ""
}: ToolbarProps) {
  return (
    <div className={`flex items-center gap-1 p-2 border-b border-border ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBold}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onItalic}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onUnderline}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onBulletList}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNumberedList}
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onQuote}
        className="h-8 w-8 p-0"
      >
        <Quote className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onLink}
        className="h-8 w-8 p-0"
      >
        <Link className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onImage}
        className="h-8 w-8 p-0"
        aria-label="Insert image"
      >
        <ImageIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export default LexicalToolbar;