import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch current listing with parent and children
    const currentListing = await prisma.listing.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
      },
    });

    if (!currentListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const nodes = [];
    const edges = [];

    // 2. Add current node
    nodes.push({
      id: currentListing.id,
      data: {
        label: currentListing.title,
        type: "current",
        creatorId: currentListing.creatorId,
      },
    });

    // 3. Add parent node and edge (Parent -> Current)
    if (currentListing.parent) {
      nodes.push({
        id: currentListing.parent.id,
        data: {
          label: currentListing.parent.title,
          type: "parent",
          creatorId: currentListing.parent.creatorId,
        },
      });

      edges.push({
        id: `e-${currentListing.parent.id}-${currentListing.id}`,
        source: currentListing.parent.id,
        target: currentListing.id,
      });
    }

    // 4. Add children nodes and edges (Current -> Child)
    if (currentListing.children && currentListing.children.length > 0) {
      currentListing.children.forEach((child) => {
        nodes.push({
          id: child.id,
          data: {
            label: child.title,
            type: "child",
            creatorId: child.creatorId,
          },
        });

        edges.push({
          id: `e-${currentListing.id}-${child.id}`,
          source: currentListing.id,
          target: child.id,
        });
      });
    }

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error("[GET /api/listings/[id]/genealogy]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
