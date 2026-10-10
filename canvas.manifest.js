export const manifest = {
  screens: {
    scr_s2j1d4: { name: "Home", route: "/", position: {"x":160,"y":1820} },
    scr_c45e0u: { name: "Live Control – Ready", route: "/live", position: {"x":160,"y":3800} },
    scr_99w29n: { name: "Live Control – Tracking", route: "/live", state: {"sessionStatus":"running"}, position: {"x":1560,"y":3800} },
    scr_chl6ay: { name: "Live Control – Paused", route: "/live", state: {"sessionStatus":"paused"}, position: {"x":2960,"y":3800} },
    scr_jvmxw5: { name: "Calibration – Permissions", route: "/calibration", state: {"calibrationStep":0}, position: {"x":160,"y":5780} },
    scr_nvx4do: { name: "Calibration – Position", route: "/calibration", state: {"calibrationStep":1}, position: {"x":1560,"y":5780} },
    scr_1j9x3z: { name: "Calibration – Directions", route: "/calibration", state: {"calibrationStep":2}, position: {"x":2960,"y":5780} },
    scr_c2tsc0: { name: "Calibration – Sensitivity", route: "/calibration", state: {"calibrationStep":3}, position: {"x":4360,"y":5780} },
    scr_v1adb4: { name: "Calibration – Test", route: "/calibration", state: {"calibrationStep":4}, position: {"x":5760,"y":5780} },
    scr_tcgorv: { name: "Calibration – Complete", route: "/calibration", state: {"calibrationStep":5}, position: {"x":7160,"y":5780} },
    scr_g8zeav: { name: "Voice Commands", route: "/voice", position: {"x":160,"y":7760} },
    scr_99crmq: { name: "Settings", route: "/settings", position: {"x":160,"y":9740} },
    scr_8ag5x6: { name: "Performance – Sample data", route: "/performance", position: {"x":160,"y":11720} },
    scr_vznc51: { name: "Performance – Measured", route: "/performance", state: {"performanceMode":"measured"}, position: {"x":1560,"y":11720} },
    scr_teg8hf: { name: "Design System", route: "/design-system", position: {"x":0,"y":0}, isDefaultRow: true },
    scr_lag8gz: { name: "Extension Popup", route: "/popup", position: {"x":1400,"y":0}, isDefaultRow: true },
  },
  sections: {
    sec_c6mjnz: { name: "Home", x: 0, y: 1600, width: 1520, height: 1180 },
    sec_lgy1b4: { name: "Live Control", x: 0, y: 3580, width: 4320, height: 1180 },
    sec_9xwysp: { name: "Calibration", x: 0, y: 5560, width: 8520, height: 1180 },
    sec_cy2zan: { name: "Voice Commands", x: 0, y: 7540, width: 1520, height: 1180 },
    sec_4cu1v1: { name: "Settings", x: 0, y: 9520, width: 1520, height: 1180 },
    sec_i9rite: { name: "Performance", x: 0, y: 11500, width: 2920, height: 1180 },
  },
  layers: [
    { kind: "screen", id: "scr_teg8hf" },
    { kind: "screen", id: "scr_lag8gz" },
    { kind: "section", id: "sec_c6mjnz", children: [
      { kind: "screen", id: "scr_s2j1d4" },
    ] },
    { kind: "section", id: "sec_lgy1b4", children: [
      { kind: "screen", id: "scr_c45e0u" },
      { kind: "screen", id: "scr_99w29n" },
      { kind: "screen", id: "scr_chl6ay" },
    ] },
    { kind: "section", id: "sec_9xwysp", children: [
      { kind: "screen", id: "scr_jvmxw5" },
      { kind: "screen", id: "scr_nvx4do" },
      { kind: "screen", id: "scr_1j9x3z" },
      { kind: "screen", id: "scr_c2tsc0" },
      { kind: "screen", id: "scr_v1adb4" },
      { kind: "screen", id: "scr_tcgorv" },
    ] },
    { kind: "section", id: "sec_cy2zan", children: [
      { kind: "screen", id: "scr_g8zeav" },
    ] },
    { kind: "section", id: "sec_4cu1v1", children: [
      { kind: "screen", id: "scr_99crmq" },
    ] },
    { kind: "section", id: "sec_i9rite", children: [
      { kind: "screen", id: "scr_8ag5x6" },
      { kind: "screen", id: "scr_vznc51" },
    ] },
  ],
}
