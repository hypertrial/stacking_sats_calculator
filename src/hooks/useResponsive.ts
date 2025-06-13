import { useState, useEffect } from 'react';

interface ResponsiveState {
  isTinyMobile: boolean;
  isSmallMobile: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktopSmall: boolean;
  isDesktopMedium: boolean;
  isDesktopLarge: boolean;
  screenWidth: number;
}

export function useResponsive(): ResponsiveState {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isTinyMobile: false,
    isSmallMobile: false,
    isMobile: false,
    isTablet: false,
    isDesktopSmall: false,
    isDesktopMedium: false,
    isDesktopLarge: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setResponsiveState({
        isTinyMobile: width <= 480,
        isSmallMobile: width <= 768 && width > 480,
        isMobile: width <= 768,
        isTablet: width <= 968 && width > 768,
        isDesktopSmall: width <= 1200 && width > 968,
        isDesktopMedium: width <= 1400 && width > 1200,
        isDesktopLarge: width > 1400,
        screenWidth: width,
      });
    };

    // Check initial size
    checkScreenSize();

    // Add event listener with throttling for better performance
    let timeoutId: number;
    const throttledCheckScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener('resize', throttledCheckScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledCheckScreenSize);
      clearTimeout(timeoutId);
    };
  }, []);

  return responsiveState;
}
