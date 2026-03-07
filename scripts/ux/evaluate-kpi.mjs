#!/usr/bin/env node
import fs from "node:fs";

function pctDelta(after, baseline) {
  if (baseline === 0) return null;
  return ((after - baseline) / baseline) * 100;
}

function fmtPercent(value) {
  return `${value.toFixed(2)}%`;
}

function fmtMs(value) {
  return `${Math.round(value)}ms`;
}

function evaluate(input) {
  const rows = [];

  const firstInputDelta = pctDelta(input.after.firstInputRate, input.baseline.firstInputRate);
  rows.push({
    kpi: "First input completion rate",
    baseline: fmtPercent(input.baseline.firstInputRate * 100),
    after: fmtPercent(input.after.firstInputRate * 100),
    delta: firstInputDelta == null ? "N/A" : fmtPercent(firstInputDelta),
    target: ">= +20%",
    pass: firstInputDelta != null && firstInputDelta >= 20,
  });

  const timeDelta = pctDelta(input.after.timeToResultMs, input.baseline.timeToResultMs);
  rows.push({
    kpi: "Time to result (median)",
    baseline: fmtMs(input.baseline.timeToResultMs),
    after: fmtMs(input.after.timeToResultMs),
    delta: timeDelta == null ? "N/A" : fmtPercent(timeDelta),
    target: "<= -30%",
    pass: timeDelta != null && timeDelta <= -30,
  });

  const ctaDelta = pctDelta(input.after.ctaClickRate, input.baseline.ctaClickRate);
  rows.push({
    kpi: "CTA click rate",
    baseline: fmtPercent(input.baseline.ctaClickRate * 100),
    after: fmtPercent(input.after.ctaClickRate * 100),
    delta: ctaDelta == null ? "N/A" : fmtPercent(ctaDelta),
    target: ">= +15%",
    pass: ctaDelta != null && ctaDelta >= 15,
  });

  const bounceDelta = pctDelta(input.after.mobileBounceProxy, input.baseline.mobileBounceProxy);
  rows.push({
    kpi: "Mobile bounce proxy",
    baseline: fmtPercent(input.baseline.mobileBounceProxy * 100),
    after: fmtPercent(input.after.mobileBounceProxy * 100),
    delta: bounceDelta == null ? "N/A" : fmtPercent(bounceDelta),
    target: "<= -15%",
    pass: bounceDelta != null && bounceDelta <= -15,
  });

  return rows;
}

function printTable(rows) {
  const header = ["KPI", "Baseline", "After", "Delta", "Target", "Pass"];
  const data = rows.map((r) => [r.kpi, r.baseline, r.after, r.delta, r.target, r.pass ? "PASS" : "FAIL"]);
  const all = [header, ...data];
  const widths = header.map((_, col) => Math.max(...all.map((row) => String(row[col]).length)));

  const line = (row) => row.map((c, i) => String(c).padEnd(widths[i], " ")).join(" | ");

  console.log(line(header));
  console.log(widths.map((w) => "-".repeat(w)).join("-+-"));
  for (const row of data) {
    console.log(line(row));
  }
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/ux/evaluate-kpi.mjs <input.json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const input = JSON.parse(raw);
  const rows = evaluate(input);

  printTable(rows);

  const allPass = rows.every((r) => r.pass);
  console.log(`\nOverall: ${allPass ? "PASS" : "FAIL"}`);
  if (!allPass) process.exitCode = 2;
}

main();
