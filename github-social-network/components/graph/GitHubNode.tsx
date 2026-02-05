"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { GitHubNodeData } from "@/types/graph";

const NODE_SIZE_ROOT = 40;
const NODE_SIZE_EXPANDED = 32;
const NODE_SIZE_DEFAULT = 26;

type GitHubNode = Node<GitHubNodeData, "github">;

function GitHubNodeComponent({ data }: NodeProps<GitHubNode>) {
  const { login, avatar_url, isRoot, expanded, isHovered, isDistanceUser, isInPath, mode } = data;

  // Determine size
  const size = isRoot ? NODE_SIZE_ROOT : expanded ? NODE_SIZE_EXPANDED : NODE_SIZE_DEFAULT;

  // Determine border color and width
  let borderColor = "#64748b";
  let borderWidth = 2;

  if (isRoot) {
    borderColor = "#8b5cf6";
    borderWidth = 3;
  } else if (expanded) {
    borderColor = "#3b82f6";
    borderWidth = 3;
  }

  if (mode === "distance") {
    if (isDistanceUser) {
      borderColor = "#f59e0b";
      borderWidth = 4;
    } else if (isInPath) {
      borderColor = "#22c55e";
      borderWidth = 3;
    }
  }

  if (isHovered) {
    borderColor = "#ec4899";
    borderWidth = 4;
  }

  const outerSize = size + borderWidth * 2;

  return (
    <div
      style={{
        width: outerSize,
        height: outerSize,
        transform: "translate(-50%, -50%)",
        position: "relative",
      }}
    >
      {/* Border circle */}
      <div
        style={{
          width: outerSize,
          height: outerSize,
          borderRadius: "50%",
          backgroundColor: borderColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.15s ease",
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "#fff",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar_url}
              alt={login}
              width={size - 2}
              height={size - 2}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                display: "block",
              }}
              draggable={false}
            />
          ) : (
            <span
              style={{
                fontSize: size / 2.5,
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              {(login || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Hover label */}
      {isHovered && login && (
        <div
          style={{
            position: "absolute",
            top: outerSize + 4,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(30, 41, 59, 0.95)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            padding: "2px 8px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {login}
        </div>
      )}

      {/* Invisible handles centered on node */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          opacity: 0,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1,
          height: 1,
          minWidth: 0,
          minHeight: 0,
          border: "none",
          background: "transparent",
        }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          opacity: 0,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1,
          height: 1,
          minWidth: 0,
          minHeight: 0,
          border: "none",
          background: "transparent",
        }}
        isConnectable={false}
      />
    </div>
  );
}

export const GitHubNode = memo(GitHubNodeComponent);
