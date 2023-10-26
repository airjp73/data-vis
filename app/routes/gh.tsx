import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { gql } from "graphql-request";
import { z } from "zod";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { gh } from "~/gh/client.server";
import invariant from "tiny-invariant";
import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import { subDays, subYears, formatISO } from "date-fns";

const ContributionDay = z.object({
  contributionCount: z.number(),
  date: z.string(),
});
const ContributesResponse = z.object({
  user: z.object({
    contributionsCollection: z.object({
      hasActivityInThePast: z.boolean(),
      contributionCalendar: z.object({
        totalContributions: z.number(),
        weeks: z.array(
          z.object({
            contributionDays: z.array(ContributionDay),
          })
        ),
      }),
    }),
  }),
});

export const loader = async () => {
  const query = gql`
    query ($userName: String!, $startDate: DateTime!, $endDate: DateTime!) {
      user(login: $userName) {
        contributionsCollection(from: $startDate, to: $endDate) {
          hasActivityInThePast
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const getData = async () => {
    const data: z.infer<typeof ContributionDay>[] = [];

    let endDate = new Date();
    let hasActivityInThePast = true;
    let totalContributions = 0;

    while (hasActivityInThePast) {
      const oneYearAgo = subYears(endDate, 1);
      const res = ContributesResponse.parse(
        await gh.request(query, {
          userName: "airjp73",
          startDate: oneYearAgo.toISOString(),
          endDate: endDate.toISOString(),
        })
      );
      data.unshift(
        ...res.user.contributionsCollection.contributionCalendar.weeks.flatMap(
          (week) => week.contributionDays
        )
      );

      // hasActivityInThePast =
      //   res.user.contributionsCollection.hasActivityInThePast;
      hasActivityInThePast = false;
      endDate = subDays(oneYearAgo, 1);
      totalContributions +=
        res.user.contributionsCollection.contributionCalendar
          .totalContributions;
    }
    return {
      data,
      totalContributions,
    };
  };

  return defer({ res: getData() });
};

type ArrayItem<T> = T extends Array<infer U> ? U : never;

type HoverInfo = {
  xPos: number;
  date: string;
  count: number;
  svgRect: DOMRect;
};

function Gh({
  data,
  totalContributions,
}: Awaited<ReturnType<typeof useLoaderData<typeof loader>>["res"]>) {
  const width = 640;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const xBounds = d3.extent(data, (d) => new Date(d.date).getTime());
  const yBounds = d3.extent(data, (d) => d.contributionCount);
  invariant(xBounds[0] != null && xBounds[1] != null);
  invariant(yBounds[0] != null && yBounds[1] != null);
  const x = d3.scaleLinear(xBounds, [marginLeft, width - marginRight]);
  const y = d3.scaleLinear(yBounds, [height - marginBottom, marginTop]);

  const line = d3.line<ArrayItem<typeof data>>(
    (d) => x(new Date(d.date).getTime()),
    (d) => y(d.contributionCount)
  );

  const getXTicks = () => {
    const xRange = xBounds[1] - xBounds[0];
    const numTicks = 20;
    const remainder = xRange % numTicks;
    const tickRange = xRange - remainder;
    const tickLength = tickRange / numTicks;
    const xTicks = Array.from({ length: numTicks })
      .fill(0)
      .map((_, i) => i * tickLength + xBounds[0]);
    return xTicks;
  };
  const xTicks = getXTicks();

  const getYTicks = () => {
    const yRange = yBounds[1] - yBounds[0];
    const numTicks = 10;
    const remainder = yRange % numTicks;
    const tickRange = yRange - remainder;
    const tickLength = tickRange / numTicks;
    const yTicks = Array.from({ length: numTicks })
      .fill(0)
      .map((_, i) => i * tickLength + yBounds[0]);
    return yTicks;
  };
  const yTicks = getYTicks();

  const [hover, setHoverPos] = useState<HoverInfo | null>(null);
  const [showInfo, setShowInfo] = useState<null | HoverInfo>(null);
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (showInfo) return;

    const handler = (e: MouseEvent) => {
      invariant(ref.current);
      const rect = ref.current.getBoundingClientRect();
      const xCoord = x.invert(e.clientX - rect.left);
      const yCoord = y.invert(e.clientY - rect.top);
      if (
        xCoord <= xBounds[0] ||
        xCoord > xBounds[1] ||
        yCoord < yBounds[0] ||
        yCoord > yBounds[1]
      )
        return setHoverPos(null);

      const hoverredDate = formatISO(xCoord, { representation: "date" });
      const actualHoverredPosition = x(new Date(hoverredDate).getTime());
      const hoverredItem = data.find((d) => d.date === hoverredDate);

      setHoverPos({
        xPos: actualHoverredPosition,
        date: hoverredDate,
        count: hoverredItem?.contributionCount ?? 0,
        svgRect: ref.current?.getBoundingClientRect() ?? { top: 0, left: 0 },
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [data, showInfo]);

  return (
    <>
      <p>Total contributions: {totalContributions}</p>
      {!!hover && !showInfo && (
        <motion.div
          style={{
            position: "fixed",
            backgroundColor: "white",
            padding: ".5rem",
            border: "1px solid black",
            borderRadius: 3,
            top: (hover.svgRect.top ?? 0) + (y(yBounds[0]) - y(yBounds[1])) / 2,
            left: x(new Date(hover.date).getTime()) + (hover.svgRect.left ?? 0),
          }}
          layoutId="hoverInfo"
          // Not sure this is proper use of this.
          // This is to prevent the hover info from transitioning as it moves,
          // but allow it to transition when it appears/disappears.
          layoutDependency={1}
        >
          <strong>{hover.date}:</strong> {hover.count ?? "Unknown"}
        </motion.div>
      )}
      {showInfo && (
        <motion.div
          style={{
            position: "fixed",
            top: showInfo.svgRect.top + showInfo.svgRect.height / 2 - 55,
            left: showInfo.svgRect.left + showInfo.svgRect.width / 2 - 55,
            backgroundColor: "white",
            padding: ".5rem",
            border: "1px solid black",
            borderRadius: 3,
          }}
          layoutId="hoverInfo"
        >
          <p>
            <strong>Date:</strong> {showInfo.date}
          </p>
          <p>
            <strong>Count:</strong> {showInfo.count}
          </p>
          <div>
            <button type="button" onClick={() => setShowInfo(null)}>
              Close
            </button>
          </div>
        </motion.div>
      )}
      <motion.svg
        width={width}
        height={height}
        style={{ display: "block" }}
        ref={ref}
        onClick={(e) => {
          if (hover) setShowInfo(hover);
        }}
      >
        {!!hover && !showInfo && (
          <motion.line
            x1={hover.xPos}
            x2={hover.xPos}
            y1={y(yBounds[0])}
            y2={y(yBounds[1])}
            stroke="currentColor"
          />
        )}
        <motion.g>
          <motion.line y1={y(0)} y2={y(0)} stroke="black" x1="0" x2="100%" />
          {xTicks.map((tick, i) => (
            <Fragment key={tick}>
              <motion.line
                stroke="black"
                x1={x(tick)}
                x2={x(tick)}
                y1={y(0)}
                y2={y(0) + 10}
              />
              <motion.text
                x={x(tick)}
                y={y(0) + 15 + (i % 2) * 7}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontSize="8px"
              >
                {new Date(tick).toLocaleDateString(undefined, {
                  dateStyle: "short",
                })}
              </motion.text>
            </Fragment>
          ))}
        </motion.g>
        <motion.g>
          <motion.line
            x1={x(xBounds[0])}
            x2={x(xBounds[0])}
            stroke="black"
            y1="0"
            y2="100%"
          />
          {yTicks.map((tick) => (
            <Fragment key={tick}>
              <motion.line
                stroke="black"
                y1={y(tick)}
                y2={y(tick)}
                x1={x(xBounds[0]) - 10}
                x2={x(xBounds[0])}
              />
              <motion.text
                x={x(xBounds[0]) - 15}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="8px"
              >
                {tick}
              </motion.text>
            </Fragment>
          ))}
        </motion.g>
        <motion.path
          fill="none"
          stroke="#38bdf8"
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
    </>
  );
}

export default function GhPage() {
  const { res } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={res}>
        {({ data, totalContributions }) => (
          <Gh data={data} totalContributions={totalContributions} />
        )}
      </Await>
    </Suspense>
  );
}
