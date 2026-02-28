import { useEffect, useState } from "react";

// Same as tailwind.config.ts
export enum Breakpoints {
  sm = 375,
  md = 600,
  lg = 992,
  xl = 1440,
  "2xl" = 1536,
}

const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoints>(Breakpoints.xl);

  const handleResize = () => {
    const width = window.innerWidth;
    if (width < Breakpoints.sm) {
      setBreakpoint(Breakpoints.sm);
    } else if (width < Breakpoints.md) {
      setBreakpoint(Breakpoints.md);
    } else if (width < Breakpoints.lg) {
      setBreakpoint(Breakpoints.lg);
    } else if (width < Breakpoints.xl) {
      setBreakpoint(Breakpoints.xl);
    } else {
      setBreakpoint(Breakpoints["2xl"]);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isDesktop = breakpoint >= Breakpoints.lg;
  const isTablet = !isDesktop && breakpoint >= Breakpoints.md;
  const isMobile = breakpoint < Breakpoints.md;

  return { breakpoint, isDesktop, isTablet, isMobile };
};

export default useResponsive;
