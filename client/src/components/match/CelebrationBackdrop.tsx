import {
  CELEBRATION_SHAPES,
  type CelebrationShape,
  type FillColor,
  type RingColor,
} from "./celebrationShapes";

const bubbleClass: Record<FillColor, string> = {
  yellow: "bg-brand-yellow",
  blue: "bg-brand-blue",
  cream: "bg-surface",
  teal: "bg-canvas",
  orange: "bg-brand-orange",
};

const sparkleFillClass: Record<FillColor, string> = {
  yellow: "fill-brand-yellow",
  blue: "fill-brand-blue",
  cream: "fill-surface",
  teal: "fill-canvas",
  orange: "fill-brand-orange",
};

const ringStrokeClass: Record<RingColor, string> = {
  yellow: "stroke-brand-yellow",
  blue: "stroke-brand-blue",
  cream: "stroke-surface",
  teal: "stroke-canvas",
  orange: "stroke-brand-orange",
  pink: "stroke-brand-pink",
};

const SPARKLE_PATH =
  "M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z";

interface ShapeProps {
  shape: CelebrationShape;
}

function Shape({ shape }: ShapeProps) {
  const style = {
    left: `${shape.left}%`,
    top: `${shape.top}%`,
    width: shape.size,
    height: shape.size,
  };

  switch (shape.kind) {
    case "bubble":
      return (
        <span
          className={`absolute rounded-full border-3 border-ink shadow-brutal-sm ${bubbleClass[shape.color]}`}
          style={style}
        />
      );

    case "ring":
      return (
        <svg
          className="absolute drop-shadow-[3px_3px_0_var(--color-ink)]"
          style={style}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            strokeWidth="22"
            className="stroke-ink"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            strokeWidth="14"
            className={ringStrokeClass[shape.color]}
          />
        </svg>
      );

    case "sparkle":
      return (
        <svg
          className="absolute drop-shadow-[2px_2px_0_var(--color-ink)]"
          style={style}
          viewBox="-6 -6 112 112"
        >
          <path
            d={SPARKLE_PATH}
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={`stroke-ink ${sparkleFillClass[shape.color]}`}
          />
        </svg>
      );
  }
}

function CelebrationBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {CELEBRATION_SHAPES.map((shape, index) => (
        <Shape key={index} shape={shape} />
      ))}
    </div>
  );
}

export default CelebrationBackdrop;