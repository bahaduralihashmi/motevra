"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type CategoryItem = {
  name: string;
  href: string;
  description: string;
  image: string;
  image2?: string;
};

export function CategoryShuffleGrid({ items }: { items: CategoryItem[] }) {
  const [order, setOrder] = useState(items.map((_, index) => index));
  const cardRefs = useRef<Record<number, HTMLAnchorElement | null>>({});
  const firstRects = useRef<Map<number, DOMRect> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timerRef.current = setInterval(() => {
      const first = new Map<number, DOMRect>();
      order.forEach((index) => {
        const node = cardRefs.current[index];
        if (node) first.set(index, node.getBoundingClientRect());
      });
      firstRects.current = first;

      setOrder((current) => {
        const next = [...current];
        const a = Math.floor(Math.random() * next.length);
        let b = Math.floor(Math.random() * next.length);
        while (b === a && next.length > 1) {
          b = Math.floor(Math.random() * next.length);
        }
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, order]);

  useLayoutEffect(() => {
    const first = firstRects.current;
    if (!first) return;

    const frame = requestAnimationFrame(() => {
      order.forEach((index) => {
        const node = cardRefs.current[index];
        const previous = first.get(index);
        if (!node || !previous) return;

        const current = node.getBoundingClientRect();
        const dx = previous.left - current.left;
        const dy = previous.top - current.top;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

        node.animate(
          [
            { transform: `translate3d(${dx}px, ${dy}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: 1400,
            easing: "cubic-bezier(.2,.7,.2,1)",
            fill: "none",
          },
        );
      });
      firstRects.current = null;
    });

    return () => cancelAnimationFrame(frame);
  }, [order]);

  return (
    <div className="category-grid category-shuffle-grid">
      {order.map((index) => {
        const category = items[index];
        return (
          <Link
            key={category.href}
            href={category.href}
            className="category-card"
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            <Image
              className="category-image category-image-primary"
              src={category.image}
              alt={`${category.name} for cars and automotive shopping at MOTEVRA`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
            />
            {category.image2 && (
              <Image
                className="category-image category-image-secondary"
                src={category.image2}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                aria-hidden="true"
              />
            )}
            <span className="category-overlay" />
            <span className="category-mark">M</span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="arrow">Explore →</span>
          </Link>
        );
      })}
    </div>
  );
}
