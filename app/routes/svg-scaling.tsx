import { motion } from "framer-motion";
import * as d3 from "d3";
import invariant from "tiny-invariant";
import { useLayoutEffect, useRef, useState } from "react";
import { useRect } from "~/graphing/useRect";

const data = [
  1.56, 1.88, 1.27, 1.3, 0.093, 0.789, 0.261, 0.389, -0.7, 0.122, -0.581,
  0.00493, 0.00493, 0.0443, 0.122, 0.238, 1.01, 0.574, 1.41, 1.03, 0.983, 1.58,
  2.5, 2.19, 0.625, 2.81, 3.43, 3.42, 4.33, 3.97, 2.96, 4.43, 5.86, 4.76, 3.94,
  4.96, 5.31, 5.0, 5.58, 4.88, 4.45, 4.61, 5.05, 4.21, 3.97, 3.7, 3.73, 3.12,
];

export default function Components() {
  const ref = useRef<SVGSVGElement>(null);
  const rect = useRect(ref);

  const { width = 100, height = 200 } = rect ?? {};
  const paddingTop = 20;
  const paddingRight = 20;
  const paddingBottom = 30;
  const paddingLeft = 40;

  // Line graph
  const x = d3.scaleLinear(
    [0, data.length - 1],
    [paddingLeft, width - paddingRight]
  );

  const res = d3.extent(data);
  invariant(res[0]);

  const y = d3.scaleLinear(
    [res[0] - 1, res[1] + 1],
    [height - paddingBottom, paddingTop]
  );
  const line = d3.line((d, i) => x(i), y);

  return (
    <div>
      <svg ref={ref} style={{ width: "100%" }}>
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
      </svg>
    </div>
  );
}
