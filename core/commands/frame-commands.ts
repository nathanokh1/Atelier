import { Cel, Frame, LayerGraph, PixelSettings } from "../layer-graph";
import { Command } from "./command";

/** Show a different frame. The renderer redraws because layer sources swap. */
export class SetActiveFrameCommand implements Command {
  readonly label = "Change frame";
  private previous: string | null = null;

  constructor(private readonly frameId: string) {}

  execute(graph: LayerGraph): void {
    if (this.previous === null) this.previous = graph.getActiveFrameId();
    graph.setActiveFrame(this.frameId);
  }

  undo(graph: LayerGraph): void {
    if (this.previous) graph.setActiveFrame(this.previous);
  }
}

/** Insert an empty frame after the active one. */
export class AddFrameCommand implements Command {
  readonly label = "Add frame";
  private frame: Frame | null = null;
  private index = 0;
  private cels: Cel[] = [];

  execute(graph: LayerGraph): void {
    if (this.frame) {
      graph.restoreFrame(this.frame, this.index, this.cels);
      return;
    }
    const before = graph.getFrames().length;
    const id = graph.addFrame();
    this.frame = graph.getFrames().find((f) => f.id === id) ?? null;
    this.index = graph.getFrames().findIndex((f) => f.id === id);
    this.cels = graph.getCels().filter((c) => c.frameId === id).map((c) => ({ ...c }));
    if (graph.getFrames().length === before) this.frame = null;
  }

  undo(graph: LayerGraph): void {
    if (this.frame) graph.deleteFrame(this.frame.id);
  }
}

export class SetPixelSettingsCommand implements Command {
  readonly label = "Pixel view";
  private before: PixelSettings | null = null;
  private captured = false;

  constructor(private readonly after: PixelSettings) {}

  execute(graph: LayerGraph): void {
    if (!this.captured) {
      this.before = graph.getPixelSettings();
      this.captured = true;
    }
    graph.setPixelSettings(this.after);
  }

  undo(graph: LayerGraph): void {
    graph.setPixelSettings(this.before);
  }
}

export class DeleteFrameCommand implements Command {
  readonly label = "Delete frame";
  private removed: { frame: Frame; index: number; cels: Cel[] } | null = null;

  constructor(private readonly frameId: string) {}

  execute(graph: LayerGraph): void {
    this.removed = graph.deleteFrame(this.frameId) ?? this.removed;
  }

  undo(graph: LayerGraph): void {
    if (this.removed) graph.restoreFrame(this.removed.frame, this.removed.index, this.removed.cels);
  }
}
