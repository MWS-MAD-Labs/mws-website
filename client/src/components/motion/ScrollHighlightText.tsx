import { Fragment, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';

type ScrollHighlightTextProps = {
  text: string;
  className?: string;
  /** Opacity of words that have not been reached yet. */
  dim?: number;
};

type WordProps = {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  dim: number;
};

function Word({ children, progress, range, dim }: WordProps) {
  const opacity = useTransform(progress, range, [dim, 1]);

  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/**
 * Paragraph whose words brighten one by one as it is scrolled through: it
 * starts when the top reaches 90% of the viewport and finishes when the
 * bottom reaches 60%.
 */
export default function ScrollHighlightText({
  text,
  className,
  dim = 0.22,
}: ScrollHighlightTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.6'] });
  const words = text.split(/\s+/).filter(Boolean);

  if (reduceMotion || words.length === 0) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <Word
            progress={scrollYProgress}
            range={[index / words.length, (index + 1) / words.length]}
            dim={dim}
          >
            {word}
          </Word>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </p>
  );
}
