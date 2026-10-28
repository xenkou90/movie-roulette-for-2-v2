import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

function RouteFocus() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (document.activeElement !== document.body) return;

    const target =
      document.querySelector<HTMLElement>("main h1") ??
      document.querySelector<HTMLElement>("main");

    if (target === null) return;

    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }

    target.focus();
  }, [pathname]);

  return null;
}

export default RouteFocus;
