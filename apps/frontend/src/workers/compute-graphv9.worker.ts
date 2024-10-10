import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import ViewEdge from "@/components/visual-navigator/graph/view-edge";
import { isObject } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";

//@ts-ignore
const ctx: Worker = self;

function isViewEdge(edge: unknown): edge is ViewEdge {
  if (isObject(edge))
    return (
      typeof edge.isPartOfTransitiveQuorumSet === "boolean" &&
      typeof edge.isPartOfStronglyConnectedComponent === "boolean"
    );
  return false;
}

function isViewVertex(vertex: unknown): vertex is ViewVertex {
  if (isObject(vertex)) return typeof vertex.key === "string";
  return false;
}

ctx.addEventListener("message", (event) => {
  const vertices = event.data.vertices;
  const edges = event.data.edges;
  const width = event.data.width;
  const height = event.data.height;

  //@ts-ignore
  const nrOfTransitiveVertices = event.data.vertices.filter(
    (vertex: ViewVertex) => vertex.isPartOfTransitiveQuorumSet,
  ).length;

  const simulation = forceSimulation(vertices)
    .force(
      "charge",
      forceManyBody().strength(() => {
        return -250;
      }),
    )
    .force(
      "link",
      forceLink(edges)
        .strength((edge: SimulationLinkDatum<SimulationNodeDatum>) => {
          if (!isViewEdge(edge)) throw new Error("Not a view edge");
          if (edge.isPartOfTransitiveQuorumSet) {
            return (1 / nrOfTransitiveVertices) * 0.17;
          } else if (edge.isPartOfStronglyConnectedComponent) {
            return 0.1;
          } else {
            return 0.001113;
          }
        })
        .id((d) => {
          if (!isViewVertex(d)) throw new Error("Not a ViewVertex");
          return d.key;
        }),
    )
    .force("x", forceX(0))
    .force("y", forceY(0))
    .force("center", forceCenter(width / 2, height / 2))

    // .alphaDecay(0.1)
    // .alphaMin(0.15)
    // .velocityDecay(0.35);
    .stop();

  for (
    let i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
      );
    i < n;
    ++i
  ) {
    //ctx.postMessage({type: 'tick', progress: i / n});
    simulation.tick();
  }
  ctx.postMessage({ type: "end", vertices: vertices, edges: edges });
});

export default ctx;
