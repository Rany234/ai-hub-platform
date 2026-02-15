"use client";

import "@xyflow/react/dist/style.css";

import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge, type NodeMouseHandler } from "@xyflow/react";

type GenealogyNode = {
  id: string;
  data: { label: string; type: "parent" | "current" | "child"; creatorId?: string };
};

type GenealogyEdge = {
  id: string;
  source: string;
  target: string;
};

type GenealogyResponse = {
  nodes: GenealogyNode[];
  edges: GenealogyEdge[];
};

type RemixTreeProps = {
  listingId: string;
};

function buildLayout(nodes: GenealogyNode[], edges: GenealogyEdge[]): { nodes: Node[]; edges: Edge[] } {
  const current = nodes.find((n) => n.data.type === "current");
  const parent = nodes.find((n) => n.data.type === "parent");
  const children = nodes.filter((n) => n.data.type === "child");

  const rfNodes: Node[] = [];

  const baseNodeStyle: React.CSSProperties = {
    borderRadius: 14,
    padding: 10,
    fontSize: 13,
    background: "rgba(15, 23, 42, 0.65)",
    color: "#e2e8f0",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    width: 240,
    textAlign: "center",
  };

  const parentStyle: React.CSSProperties = {
    ...baseNodeStyle,
    border: "2px dashed rgba(148, 163, 184, 0.8)",
    background: "rgba(148, 163, 184, 0.08)",
  };

  const currentStyle: React.CSSProperties = {
    ...baseNodeStyle,
    border: "3px solid rgba(59, 130, 246, 0.95)",
    background: "rgba(59, 130, 246, 0.10)",
    fontWeight: 700,
  };

  const childStyle: React.CSSProperties = {
    ...baseNodeStyle,
    border: "2px solid rgba(34, 197, 94, 0.9)",
    background: "rgba(34, 197, 94, 0.08)",
  };

  const xCenter = 0;
  const yParent = 0;
  const yCurrent = 120;
  const yChildren = 260;

  if (parent) {
    rfNodes.push({
      id: parent.id,
      position: { x: xCenter, y: yParent },
      data: { label: `原始资产: ${parent.data.label}` },
      style: parentStyle,
      type: "default",
    });
  }

  if (current) {
    rfNodes.push({
      id: current.id,
      position: { x: xCenter, y: yCurrent },
      data: { label: `当前焦点: ${current.data.label}` },
      style: currentStyle,
      type: "default",
    });
  }

  if (children.length > 0) {
    const gap = 280;
    const startX = xCenter - ((children.length - 1) * gap) / 2;

    children.forEach((child, idx) => {
      rfNodes.push({
        id: child.id,
        position: { x: startX + idx * gap, y: yChildren },
        data: { label: child.data.label },
        style: childStyle,
        type: "default",
      });
    });
  }

  const rfEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: true,
    style: { strokeWidth: 2, stroke: "rgba(148, 163, 184, 0.8)" },
  }));

  return { nodes: rfNodes, edges: rfEdges };
}

export function RemixTree({ listingId }: RemixTreeProps) {
  const [data, setData] = useState<GenealogyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/listings/${encodeURIComponent(listingId)}/genealogy`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `Request failed: ${res.status}`);
        }

        const json = (await res.json()) as GenealogyResponse;

        if (!cancelled) {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const flow = useMemo(() => {
    if (!data) return null;
    return buildLayout(data.nodes, data.edges);
  }, [data]);

  const onNodeClick: NodeMouseHandler = (_evt, node) => {
    const id = String(node.id);
    window.open(`/listings/${encodeURIComponent(id)}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface p-5 text-sm text-slate-400">
        正在加载演化谱系...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
        加载失败：{error}
      </div>
    );
  }

  if (!flow || flow.nodes.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface p-5 text-sm text-slate-400">
        暂无可展示的谱系关系。
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface overflow-hidden">
      <div className="h-[420px]">
        <ReactFlow
          nodes={flow.nodes}
          edges={flow.edges}
          onNodeClick={onNodeClick}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} color="rgba(148, 163, 184, 0.18)" />
          <Controls />
        </ReactFlow>
      </div>
      <div className="px-5 py-4 border-t border-white/5 text-xs text-slate-500">
        点击节点将在新标签页打开对应 Listing。
      </div>
    </div>
  );
}
