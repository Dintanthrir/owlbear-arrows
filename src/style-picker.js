import OBR from "@owlbear-rodeo/sdk";

const ID = "com.zalambar.owlbear.arrows";

const colors = [
  "#1a6aff",
  "#ff7433",
  "#ff4d4d",
  "#ffd433",
  "#B07126",
  "#884dff",
  "#85ff66",
  "#519E00",
  "#eb8aff",
  "#44e0f1",
  "#222222",
  "#5a5a5a",
  "#b3b3b3",
  "#ffffff",
  "#0e0f16"
];

function createPickers(strokeColor, strokeWidth) {
  document.querySelector("#app").innerHTML = `
  <ul class="ButtonsList">
    <div class="ColorButtonRow">
      <div class="ColorButtonColumn">
        <div class="ColorButtonGroup">
          ${
            colors.map((color) => {
              return `
              <button class="ColorButton" value="${color}">
                <div class="ColorFill" style="background: ${color}"></div>
              </button>
              `
            })
            .join("")
          }
        </div>
      </div>
    </div>
  </ul>
  <hr />
  <div class="StrokeSettings">
    <img src="/stroke-width.svg" />
    <input id="strokeWidth" type="range" min="1" max="150" name="Stroke Width" value="${strokeWidth}"/>
  </div>
  `;
}

function setupColorPicker(elements) {
  const updateColor = (event) => {
    const color = window.getComputedStyle(event.target).backgroundColor;
    OBR.tool.setMetadata(`${ID}/tool`, { strokeColor: color });
  };
  elements.forEach((element) => {
    element.addEventListener("click", updateColor);
  })
}

function setupWidthSlider(element) {
  const updateWidth = (event) => {
    OBR.tool.setMetadata(`${ID}/tool`, { strokeWidth: event.target.value })
  };
  element.addEventListener("input", updateWidth);
}

OBR.onReady(async () => {
  // Get the current stroke color as the default value for the select
  const metadata = await OBR.tool.getMetadata(`${ID}/tool`);
  let strokeColor = colors[0];
  let strokeWidth = "4";
  if (typeof metadata.strokeColor === "string") {
    strokeColor = metadata.strokeColor;
  }
  if (typeof metadata.strokeWidth === "string") {
    strokeWidth = metadata.strokeWidth;
  }
  createPickers(strokeColor, strokeWidth);
  setupColorPicker(document.querySelectorAll(".ColorButton"));
  setupWidthSlider(document.querySelector("#strokeWidth"))
});