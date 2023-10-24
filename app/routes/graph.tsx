import { useMemo, useState } from "react";
import { evaluate, parse } from "mathjs";
import * as d3 from "d3";
import { motion } from "framer-motion";

const minX = -10;
const maxX = 10;
const minY = -10;
const maxY = 10;
const xTicks = Array.from({ length: maxX - minX }, (_, i) => i + minX);
const yTicks = xTicks;

export default function Graph() {
  const [equation, setEquation] = useState("x^2");

  const data = useMemo(() => {
    const points: [number, number][] = [];
    const evalEquation = parse(equation);
    for (let x = minX; x <= maxX; x += 0.1) {
      const yVal = evalEquation.evaluate({ x });
      points.push([x, yVal]);
    }
    return points;
  }, [equation]);

  const width = 640;
  const height = 400;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 10;
  const marginLeft = 10;

  const x = d3.scaleLinear([minX, maxX], [marginLeft, width - marginRight]);
  const y = d3.scaleLinear([minY, maxY], [height - marginBottom, marginTop]);
  const line = d3.line<[number, number]>(
    (d) => x(d[0]),
    (d) => y(d[1])
  );

  return (
    <div>
      <motion.svg width={width} height={height} style={{ display: "block" }}>
        <motion.g>
          <motion.line y1={y(0)} y2={y(0)} stroke="black" x1="0" x2="100%" />
          {xTicks.map((tick) => (
            <motion.line
              key={tick}
              stroke="black"
              x1={x(tick)}
              x2={x(tick)}
              y1={y(0.2)}
              y2={y(-0.2)}
            />
          ))}
        </motion.g>
        <motion.g>
          <motion.line x1={x(0)} x2={x(0)} stroke="black" y1="0" y2="100%" />
          {yTicks.map((tick) => (
            <motion.line
              key={tick}
              stroke="black"
              y1={y(tick)}
              y2={y(tick)}
              x1={x(0.2)}
              x2={x(-0.2)}
            />
          ))}
        </motion.g>
        <motion.g>
          {xTicks.map((tick) => (
            <motion.line
              key={tick}
              stroke="black"
              strokeOpacity={0.15}
              x1={x(tick)}
              x2={x(tick)}
              y1={0}
              y2="100%"
            />
          ))}
          {yTicks.map((tick) => (
            <motion.line
              key={tick}
              stroke="black"
              strokeOpacity={0.15}
              x1={0}
              x2="100%"
              y1={y(tick)}
              y2={y(tick)}
            />
          ))}
        </motion.g>
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{
            d: line(data) ?? undefined,
          }}
        />
        {/* <motion.g fill="white" stroke="currentColor" strokeWidth="1.5">
          {data.map((point, i) => (
            <motion.circle
              key={i}
              r="2.5"
              animate={{ cx: x(point[0]), cy: y(point[1]) }}
            />
          ))}
        </motion.g> */}
      </motion.svg>

      <pre>{equation}</pre>
      <input
        defaultValue="x^2"
        onChange={(e) => {
          if (!e.target.value) return;
          try {
            const val = e.target.value;
            evaluate(val, { x: 1 });
            setEquation(val);
          } catch (err) {
            console.log(err);
          }
        }}
      />
    </div>
  );
}
