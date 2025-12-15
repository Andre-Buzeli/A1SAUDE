import { useEffect, useState } from 'react';

// Hook para gerenciar configurações de acessibilidade
export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    // Carregar preferências do localStorage
    const savedPrefs = localStorage.getItem('accessibility-prefs');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setHighContrast(prefs.highContrast || false);
      setLargeText(prefs.largeText || false);
      setReducedMotion(prefs.reducedMotion || false);
    }

    // Detectar se há screen reader ativo
    const detectScreenReader = () => {
      // Verificar se há foco em elementos invisíveis (técnica comum de screen readers)
      const testElement = document.createElement('div');
      testElement.setAttribute('aria-hidden', 'true');
      testElement.style.position = 'absolute';
      testElement.style.left = '-10000px';
      testElement.style.width = '1px';
      testElement.style.height = '1px';
      testElement.style.overflow = 'hidden';
      document.body.appendChild(testElement);

      testElement.focus();
      const hasFocus = document.activeElement === testElement;
      document.body.removeChild(testElement);

      setScreenReader(hasFocus);
    };

    detectScreenReader();

    // Verificar preferências do sistema
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Salvar preferências
  const savePreferences = () => {
    const prefs = {
      highContrast,
      largeText,
      reducedMotion
    };
    localStorage.setItem('accessibility-prefs', JSON.stringify(prefs));
  };

  // Aplicar classes CSS baseadas nas preferências
  useEffect(() => {
    const root = document.documentElement;

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [highContrast, largeText, reducedMotion]);

  // Animações respeitando preferências de movimento reduzido
  const animateProps = (baseProps: any) => {
    if (reducedMotion) {
      return {
        ...baseProps,
        transition: { duration: 0 },
        initial: false,
        animate: false
      };
    }
    return baseProps;
  };

  // Skip links para navegação por teclado
  const skipToContent = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  };

  // Gerenciamento de foco
  const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);
      return () => container.removeEventListener('keydown', handleTabKey);
    }, [containerRef]);
  };

  // Anúncios para screen readers
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return {
    // Estados
    highContrast,
    largeText,
    reducedMotion,
    screenReader,

    // Setters
    setHighContrast,
    setLargeText,
    setReducedMotion,

    // Utilitários
    savePreferences,
    animateProps,
    skipToContent,
    trapFocus,
    announceToScreenReader
  };
};

// Hook para gerenciamento de foco automático
export const useAutoFocus = (shouldFocus: boolean = true) => {
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      // Pequeno delay para garantir que o elemento está renderizado
      const timeoutId = setTimeout(() => {
        ref.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus]);

  return ref;
};

// Hook para detecção de navegação por teclado
export const useKeyboardNavigation = () => {
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardNav(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNav(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleMouseDown);
    };
  }, []);

  return isKeyboardNav;
};
