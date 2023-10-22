import * as d3 from "d3";
import type { MotionValue, SpringOptions } from "framer-motion";
import { useTransform, motion, useSpring, useIsPresent } from "framer-motion";
import type { ComponentProps, PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import invariant from "tiny-invariant";

type DonutDimensions = {
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
  cornerRadius: number;
};
type DonutTransitionTargets = {
  enterAngle?: number;
};
type DonutContextType = DonutDimensions &
  Partial<DonutTransitionTargets> & {
    svgRef: React.RefObject<SVGSVGElement>;
  };

const DonutContext = createContext<null | DonutContextType>(null);
export const useDonutContext = (compName: string) => {
  const context = useContext(DonutContext);
  invariant(context, `${compName} must be used within a Donut`);
  return context;
};

export type DonutProps = PropsWithChildren<Partial<DonutContextType>> & {
  width?: number;
  height?: number;
};

export const Donut = ({
  cornerRadius = 4,
  innerRadius = 20,
  outerRadius = 80,
  padAngle = 0.05,
  enterAngle,
  children,
  width = 300,
  height = 300,
}: DonutProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const value = useMemo<DonutContextType>(
    () => ({
      cornerRadius,
      innerRadius,
      outerRadius,
      padAngle,
      enterAngle,
      svgRef: ref,
    }),
    [cornerRadius, enterAngle, innerRadius, outerRadius, padAngle]
  );

  return (
    <svg ref={ref} width={width} height={height} style={{ display: "block" }}>
      <motion.g
        stroke="currentColor"
        strokeWidth="1.5"
        transform={`translate(${width / 2}, ${height / 2})`}
      >
        <DonutContext.Provider value={value}>{children}</DonutContext.Provider>
      </motion.g>
    </svg>
  );
};

export type DonutPieceInfo = {
  midAngle: number;
};

type DonutPieceBaseProps = {
  startAngle: number;
  endAngle: number;
  color: string;
  label: string;
  value: string;
  scale?: number;
  onClick?: (info: DonutPieceInfo) => void;
  onHoverStart?: (info: DonutPieceInfo) => void;
  onHoverEnd?: (info: DonutPieceInfo) => void;
  spring?: SpringOptions;
};
export type DonutPieceProps = DonutPieceBaseProps &
  Omit<ComponentProps<typeof motion.g>, keyof DonutPieceBaseProps>;

const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const ret = { ...obj };
  for (const key of keys) {
    delete ret[key];
  }
  return ret;
};

export const DonutPiece = (props: DonutPieceProps) => {
  const context = useDonutContext("DonutPiece");
  const scale = props.scale ?? 1;

  const opts: SpringOptions = props.spring ?? {
    damping: 20,
  };
  const innerRadius = useSpring(context.innerRadius, opts);
  const outerRadius = useSpring(context.outerRadius, opts);
  const startAngle = useSpring(context.enterAngle ?? props.startAngle, opts);
  const endAngle = useSpring(context.enterAngle ?? props.endAngle, opts);

  const arc = useTransform(() =>
    d3.arc().cornerRadius(context.cornerRadius).padAngle(context.padAngle)
  );

  const pathData = useTransform(() => {
    return arc.get()({
      startAngle: startAngle.get(),
      endAngle: endAngle.get(),
      innerRadius: innerRadius.get(),
      outerRadius: outerRadius.get(),
    });
  });

  const calc = useTransform(() => {
    const midAngle = (startAngle.get() + endAngle.get()) / 2;
    const outX = Math.sin(midAngle);
    const outY = -Math.cos(midAngle);
    const center = arc.get().centroid({
      startAngle: startAngle.get(),
      endAngle: endAngle.get(),
      innerRadius: innerRadius.get(),
      outerRadius: outerRadius.get(),
    });

    return {
      midAngle,
      outX,
      outY,
      center,
    };
  });

  const textX = useTransform(
    calc,
    (v) => v.center[0] + v.outX * 40 + v.outX * props.label.length * 2
  );
  const textY = useTransform(
    calc,
    (v) => v.center[1] + v.outY * 40 + v.outY * props.label.length * 2
  );
  const valueX = useTransform(calc, (v) => v.center[0]);
  const valueY = useTransform(calc, (v) => v.center[1]);

  const getClickInfo = () => ({
    midAngle: calc.get().midAngle,
  });

  const isPresent = useIsPresent();
  const enterAngle = context.enterAngle ?? 0;

  useEffect(() => {
    const setNormalized = (val: MotionValue<number>, target: number) => {
      const current = val.get();
      const diff = target - current;
      const diffNext = target - (current + Math.PI * 2);
      const diffPrev = target - (current - Math.PI * 2);
      const min = Math.min(
        Math.abs(diff),
        Math.abs(diffNext),
        Math.abs(diffPrev)
      );
      if (min === Math.abs(diffNext)) {
        val.jump(current + Math.PI * 2);
      }
      if (min === Math.abs(diffPrev)) {
        val.jump(current - Math.PI * 2);
      }
      val.set(target);
    };

    innerRadius.set(context.innerRadius * scale);
    outerRadius.set(context.outerRadius * scale);
    if (isPresent) {
      setNormalized(startAngle, props.startAngle);
      setNormalized(endAngle, props.endAngle);
    } else {
      const exitAngle =
        calc.get().midAngle < enterAngle
          ? enterAngle - Math.PI
          : enterAngle + Math.PI;
      setNormalized(startAngle, exitAngle);
      setNormalized(endAngle, exitAngle);
    }
  }, [
    calc,
    context.enterAngle,
    context.innerRadius,
    context.outerRadius,
    endAngle,
    enterAngle,
    innerRadius,
    isPresent,
    outerRadius,
    props.endAngle,
    props.startAngle,
    scale,
    startAngle,
  ]);

  return (
    <motion.g
      {...omit(props, "startAngle", "endAngle", "value", "transition")}
      onClick={() => props.onClick?.(getClickInfo())}
      onHoverStart={() => props.onHoverStart?.(getClickInfo())}
      onHoverEnd={() => props.onHoverEnd?.(getClickInfo())}
      style={{
        ...props.style,
        ...(props.onClick ? { cursor: "pointer" } : {}),
      }}
    >
      <motion.path
        d={pathData}
        fill={props.color}
        stroke={props.color}
        fillOpacity={0.65}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          ease: "easeIn",
        }}
      />
      <motion.text
        textAnchor="middle"
        x={textX}
        y={textY}
        stroke="none"
        fill="black"
        style={{ fontSize: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {props.label}
      </motion.text>
      <motion.text
        textAnchor="middle"
        x={valueX}
        y={valueY}
        stroke="none"
        fill="black"
        style={{ fontSize: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {props.value}
      </motion.text>
    </motion.g>
  );
};
