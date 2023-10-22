import type { MetaFunction } from "@remix-run/node";
import * as d3 from "d3";
import { createContext, useContext, useEffect, useState } from "react";
import invariant from "tiny-invariant";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useSpring,
  useTransform,
} from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type PieData = {
  name: string;
  id: string;
  value: number;
  children?: PieData[];
};
const pieData: PieData[] = [
  {
    name: "Clothes",
    id: "clothes",
    value: 100,
    children: [
      {
        name: "Shirts",
        id: "shirts",
        value: 50,
      },
      {
        name: "Pants",
        id: "pants",
        value: 10,
      },
      {
        name: "Funny hats",
        id: "pants",
        value: 40,
      },
    ],
  },
  {
    name: "Coffee",
    id: "coffee",
    value: 50,
    children: [
      {
        name: "Starbucks",
        id: "starbucks",
        value: 20,
      },
      {
        name: "Local place",
        id: "latte",
        value: 30,
      },
    ],
  },
  {
    name: "Groceries",
    id: "groceries",
    value: 200,
    children: [
      {
        name: "Whole Foods",
        id: "whole-foods",
        value: 100,
      },
      {
        name: "Trader Joes",
        id: "trader-joes",
        value: 30,
      },
      {
        name: "Local place",
        id: "local-groceries",
        value: 20,
      },
      {
        name: "Costco",
        id: "costco",
        value: 50,
      },
    ],
  },
  {
    name: "Gas",
    id: "gas",
    value: 100,
    children: [
      {
        name: "Shell",
        id: "shell",
        value: 50,
      },
      {
        name: "Exxon",
        id: "exxon",
        value: 50,
      },
    ],
  },
];

const arc = d3
  .arc()
  .innerRadius(20)
  .outerRadius(80)
  .cornerRadius(4)
  .padAngle(0.05);

const a = (start: number, end: number) =>
  arc({
    endAngle: start,
    startAngle: end,
    innerRadius: 20,
    outerRadius: 80,
  });

const getMidAngle = (startAngle: number, endAngle: number) =>
  (startAngle + endAngle) / 2;

const PieContext = createContext<null | {
  exitAngle: number;
  parentId: string;
}>(null);

const Arc = ({
  startAngle,
  endAngle,
  name,
  color,
  value,
  onClick,
  id,
}: {
  startAngle: number;
  endAngle: number;
  name: string;
  color: string;
  value: number;
  onClick?: () => void;
  id: string;
}) => {
  const context = useContext(PieContext);
  console.log(context);
  const start = useSpring(0, {
    damping: 25,
  });
  const end = useSpring(0, {
    damping: 25,
  });
  const d = useTransform(() => a(start.get(), end.get())!);
  const isPresent = useIsPresent();

  useEffect(() => {
    start.set(startAngle);
    end.set(endAngle);
  }, [end, endAngle, start, startAngle]);

  useEffect(() => {
    if (!isPresent) {
      invariant(context);
      const exitStart =
        startAngle < context.exitAngle
          ? context.exitAngle - Math.PI
          : context.exitAngle + Math.PI;
      const exitEnd = context.exitAngle + Math.PI;
      start.set(exitStart);
      end.set(context.parentId === id ? exitEnd : exitStart);
    }
  }, [context, end, id, isPresent, start, startAngle]);

  const textPosition = useTransform(() => {
    const midAngle = getMidAngle(start.get(), end.get());
    const outX = Math.sin(midAngle);
    const outY = -Math.cos(midAngle);
    const center = arc.centroid({
      startAngle: start.get(),
      endAngle: end.get(),
      innerRadius: 20,
      outerRadius: 80,
    });

    return {
      outX,
      outY,
      x: center[0] + outX * 50,
      y: center[1] + outY * 50,
      center,
    };
  });
  const textX = useTransform(textPosition, (v) => v.x - 15);
  const textY = useTransform(textPosition, (v) => v.y);
  const amountX = useTransform(textPosition, (v) => v.center[0] - 11);
  const amountY = useTransform(textPosition, (v) => v.center[1]);

  const midAngle = getMidAngle(startAngle, endAngle);
  const outX = Math.sin(midAngle);
  const outY = -Math.cos(midAngle);

  return (
    <motion.g
      whileHover={
        onClick
          ? {
              translateX: outX * 4,
              translateY: outY * 4,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
              },
              fillOpacity: 0.75,
            }
          : undefined
      }
      onClick={() => onClick?.()}
    >
      <motion.path
        d={d}
        fill={color}
        stroke={color}
        fillOpacity={0.65}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          cursor: "pointer",
        }}
        transition={{
          ease: "easeIn",
        }}
      />
      <motion.text
        x={textX}
        y={textY}
        stroke="none"
        fill="black"
        style={{ fontSize: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {name}
      </motion.text>
      <motion.text
        x={amountX}
        y={amountY}
        stroke="none"
        fill="black"
        style={{ fontSize: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {value}
      </motion.text>
    </motion.g>
  );
};

export default function Index() {
  const width = 640;
  const height = 400;

  // Pie graph
  const pie = pieData;
  const [parentId, setParentId] = useState<string | null>(null);
  const data = d3.pie().padAngle(0.3)(pie.map((d) => d.value));

  const colors = ["#ef6f6c", "#465775", "#56e39f", "#59c9a5", "#5b6c5d"];
  const parentIndex = parentId
    ? pie.findIndex((d) => d.id === parentId)
    : undefined;
  const parent = parentIndex !== undefined ? pie[parentIndex] : undefined;
  const parentColor = parentIndex ? colors[parentIndex % 5] : undefined;
  const parentData = parentIndex ? data[parentIndex] : undefined;
  const parentMid = parentData
    ? getMidAngle(parentData.startAngle, parentData.endAngle)
    : undefined;
  const parentStart = parentMid ? parentMid - Math.PI : undefined;
  const parentEnd = parentMid ? parentMid + Math.PI : undefined;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <motion.svg width={width} height={height}>
        <motion.g
          fill="white"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`translate(${width / 2}, ${height / 2})`}
        >
          <PieContext.Provider
            value={parentId ? { exitAngle: parentMid!, parentId } : null}
          >
            <AnimatePresence mode="popLayout" custom={{ custom: parentMid }}>
              {/* {parent && (
                <Arc
                  key={parentId}
                  color={parentColor!}
                  startAngle={parentStart!}
                  endAngle={parentEnd!}
                  name={parent.name}
                  value={parent.value}
                />
              )} */}
              {!parent &&
                data.map((d, i) => (
                  <Arc
                    key={pie[i].id}
                    id={pie[i].id}
                    startAngle={d.startAngle}
                    endAngle={d.endAngle}
                    name={pie[i].name}
                    value={pie[i].value}
                    color={colors[i % 5]}
                    onClick={
                      pie[i].children ? () => setParentId(pie[i].id) : undefined
                    }
                  />
                ))}
            </AnimatePresence>
          </PieContext.Provider>
        </motion.g>
      </motion.svg>
    </div>
  );
}
