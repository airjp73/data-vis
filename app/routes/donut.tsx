import type { MetaFunction } from "@remix-run/node";
import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { DonutPieceInfo, DonutPieceProps } from "~/donut/donut";
import { Donut, DonutPiece } from "~/donut/donut";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type Data = {
  name: string;
  id: string;
  value: number;
  children?: Data[];
};
const data: Data[] = [
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
        id: "hats",
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
        id: "local",
        value: 30,
        children: [
          {
            name: "Good coffee",
            id: "good-coffee",
            value: 10,
          },
          {
            name: "Bad coffee",
            id: "bad-coffee",
            value: 20,
          },
        ],
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

const HoverDonut = (props: DonutPieceProps) => {
  const [hovered, setHovered] = useState(false);
  const clickable = !!props.onClick;
  return (
    <DonutPiece
      {...props}
      scale={hovered ? 1.1 : 1}
      onHoverStart={clickable ? () => setHovered(true) : undefined}
      onHoverEnd={clickable ? () => setHovered(false) : undefined}
    />
  );
};

export default function Index() {
  const [donutStack, setDonutStack] = useState<
    { info: DonutPieceInfo; items: Data[] }[]
  >([
    {
      items: data,
      info: { midAngle: 0 },
    },
  ]);
  const width = 640;
  const height = 400;

  // Pie graph
  const topDonut = donutStack[donutStack.length - 1];
  const pie = d3.pie().padAngle(0.3)(topDonut.items.map((d) => d.value));
  const colors = ["#ef6f6c", "#465775", "#56e39f", "#59c9a5", "#5b6c5d"];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <motion.svg width={width} height={height} style={{ display: "block" }}>
        <motion.g
          fill="white"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`translate(${width / 2}, ${height / 2})`}
        >
          <Donut
            enterAngle={topDonut.info.midAngle}
            exitAngle={topDonut.info.midAngle + Math.PI * 2}
          >
            <AnimatePresence mode="popLayout">
              {pie.map((d, i) => (
                <HoverDonut
                  key={topDonut.items[i].id}
                  startAngle={d.startAngle}
                  endAngle={d.endAngle}
                  label={topDonut.items[i].name}
                  value={String(topDonut.items[i].value)}
                  color={colors[i % 5]}
                  onClick={
                    topDonut.items[i].children
                      ? (info) => {
                          setDonutStack((prev) => [
                            ...prev,
                            {
                              items: topDonut.items[i].children!,
                              info,
                            },
                          ]);
                        }
                      : undefined
                  }
                />
              ))}
            </AnimatePresence>
          </Donut>
        </motion.g>
      </motion.svg>
      {donutStack.length > 1 && (
        <button
          onClick={() => {
            setDonutStack((prev) => prev.slice(0, prev.length - 1));
          }}
        >
          Back
        </button>
      )}
    </div>
  );
}
