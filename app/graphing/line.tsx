import * as d3 from "d3";
import type { AnimationProps } from "framer-motion";
import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import invariant from "tiny-invariant";
import { useGraphContext } from "./graph";

export interface D3Scale<Input> {
  (num: Input): number;
  range: (range: [number, number]) => D3Scale<Input>;
  domain: () => any;
}

export type LineProps<Data, X, Y> = {
  data: Data[];
  x: (d: Data, i: number) => X;
  y: (d: Data, i: number) => Y;
  xScale: D3Scale<X>;
  yScale: D3Scale<Y>;
  enter?: "draw-from-left" | "draw-from-right";
} & Pick<
  ComponentProps<typeof motion.path>,
  "transition" | "stroke" | "strokeWidth"
>;

export function Line<Data, X, Y>({
  data,
  x,
  xScale,
  y,
  yScale,
  enter,
  stroke = "#38bdf8",
  strokeWidth = 1.5,
  ...rest
}: LineProps<Data, X, Y>) {
  const graph = useGraphContext("Scale");
  const scale = {
    x: xScale.range(graph.range.x),
    y: yScale.range(graph.range.y),
  };
  const line = d3.line<Data>(
    (d, i) => scale.x(x(d, i)),
    (d, i) => scale.y(y(d, i))
  );

  const getPath = (data: Data[]) => {
    const path = line(data);
    invariant(path);
    return path;
  };

  const getTransitions = (): Pick<AnimationProps, "initial" | "animate"> => {
    switch (enter) {
      case "draw-from-left":
        return {
          initial: {
            pathLength: 0,
          },
          animate: {
            pathLength: 1,
          },
        };

      case "draw-from-right":
        return {
          initial: {
            pathLength: 0,
            pathOffset: 2,
          },
          animate: {
            pathLength: 1,
            pathOffset: 2,
          },
        };

      default:
        return {};
    }
  };

  return (
    <motion.path
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d={getPath(data)}
      {...getTransitions()}
      {...rest}
    />
  );
}
