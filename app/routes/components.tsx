import { scaleLinear } from "d3";
import { Axis } from "~/graphing/axis";
import { Graph } from "~/graphing/graph";
import { Line } from "~/graphing/line";
import { extent } from "~/graphing/scale";

const plot1 = [
  1.56, 1.88, 1.27, 1.3, 0.093, 0.789, 0.261, 0.389, -0.7, 0.122, -0.581,
  0.00493, 0.00493, 0.0443, 0.122, 0.238, 1.01, 0.574, 1.41, 1.03, 0.983, 1.58,
  2.5, 2.19, 0.625, 2.81, 3.43, 3.42, 4.33, 3.97, 2.96, 4.43, 5.86, 4.76, 3.94,
  4.96, 5.31, 5.0, 5.58, 4.88, 4.45, 4.61, 5.05, 4.21, 3.97, 3.7, 3.73, 3.12,
];

const plot2 = [
  3.12, 3.42, 3.7, 3.97, 4.21, 4.43, 4.61, 4.76, 4.88, 4.96, 5, 5, 4.96, 4.88,
  4.76, 4.61, 4.43, 4.21, 3.97, 3.7, 3.42, 3.12, 2.81, 2.5, 2.19, 1.88, 1.58,
  1.3, 1.03, 0.789, 0.574, 0.389, 0.238, 0.122, 0.0443, 0.00493, 0.00493,
  0.0443, 0.122, 0.238, 0.389, 0.574, 0.789, 1.03, 1.3, 1.58, 1.88, 2.19,
];

export default function Components() {
  const xScale = scaleLinear().domain([0, plot1.length - 1]);
  const yScale = scaleLinear().domain(extent([...plot1, ...plot2]));
  return (
    <div>
      <h1>Components</h1>
      <div style={{ display: "flex" }}>
        <Graph padding={{ left: 32 }}>
          <Line
            data={plot1}
            xScale={xScale}
            yScale={yScale}
            x={(d, i) => i}
            y={(d) => d}
            enter="draw-from-left"
          />
          <Line
            data={plot2}
            xScale={xScale}
            yScale={yScale}
            x={(d, i) => i}
            y={(d) => d}
            stroke="#ef4444"
            enter="draw-from-left"
            transition={{ delay: 0.25 }}
          />
          <Axis side="bottom" tickSpacing={10} scale={xScale} />
          <Axis side="left" tickSpacing={1} scale={yScale} />
        </Graph>

        <Graph style={{ marginLeft: "1rem" }}>
          <Line
            data={plot2}
            xScale={xScale}
            yScale={yScale}
            x={(d, i) => i}
            y={(d) => d}
            stroke="#f59e0b"
            enter="draw-from-right"
          />
          <Line
            data={plot1}
            xScale={xScale}
            yScale={yScale}
            x={(d, i) => i}
            y={(d) => d}
            stroke="#10b981"
            enter="draw-from-right"
            transition={{ delay: 0.25 }}
          />
        </Graph>
      </div>
    </div>
  );
}
