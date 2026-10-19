import { contrastRatio, wcag } from "./contrast.js";

const foreground = document.querySelector("#foreground");
const background = document.querySelector("#background");
const sample = document.querySelector("#sample");
const ratio = document.querySelector("#ratio");
const result = document.querySelector("#result");

function update() {
  const value = contrastRatio(foreground.value, background.value);
  const pass = wcag(value);
  sample.style.color = foreground.value;
  sample.style.background = background.value;
  ratio.textContent = `${value.toFixed(2)}:1`;
  result.textContent = `Normal text: AA ${pass.normalAA ? "pass" : "fail"}, AAA ${pass.normalAAA ? "pass" : "fail"} · Large text: AA ${pass.largeAA ? "pass" : "fail"}, AAA ${pass.largeAAA ? "pass" : "fail"}`;
}

foreground.addEventListener("input", update);
background.addEventListener("input", update);
update();
