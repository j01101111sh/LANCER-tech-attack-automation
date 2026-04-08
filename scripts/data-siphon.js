// HOOK 1: Catch the Tech Attack and message the GM
Hooks.on("createChatMessage", (message) => {
    // Validate system and author
    if (game.system.id !== "lancer" || !message.isAuthor) return;

    // Ensure valid actor
    const speakerId = message.speaker.actor;
    if (!speakerId) return;
    const actor = game.actors.get(speakerId);
    if (!actor) return;

    // Verify Chomolungma or Data Siphon
    const hasDataSiphon = actor.items.some(i => 
        i.name.toLowerCase() === "chomolungma" || 
        i.name.toLowerCase() === "data siphon"
    );
    if (!hasDataSiphon) return;

    // Verify Tech Attack
    const isTechAttack = message.flags?.lancer?.attackData?.invade || 
                         (message.content && message.content.toLowerCase().includes("ATTACK VS E-DEF"));
    if (!isTechAttack) return;

    // Get targets
    const targets = Array.from(game.user.targets);
    if (targets.length === 0) return;

    // Build whisper for GM approval
    targets.forEach(target => {
        const tActor = target.actor;
        if (!tActor) return;

        let gmContent = `
            <div class="lancer">
                <div class="message-content">
                    <h3 style="text-align:center; border-bottom: 1px solid white;">Data Siphon Triggered</h3>
                    <p><b>${actor.name}</b> is attempting to Scan <b>${tActor.name}</b>.</p>
                    <button class="data-siphon-approve" data-target-uuid="${tActor.uuid}" data-player-id="${game.user.id}">
                        Approve & Send Scan Data
                    </button>
                </div>
            </div>
        `;

        ChatMessage.create({
            blind: true,
            content: gmContent,
            whisper: game.users?.filter(u => u.isGM).map(u => u.id),

        });
    });
});

// HOOK 2: Listen for the GM clicking the approval button
Hooks.on("renderChatMessage", (message, html, data) => {
    // Only the GM should be able to execute this script
    if (!game.user.isGM) return;

    html.find('.data-siphon-approve').click(async (ev) => {
        ev.preventDefault();
        const btn = ev.currentTarget;
        
        // Prevent double-clicking
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerText = "Scan Data Sent!";
        console.log(btn)
        const targetUuid = btn.dataset.targetUuid;
        const tActor = await fromUuid(targetUuid);

        if (!tActor) {
            ui.notifications.error("Data Siphon: Could not locate target actor data.");
            return;
        }
        // Run Scan macro from LANCER core
        game.macros.getName("Scan").execute();
    });
});
