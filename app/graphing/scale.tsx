import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";
import { useGraphContext } from "./graph";
import * as d3 from "d3";
import invariant from "tiny-invariant";

export type ScaleDef = {
  type: "linear" | "log";
  domain: [number, number];
};
export type ScaleProps = PropsWithChildren<{
  x: AnySupportedD3Scale;
  y: AnySupportedD3Scale;
}>;

export const extent = (arr: number[]) => {
  const res = d3.extent(arr);
  invariant(res[0] && res[1]);
  return res;
};

export type ScaleContextType = {
  x: (num: number) => number;
  y: (num: number) => number;
};

const ScaleContext = createContext<null | ScaleContextType>(null);
export const useScaleContext = (compName: string) => {
  const context = useContext(ScaleContext);
  invariant(context, `${compName} must be used within a Scale`);
  return context;
};

interface AnySupportedD3Scale {
  (num: number): number;
  range: (range: [number, number]) => AnySupportedD3Scale;
}

export const Scale = ({ x, y, children }: ScaleProps) => {
  const graph = useGraphContext("Scale");

  const value: ScaleContextType = useMemo(
    () => ({
      x: x.range([
        graph.dimensions.padding.left,
        graph.dimensions.width - graph.dimensions.padding.right,
      ]),
      y: y.range([
        graph.dimensions.height - graph.dimensions.padding.bottom,
        graph.dimensions.padding.top,
      ]),
    }),
    [
      graph.dimensions.height,
      graph.dimensions.padding.bottom,
      graph.dimensions.padding.left,
      graph.dimensions.padding.right,
      graph.dimensions.padding.top,
      graph.dimensions.width,
      x,
      y,
    ]
  );

  return (
    <ScaleContext.Provider value={value}>{children}</ScaleContext.Provider>
  );
};
