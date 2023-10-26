import type { MetaFunction } from "@remix-run/node";
import * as d3 from "d3";
import { useEffect, useState } from "react";
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

const plot1 = [
  1.56, 1.88, 1.27, 1.3, 0.093, 0.789, 0.261, 0.389, -0.7, 0.122, -0.581,
  0.00493, 0.00493, 0.0443, 0.122, 0.238, 1.01, 0.574, 1.41, 1.03, 0.983, 1.58,
  2.5, 2.19, 0.625, 2.81, 3.43, 3.42, 4.33, 3.97, 2.96, 4.43, 5.86, 4.76, 3.94,
  4.96, 5.31, 5.0, 5.58, 4.88, 4.45, 4.61, 5.05, 4.21, 3.97, 3.7, 3.73, 3.12,
];

const plot2 = [
  2.19, 1.88, 1.58, 1.3, 1.03, 0.789, 0.574, 0.389, 0.238, 0.122, 0.0443,
  0.00493, 0.00493, 0.0443, 0.122, 0.238, 0.389, 0.574, 0.789, 1.03, 1.3, 1.58,
  1.88, 2.19, 2.5, 2.81, 3.12, 3.42, 3.7, 3.97, 4.21, 4.43, 4.61, 4.76, 4.88,
  4.96, 5.0, 5.0, 4.96, 4.88, 4.76, 4.61, 4.43, 4.21, 3.97, 3.7, 3.42, 3.12,
];

const pie1 = [2.05, 2.87, 2.77, 3.3, 2.6, 3.79, 3.75, 4.35].sort(
  (a, b) => a - b
);

const pie2 = [3.46, 2.97, 3.97, 6.04, 8.12, 9.2].sort((a, b) => a - b);

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

const Arc = ({
  startAngle,
  endAngle,
}: {
  startAngle: number;
  endAngle: number;
}) => {
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
      start.set(0);
      end.set(0);
    }
  }, [end, isPresent, start]);

  return (
    <motion.path
      d={d}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        ease: "easeIn",
      }}
    />
  );
};

export default function Index() {
  const [data, setData] = useState(plot1);
  const width = 640;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  // Line graph
  const x = d3.scaleLinear(
    [0, data.length - 1],
    [marginLeft, width - marginRight]
  );

  const res = d3.extent(data);
  invariant(res[0]);

  const y = d3.scaleLinear(
    [res[0] - 1, res[1] + 1],
    [height - marginBottom, marginTop]
  );
  const line = d3.line((d, i) => x(i), y);

  // Pie graph
  const [pie, setPie] = useState(pie1);
  const pieChart = d3.pie().padAngle(0.3)(pie);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <motion.svg width={width} height={height}>
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0, d: line(data) ?? undefined }}
          animate={{ pathLength: 1, d: line(data) ?? undefined }}
        />
        <motion.g fill="white" stroke="currentColor" strokeWidth="1.5">
          {data.map((d, i) => (
            <motion.circle
              key={i}
              r="2.5"
              animate={{
                cx: x(i),
                cy: y(d),
              }}
            />
          ))}
        </motion.g>
      </motion.svg>

      <button
        onClick={() => {
          setData(plot1);
          setPie(pie1);
        }}
      >
        Plot 1
      </button>
      <button
        onClick={() => {
          setData(plot2);
          setPie(pie2);
        }}
      >
        Plot 2
      </button>

      <motion.svg width={width} height={height}>
        <motion.g
          fill="white"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`translate(${width / 2}, ${height / 2})`}
        >
          <AnimatePresence mode="popLayout">
            {pieChart.map((d, i) => (
              <Arc key={i} startAngle={d.startAngle} endAngle={d.endAngle} />
            ))}
          </AnimatePresence>
        </motion.g>
      </motion.svg>
    </div>
  );
}
