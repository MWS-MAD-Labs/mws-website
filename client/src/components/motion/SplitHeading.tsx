import { motion, useReducedMotion } from 'motion/react';

type SplitHeadingProps = {
  text?: string;
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Heading whose words rise one by one from behind a mask when it scrolls into
 * view. Screen readers get the whole heading through aria-label.
 */
export default function SplitHeading({
  text = '',
  as: Tag = 'h2',
  id,
  className,
  delay = 0,
  stagger = 0.055,
}: SplitHeadingProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (reduceMotion || words.length === 0) {
    return (
      <Tag id={id} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className} aria-label={text}>
      <motion.span
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        aria-hidden="true"
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block whitespace-nowrap">
            <span className="inline-flex overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className="inline-block will-change-transform"
                variants={{
                  hidden: { y: '110%', rotate: 4, opacity: 0 },
                  visible: { y: '0%', rotate: 0, opacity: 1 },
                }}
                transition={{
                  duration: 0.85,
                  delay: delay + index * stagger,
                  ease: EASE,
                }}
              >
                {word}
              </motion.span>
            </span>
            {index < words.length - 1 ? '\u00A0' : null}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
