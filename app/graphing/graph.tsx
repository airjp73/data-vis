import type { ComponentProps, PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useRef } from "react";
import { useRect } from "./useRect";
import invariant from "tiny-invariant";
import { motion } from "framer-motion";

export type GraphContextType = {
  dimensions: {
    width: number;
    height: number;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  range: { x: [number, number]; y: [number, number] };
};

const GraphContext = createContext<null | GraphContextType>(null);
export const useGraphContext = (compName: string) => {
  const context = useContext(GraphContext);
  invariant(context, `${compName} must be used within a Graph`);
  return context;
};

export type GraphProps = PropsWithChildren<{
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}> &
  Omit<ComponentProps<typeof motion.div>, "children">;
export const Graph = ({ padding, children, ...rest }: GraphProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const rect = useRect(ref);

  const { width = 100, height = 200 } = rect ?? {};
  const { top = 16, right = 16, bottom = 16, left = 16 } = padding ?? {};

  const value: GraphContextType = useMemo(
    () => ({
      dimensions: {
        width,
        height,
        padding: { top, right, bottom, left },
      },
      range: { x: [left, width - right], y: [height - bottom, top] },
    }),
    [bottom, height, left, right, top, width]
  );

  return (
    <motion.div {...rest}>
      <GraphContext.Provider value={value}>
        <svg ref={ref} style={{ width: "100%" }}>
          {!!rect && children}
        </svg>
      </GraphContext.Provider>
    </motion.div>
  );
};
