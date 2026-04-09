import { performScan } from "./scan.js";

// ==========================================
// 1. PRE-CREATE HOOK: Save the Targets
// ==========================================
Hooks.on("preCreateChatMessage", (message, data, options, userId) => {
    if (game.system.id !== "lancer" || userId !== game.user.id) return;

    const isTechAttack = message.getFlag("lancer", "attackData.invade") || 
                         (message.content && message.content.toLowerCase().includes("tech atk"));
    if (!isTechAttack) return;

    const speakerId = message.speaker?.actor;
    if (!speakerId) {
        console.warn("Lancer Tech Attack Automation | No speaker actor found, aborting.");
        return;
    }

    const actor = game.actors.get(speakerId);
    if (!actor) return;

    const hasDataSiphon = actor.items.some(i => 
        i.name.toLowerCase() === "chomolungma" || 
        i.name.toLowerCase() === "data siphon"
    );
    if (!hasDataSiphon) return;

    const targetIds = Array.from(game.user.targets).map(t => t.id);
    if (targetIds.length === 0) {
        console.warn("Lancer Tech Attack Automation | No targets selected, aborting.");
        return;
    }

    message.updateSource({
        flags: {
            "lancer-tech-attack-automation": {
                dataSiphonTargetIds: targetIds
            }
        }
    });
    console.log("Lancer Tech Attack Automation | Flag set successfully:", message._source.flags["lancer-tech-attack-automation"]);
});

// ==========================================
// 2. RENDER HOOK: Inject the Button
// ==========================================
Hooks.on("renderChatMessage", (message, html, data) => {
    const targetIds = message.getFlag("lancer-tech-attack-automation", "dataSiphonTargetIds");
    if (!targetIds || targetIds.length === 0) return;

    const buttonHtml = `
        <div class="lancer data-siphon-container" style="margin-top: 5px; border-top: 1px solid var(--color-border-dark); padding-top: 5px;">
            <button class="data-siphon-btn flow-button lancer-button">
                <i class="fas fa-satellite-dish"></i> Execute Data Siphon
            </button>
        </div>
    `;

  const messageContent = html[0]?.querySelector('.message-content') || html.querySelector('.message-content');
  if (messageContent) {
      messageContent.insertAdjacentHTML('beforeend', buttonHtml);
  }

  const btn = html[0]?.querySelector('.data-siphon-btn') || html.querySelector('.data-siphon-btn');
  if (btn) {
    btn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const btn = ev.currentTarget;
        
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Scanning...`;

        for (let id of targetIds) {
            const token = canvas.tokens.get(id);
            if (token) {
                performScan(token);
            } else {
                ui.notifications.warn("Data Siphon: Target token is no longer on the current scene.");
            }
        }
        
        btn.innerHTML = `<i class="fas fa-check"></i> Scan Complete`;
    });
  }
});
