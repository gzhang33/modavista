import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
}

interface UseFormAutofillProps {
  form: UseFormReturn<FormData>;
  enabled?: boolean;
}

export function useFormAutofill({ form, enabled = true }: UseFormAutofillProps) {
  useEffect(() => {
    if (!enabled) return;

    // Check if browser supports autofill
    const supportsAutofill = 'autofill' in document.createElement('input');
    if (!supportsAutofill) return;

    // Try to detect autofilled values
    const detectAutofill = () => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      
      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement;
        const name = htmlInput.name || htmlInput.getAttribute('data-testid') || '';
        
        // Check if input has been autofilled (common indicators)
        const isAutofilled = htmlInput.matches(':-webkit-autofill') || 
                           htmlInput.value !== '' && !htmlInput.matches(':focus');
        
        if (isAutofilled && htmlInput.value) {
          // Map input names to form fields
          if (name.includes('first') || name.includes('firstName')) {
            form.setValue('firstName', htmlInput.value, { shouldValidate: true });
          } else if (name.includes('last') || name.includes('lastName')) {
            form.setValue('lastName', htmlInput.value, { shouldValidate: true });
          } else if (name.includes('email')) {
            form.setValue('email', htmlInput.value, { shouldValidate: true });
          } else if (name.includes('company')) {
            form.setValue('company', htmlInput.value, { shouldValidate: true });
          }
        }
      });
    };

    // Run detection after a short delay to allow autofill to complete
    const timeoutId = setTimeout(detectAutofill, 100);
    
    // Also listen for animation events that indicate autofill
    const handleAnimationStart = (e: AnimationEvent) => {
      if (e.animationName === 'onAutoFillStart') {
        detectAutofill();
      }
    };

    document.addEventListener('animationstart', handleAnimationStart);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('animationstart', handleAnimationStart);
    };
  }, [form, enabled]);
}

// CSS for detecting autofill (should be added to global styles)
export const autofillDetectionCSS = `
  @keyframes onAutoFillStart {
    from { /**/ }
    to { /**/ }
  }
  
  input:-webkit-autofill {
    animation-name: onAutoFillStart;
    animation-duration: 0.001s;
  }
`;
