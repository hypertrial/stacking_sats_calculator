import { useState, useEffect } from 'react';

interface ResponsiveState {
  isSmallMobile: boolean;
  isTinyMobile: boolean;
}

export function useResponsive(): ResponsiveState {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isSmallMobile: false,
    isTinyMobile: false,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setResponsiveState({
        isSmallMobile: width <= 768,
        isTinyMobile: width <= 480,
      });
    };

    // Check initial size
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return responsiveState;
}
