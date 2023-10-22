import type { MetaFunction } from "@remix-run/node";
import * as d3 from "d3";
import { useDragControls } from "framer-motion";
import { useEffect, useState } from "react";
import type { DonutPieceInfo, DonutPieceProps } from "~/donut/donut";
import { Donut, DonutPiece, useDonutContext } from "~/donut/donut";

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
  },
  {
    name: "Coffee",
    id: "coffee",
    value: 50,
  },
  {
    name: "Groceries",
    id: "groceries",
    value: 200,
  },
  {
    name: "Gas",
    id: "gas",
    value: 100,
  },
];

const DragDonut = (props: DonutPieceProps) => {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const controls = useDragControls();
  const context = useDonutContext("DragDonut");
  const [midAngle, setMidAngle] = useState<null | number>(null);

  useEffect(() => {
    if (dragging) {
      const listener = (e: MouseEvent) => {
        const rect = context.svgRef.current!.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.pageX - centerX;
        const dy = e.pageY - centerY;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        setMidAngle(angle);
      };
      window.addEventListener("mousemove", listener);
      return () => window.removeEventListener("mousemove", listener);
    }
  }, [context.svgRef, dragging]);

  const originalMidAngle = (props.startAngle + props.endAngle) / 2;
  const angleDiff = midAngle ? originalMidAngle - midAngle : 0;
  const startAngle = props.startAngle - angleDiff;
  const endAngle = props.endAngle - angleDiff;

  return (
    <DonutPiece
      {...props}
      spring={dragging ? { stiffness: 300, damping: 40 } : undefined}
      startAngle={startAngle}
      endAngle={endAngle}
      dragControls={controls}
      scale={dragging ? 1.2 : hovered ? 1.1 : 1}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onPointerDown={(e) => controls.start(e)}
      onDragStart={() => {
        setDragging(true);
      }}
      onDragEnd={() => {
        setDragging(false);
        setMidAngle(null);
      }}
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

  // Pie graph
  const topDonut = donutStack[donutStack.length - 1];
  const pie = d3.pie().padAngle(0.3)(topDonut.items.map((d) => d.value));
  const colors = ["#ef6f6c", "#465775", "#56e39f", "#59c9a5", "#5b6c5d"];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Donut enterAngle={topDonut.info.midAngle}>
        {pie.map((d, i) => (
          <DragDonut
            key={topDonut.items[i].id}
            startAngle={d.startAngle}
            endAngle={d.endAngle}
            label={topDonut.items[i].name}
            value={String(topDonut.items[i].value)}
            color={colors[i % 5]}
          />
        ))}
      </Donut>
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
