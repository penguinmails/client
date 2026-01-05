/**
 * Lexical Link Click Handler
 * 
 * Handles link clicks in Lexical editor
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface LinkClickHandlerProps {
  onLinkClick?: (url: string) => void;
}

export function LexicalLinkClickHandler({ onLinkClick }: LinkClickHandlerProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'A' && target.getAttribute('href')) {
        const href = target.getAttribute('href');
        if (href && onLinkClick) {
          event.preventDefault();
          onLinkClick(href);
        }
      }
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
      return () => {
        editorElement.removeEventListener('click', handleClick);
      };
    }
  }, [editor, onLinkClick]);

  return null;
}

export default LexicalLinkClickHandler;