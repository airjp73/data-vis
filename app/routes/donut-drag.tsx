import type { MetaFunction } from "@remix-run/node";
import * as d3 from "d3";
import { useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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

const DragDonut = ({
  onDrag,
  ...props
}: Omit<DonutPieceProps, "onDrag"> & { onDrag: (angle: number) => void }) => {
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

        if (angle < 0) onDrag(angle + Math.PI * 2);
        else if (angle > Math.PI * 2) onDrag(angle - Math.PI * 2);
        else onDrag(angle);
      };
      window.addEventListener("mousemove", listener);
      return () => window.removeEventListener("mousemove", listener);
    }
  }, [context.svgRef, dragging, onDrag]);

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
      onDragEnd={(...args) => {
        setDragging(false);
        setMidAngle(null);
        props.onDragEnd?.(...args);
      }}
    />
  );
};

const colors = ["#ef6f6c", "#465775", "#56e39f", "#59c9a5", "#5b6c5d"];

export default function Index() {
  const [items, setItems] = useState(
    data.map((d, i) => ({
      ...d,
      color: colors[i % 5],
    }))
  );

  // Pie graph
  const pie = d3.pie().sort(null).padAngle(0.3)(items.map((d) => d.value));
  const lastAngle = useRef<number | null>(null);

  const [modal, setModal] = useState<Data | null>(null);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Donut>
        {pie.map((d, i) => (
          <DragDonut
            onDrag={(angle) => {
              const index = pie.findIndex((item, itemIndex) => {
                if (lastAngle.current === null) return false;
                const mid = (item.startAngle + item.endAngle) / 2;
                return angle < mid !== lastAngle.current! < mid;
              });
              lastAngle.current = angle;
              if (index === -1) return;

              setItems((prev) => {
                const newItems = [...prev];
                const dragItem = newItems[i];
                const swapItem = newItems[index];
                newItems[i] = swapItem;
                newItems[index] = dragItem;
                return newItems;
              });
            }}
            onDragEnd={() => {
              lastAngle.current = null;
            }}
            onClick={() => {
              setModal(items[i]);
            }}
            key={items[i].id}
            startAngle={d.startAngle}
            endAngle={d.endAngle}
            label={items[i].name}
            value={String(items[i].value)}
            color={items[i].color}
          />
        ))}
      </Donut>
      {!!modal && (
        <form
          key={modal.id}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            if (!data.get("name") || !data.get("value")) return;
            setItems((prev) =>
              prev.map((item) => {
                if (item.id !== modal.id) return item;
                return {
                  ...item,
                  name: data.get("name") as string,
                  value: Number(data.get("value")),
                };
              })
            );
            setModal(null);
          }}
        >
          <label>
            Name
            <input type="text" name="name" defaultValue={modal.name} />
          </label>
          <label>
            Value
            <input type="number" name="value" defaultValue={modal.value} />
          </label>
          <button type="submit">Update</button>
        </form>
      )}
    </div>
  );
}
