import { initDataSiphonHooks } from "./data-siphon.js";
import { initEjectPowerCoresHooks } from "./eject-power-cores.js";

/* ------------------------------------ */
/* Initialize Module                    */
/* ------------------------------------ */
Hooks.once("init", async function () {
  console.log("LANCER Tech Attack Automation | Module initialized");
});

/* ------------------------------------ */
/* When Ready                           */
/* ------------------------------------ */
Hooks.once("ready", function () {
  console.log(
    "LANCER Tech Attack Automation | Ready! Firing up automation hooks.",
  );

  // 2. Call the imported functions to activate their event listeners
  initDataSiphonHooks();
  initEjectPowerCoresHooks();
  console.log("finished ready");
});
