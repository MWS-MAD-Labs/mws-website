declare module "aos" {
  type AosOptions = {
    debounceDelay?: number;
    delay?: number;
    disable?: boolean | string | (() => boolean);
    duration?: number;
    easing?: string;
    mirror?: boolean;
    offset?: number;
    once?: boolean;
    startEvent?: string;
    throttleDelay?: number;
  };

  const AOS: {
    init(options?: AosOptions): void;
    refresh(): void;
    refreshHard(): void;
  };

  export default AOS;
}
