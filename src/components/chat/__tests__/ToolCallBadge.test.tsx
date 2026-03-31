import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor create shows Creating label", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/Button.tsx" }} state="call" />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing label", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "/src/Button.tsx" }} state="call" />);
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing label", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "insert", path: "/src/App.tsx" }} state="call" />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing label", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "view", path: "/src/index.tsx" }} state="call" />);
  expect(screen.getByText("Viewing index.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit label", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "undo_edit", path: "/src/Card.tsx" }} state="call" />);
  expect(screen.getByText("Undoing edit in Card.tsx")).toBeDefined();
});

test("file_manager delete shows Deleting label", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "delete", path: "/src/Old.tsx" }} state="call" />);
  expect(screen.getByText("Deleting Old.tsx")).toBeDefined();
});

test("file_manager rename shows Renaming label with new filename", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" }} state="call" />);
  expect(screen.getByText("Renaming to New.tsx")).toBeDefined();
});

test("unknown tool falls back to raw tool name", () => {
  render(<ToolCallBadge toolName="unknown_tool" args={{}} state="call" />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("in-progress state renders spinner", () => {
  const { container } = render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/A.tsx" }} state="call" />);
  expect(container.querySelector(".animate-spin")).toBeTruthy();
  expect(container.querySelector(".bg-emerald-500")).toBeFalsy();
});

test("completed state renders green dot", () => {
  const { container } = render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/A.tsx" }} state="result" result="Success" />);
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeFalsy();
});
