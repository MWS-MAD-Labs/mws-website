import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

type ParallaxProps = {
  children: ReactNode;
  /** Sizing and positioning for the frame; it must be `relative` or `absolute`. */
  className?: string;
  /** Pixels the content drifts each way while the frame crosses the viewport. */
  distance?: number;
};

/**
 * Frame whose content drifts slower than the page as it scrolls past. The
 * content is `distance` taller at both ends, so the drift never shows a gap.
 * Put an `h-full w-full object-cover` image inside.
 */
export default function Parallax({ children, className = '', distance = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.0005,
  });
  const y = useTransform(smoothProgress, [0, 1], [-distance, distance]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-x-0 will-change-transform"
        style={reduceMotion ? { top: 0, bottom: 0 } : { top: -distance, bottom: -distance, y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
