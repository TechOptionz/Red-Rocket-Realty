"use client";
import { useEffect, useState } from "react";
import { LOGOS, getLogo, setLogo as persistLogo, type Logo } from "@/data/rr-data";

/** Client-preview logo picker: the chosen mark is stored in localStorage and applied site-wide. */
export function useLogo() {
  const [logo, setLogoState] = useState<Logo>(LOGOS[0]);
  useEffect(() => {
    const sync = () => setLogoState(getLogo());
    sync();
    window.addEventListener("rr-logo-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rr-logo-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { logo, logos: LOGOS, setLogo: persistLogo };
}
