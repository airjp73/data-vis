import { useGraphContext } from "./graph";
import type { D3Scale } from "./line";

export type AxisProps = {
  side: "top" | "right" | "bottom" | "left" | "horizontal-at-zero";
  tickSpacing: number;
  scale: D3Scale<any>;
};

export const Axis = ({ side, tickSpacing, scale }: AxisProps) => {
  const context = useGraphContext("Axis");
  const [min, max] = scale.domain();
  const ticks: number[] = [];
  for (let i = min; i <= max; i += tickSpacing) {
    ticks.push(i);
  }

  const horizontal = side === "top" || side === "bottom";

  const getTickLineProps = (tick: number) => {
    switch (side) {
      case "bottom":
        return {
          x1: scale(tick),
          x2: scale(tick),
          y1: context.range.y[0],
          y2: context.range.y[0] + 6,
        };
      case "top":
        return {
          x1: scale(tick),
          x2: scale(tick),
          y1: context.range.y[0],
          y2: context.range.y[0] - 6,
        };
      case "left":
        return {
          x1: context.range.x[0],
          x2: context.range.x[0] - 6,
          y1: scale(tick),
          y2: scale(tick),
        };
      case "right":
        return {
          x1: context.range.x[0],
          x2: context.range.x[0] + 6,
          y1: scale(tick),
          y2: scale(tick),
        };
    }
  };

  const getTickTextProps = (tick: number) => {
    switch (side) {
      case "bottom":
        return {
          x: scale(tick),
          y: context.range.y[0] + 13,
          textAnchor: "middle",
          dominantBaseline: "middle",
        };
      case "top":
        return {
          x: scale(tick),
          y: context.range.y[0] - 13,
          textAnchor: "middle",
          dominantBaseline: "middle",
        };
      case "left":
        return {
          x: context.range.x[0] - 8,
          y: scale(tick),
          textAnchor: "end",
          dominantBaseline: "middle",
        };
      case "right":
        return {
          x: context.range.x[0] + 8,
          y: scale(tick),
          textAnchor: "start",
          dominantBaseline: "middle",
        };
    }
  };

  return (
    <g>
      <line
        y1={context.range.y[0]}
        y2={context.range.y[horizontal ? 0 : 1]}
        x1={context.range.x[0]}
        x2={context.range.x[horizontal ? 1 : 0]}
        stroke="black"
      />
      {ticks.map((tick) => (
        <g key={tick}>
          <line stroke="black" {...getTickLineProps(tick)} />
          <text {...getTickTextProps(tick)} fontSize={10}>
            {Math.round(tick * 100) / 100}
          </text>
        </g>
      ))}
    </g>
  );
};
