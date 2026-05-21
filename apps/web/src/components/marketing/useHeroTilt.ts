"use client";

import { useCallback, useRef } from "react";

export function useHeroTilt(maxDeg = 5) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const section = sectionRef.current;
      const card = cardRef.current;
      if (!section || !card) return;
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxDeg;
      const rotateY = ((x - centerX) / centerX) * maxDeg;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    [maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }, []);

  return { sectionRef, cardRef, onMouseMove, onMouseLeave };
}
