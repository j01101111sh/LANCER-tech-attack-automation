// ==========================================
// 1. PRE-CREATE HOOK: Save the Targets
// ==========================================
Hooks.on("preCreateChatMessage", (message, data, options, userId) => {
    if (game.system.id !== "lancer" || userId !== game.user.id) return;

    const isTechAttack = message.flags?.lancer?.attackData?.invade || 
                         (message.content && message.content.toLowerCase().includes("attack vs e-def"));
    if (!isTechAttack) return;

    const speakerId = data.speaker?.actor;
    if (!speakerId) return;
    const actor = game.actors.get(speakerId);
    if (!actor) return;

    const hasDataSiphon = actor.items.some(i => 
        i.name.toLowerCase() === "chomolungma" || 
        i.name.toLowerCase() === "data siphon"
    );
    if (!hasDataSiphon) return;

    const targetIds = Array.from(game.user.targets).map(t => t.id);
    if (targetIds.length === 0) return;

    message.updateSource(foundry.utils.expandObject({
        "flags.LANCER-tech-attack-automation.dataSiphonTargetIds": targetIds
    }));
    console.log(message)
});

// ==========================================
// 2. RENDER HOOK: Inject the Button
// ==========================================
Hooks.on("renderChatMessage", (message, html, data) => {
    console.log(message)
    const targetIds = message.getFlag("LANCER-tech-attack-automation", "dataSiphonTargetIds");
    if (!targetIds || targetIds.length === 0) return;

    const buttonHtml = `
        <div class="lancer data-siphon-container" style="margin-top: 5px; border-top: 1px solid var(--color-border-dark); padding-top: 5px;">
            <button class="data-siphon-btn" style="background: rgba(0, 255, 100, 0.1); border: 1px solid #00ff64; color: var(--color-text-light-highlight);">
                <i class="fas fa-satellite-dish"></i> Execute Data Siphon
            </button>
        </div>
    `;

    html.find('.message-content').append(buttonHtml);

    html.find('.data-siphon-btn').click(async (ev) => {
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
});
