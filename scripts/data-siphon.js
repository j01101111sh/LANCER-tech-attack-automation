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
    const isTechAttack = message.flags?.lancer?.roll?.type === "tech" || 
                         (message.content && message.content.toLowerCase().includes("tech attack"));
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
            speaker: ChatMessage.getSpeaker({ alias: "Data Siphon System" }),
            content: gmContent,
            whisper: ChatMessage.getWhisperRecipients("GM").map(u => u.id)
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

        const targetUuid = btn.dataset.targetUuid;
        const playerId = btn.dataset.playerId;
        const tActor = await fromUuid(targetUuid);

        if (!tActor) {
            ui.notifications.error("Data Siphon: Could not locate target actor data.");
            return;
        }

        // Fetch stats
        const sys = tActor.system;
        const hp = sys.derived?.hp?.value ?? sys.hp?.value ?? "?";
        const maxHp = sys.derived?.hp?.max ?? sys.hp?.max ?? "?";
        const heat = sys.derived?.heat?.value ?? sys.heat?.value ?? "?";
        const maxHeat = sys.derived?.heat?.max ?? sys.heat?.max ?? "?";
        const evasion = sys.derived?.evasion ?? sys.evasion ?? "?";
        const edef = sys.derived?.edef ?? sys.edef ?? "?";
        const speed = sys.derived?.speed ?? sys.speed ?? "?";
        const armor = sys.derived?.armor ?? sys.armor ?? "?";

        // Construct HTML Chat Card for the Player
        let playerContent = `
            <div class="lancer">
                <div class="message-content">
                    <h3 style="text-align:center; border-bottom: 1px solid white;">Data Siphon: Scan Complete</h3>
                    <p><strong>Target:</strong> ${tActor.name}</p>
                    <p><strong>HP:</strong> ${hp} / ${maxHp} | <strong>Armor:</strong> ${armor}</p>
                    <p><strong>Heat:</strong> ${heat} / ${maxHeat}</p>
                    <p><strong>Evasion:</strong> ${evasion} | <strong>E-Defense:</strong> ${edef}</p>
                    <p><strong>Speed:</strong> ${speed}</p>
                    <p style="font-size: 0.85em; color: #aaa;"><em>Target's Weapons, Systems, and Traits are now known.</em></p>
                </div>
            </div>
        `;

        // Send the data back to the attacking player
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ alias: "Data Siphon System" }),
            content: playerContent,
            whisper: [playerId]
        });
    });
});
