"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  visible: boolean;
}

export function LoadingScreen({ visible }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(visible);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount overlay when loading starts
      setMounted(true);
      setHiding(false);
      document.body.style.overflow = "hidden";
      return;
    }

    if (!mounted) return;

    setHiding(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = "";
    }, 500);

    return () => window.clearTimeout(timer);
  }, [visible, mounted]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`loading-screen${hiding ? " loading-screen-hide" : ""}`}
      aria-hidden={hiding}
    >
      <Image
        src="/assets/pokeball-icon.png"
        alt=""
        width={60}
        height={60}
        className="loading-ball"
        priority
      />
    </div>
  );
}
