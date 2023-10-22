import * as d3 from "d3";
import type { SpringOptions } from "framer-motion";
import { useTransform, motion, useSpring, useIsPresent } from "framer-motion";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
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
type DonutContextType = DonutDimensions & Partial<DonutTransitionTargets>;

const DonutContext = createContext<null | DonutContextType>(null);
const useDonutContext = (compName: string) => {
  const context = useContext(DonutContext);
  invariant(context, `${compName} must be used within a Donut`);
  return context;
};

export type DonutProps = PropsWithChildren<Partial<DonutContextType>>;

export const Donut = ({
  cornerRadius = 4,
  innerRadius = 20,
  outerRadius = 80,
  padAngle = 0.05,
  enterAngle,
  children,
}: DonutProps) => {
  const value = useMemo<DonutContextType>(
    () => ({
      cornerRadius,
      innerRadius,
      outerRadius,
      padAngle,
      enterAngle,
    }),
    [cornerRadius, enterAngle, innerRadius, outerRadius, padAngle]
  );

  return (
    <DonutContext.Provider value={value}>{children}</DonutContext.Provider>
  );
};

export type DonutPieceInfo = {
  midAngle: number;
};

export type DonutPieceProps = {
  startAngle: number;
  endAngle: number;
  color: string;
  label: string;
  value: string;
  scale?: number;
  onClick?: (info: DonutPieceInfo) => void;
  onHoverStart?: (info: DonutPieceInfo) => void;
  onHoverEnd?: (info: DonutPieceInfo) => void;
};

export const DonutPiece = (props: DonutPieceProps) => {
  const context = useDonutContext("DonutPiece");
  const scale = props.scale ?? 1;

  const opts: SpringOptions = {
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
    innerRadius.set(context.innerRadius * scale);
    outerRadius.set(context.outerRadius * scale);
    if (isPresent) {
      startAngle.set(props.startAngle);
      endAngle.set(props.endAngle);
    } else {
      const exitAngle =
        calc.get().midAngle < enterAngle
          ? enterAngle - Math.PI
          : enterAngle + Math.PI;
      startAngle.set(exitAngle);
      endAngle.set(exitAngle);
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
      onClick={() => props.onClick?.(getClickInfo())}
      onHoverStart={() => props.onHoverStart?.(getClickInfo())}
      onHoverEnd={() => props.onHoverEnd?.(getClickInfo())}
      style={
        props.onClick
          ? {
              cursor: "pointer",
            }
          : undefined
      }
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
