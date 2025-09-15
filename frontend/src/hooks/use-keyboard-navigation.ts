import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (direction: 'forward' | 'backward') => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEnter,
  onEscape,
  onTab,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  enabled = true
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't interfere with form inputs or textareas
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      
      case 'Tab':
        if (onTab) {
          event.preventDefault();
          onTab(event.shiftKey ? 'backward' : 'forward');
        }
        break;
      
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
    }
  }, [enabled, onEnter, onEscape, onTab, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// Hook for form-specific keyboard navigation
export function useFormKeyboardNavigation(form: any) {
  const handleFormKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    
    // Only handle keyboard events in form elements
    if (!target.closest('form')) return;

    switch (event.key) {
      case 'Enter':
        // If it's a textarea, allow default behavior
        if (target.tagName === 'TEXTAREA') return;
        
        // For other inputs, prevent default and submit form
        event.preventDefault();
        const formElement = target.closest('form');
        if (formElement) {
          const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
        break;
      
      case 'Escape':
        // Clear current field
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          (target as HTMLInputElement).value = '';
          form.setValue((target as HTMLInputElement).name, '');
        }
        break;
    }
  }, [form]);

  useEffect(() => {
    document.addEventListener('keydown', handleFormKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleFormKeyDown);
    };
  }, [handleFormKeyDown]);
}
