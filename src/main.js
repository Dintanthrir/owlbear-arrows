import OBR, { buildLine, buildPath, Command, Math2, MathM } from "@owlbear-rodeo/sdk";
import { LineBuilder } from "@owlbear-rodeo/sdk/lib/builders/LineBuilder";

const ID = "com.zalambar.owlbear.arrows";

function createTool() {
  OBR.tool.create({
    id: `${ID}/tool`,
    icons: [
      {
        icon: "/arrow.svg",
        label: "Arrows",
      },
    ],
    shortcut: "A",
    defaultMetadata: {
      strokeColor: "#1a6aff",
      strokeWidth: "4",
    },
  });
}

function arrowCommands(originPosition, endPosition, strokeWidth) {
  const lineSize = 50 + parseInt(strokeWidth);

  let rotation = Math.atan((endPosition.y - originPosition.y)/(endPosition.x - originPosition.x))*180/Math.PI;
  if (endPosition.x < originPosition.x) {
    rotation += 180;
  }
  const barb1 = Math2.rotate({x: endPosition.x - lineSize, y: endPosition.y + lineSize}, endPosition, rotation)
  const barb2 = Math2.rotate({x: endPosition.x - lineSize, y: endPosition.y - lineSize}, endPosition, rotation)

  return [
    [Command.MOVE, originPosition.x, originPosition.y], 
    [Command.LINE, endPosition.x, endPosition.y], 
    [Command.MOVE, barb1.x, barb1.y],
    [Command.LINE, endPosition.x, endPosition.y],
    [Command.MOVE, barb2.x, barb2.y],
    [Command.LINE, endPosition.x, endPosition.y],
    [Command.CLOSE]
  ];
}

function createMode() {
  let interaction = null;
  let strokeColor = "#1a6aff";
  let strokeWidth = "4";
  OBR.tool.createMode({
    id: `${ID}/mode`,
    icons: [
      {
        icon: "/arrow.svg",
        label: "Line",
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    cursors: [{cursor: "crosshair"}],
    async onToolDragStart(context, event) {
      // Get the stroke color from the tools metadata
      if (typeof context.metadata.strokeColor === "string") {
        strokeColor = context.metadata.strokeColor;
      }
      if (typeof context.metadata.strokeWidth === "string") {
        strokeWidth = context.metadata.strokeWidth;
      }
      const line = buildLine()
        .startPosition(event.pointerPosition)
        .endPosition(event.pointerPosition)
        .strokeColor(strokeColor)
        .strokeWidth(strokeWidth)
        .build();
      // Start an interaction with the new line
      interaction = await OBR.interaction.startItemInteraction(line);
    },
    onToolDragMove(_, event) {
      // Update the end position of the interaction when the tool drags
      if (interaction) {
        const [update] = interaction;
        update((line) => {
          line.endPosition = event.pointerPosition;
        });
      }
    },
    onToolDragEnd(_, event) {
      if (interaction) {
        const [update, stop] = interaction;
        const line = update((line) => {
          line.endPosition = event.pointerPosition;
        });
        const path = buildPath()
          .strokeColor(strokeColor)
          .strokeWidth(strokeWidth)
          .commands(arrowCommands(line.startPosition, event.pointerPosition, strokeWidth))
          .build();
        OBR.scene.items.addItems([path]);
        stop();
      }
      interaction = null;
    },
    onToolDragCancel() {
      // Stop the interaction early if we cancel the drag
      // This can happen if the user presses `esc` in the middle
      // of a drag operation
      if (interaction) {
        const [_, stop] = interaction;
        stop();
      }
      interaction = null;
    },
  });
}

function createAction() {
  OBR.tool.createAction({
    id: `${ID}/action`,
    icons: [
      {
        icon: "/icon.svg",
        label: "Color",
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    onClick(_, elementId) {
      OBR.popover.open({
        id: `${ID}/style-picker`,
        height: 224,
        width: 180,
        url: "/style-picker.html",
        anchorElementId: elementId,
        anchorOrigin: {
          horizontal: "CENTER",
          vertical: "BOTTOM",
        },
        transformOrigin: {
          horizontal: "CENTER",
          vertical: "TOP",
        },
      });
    },
  });
}

OBR.onReady(() => {
  createTool();
  createMode();
  createAction();
});