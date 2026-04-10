let proneUUID = "";
let immobilizedUUID = "";

export function initBalanceControlLockoutHooks() {
  Hooks.on("preCreateChatMessage", (message, data, options, userId) => {
    // Only process the message if the current user is the one creating it
    if (userId !== game.user.id) return;
    // Determine if this is a balance control lockout
    const isBalanceControlLockout = message.content.includes(
      "INVADE :: Balance Control Lockout",
    );
    if (!isBalanceControlLockout) return;

    // Cache UUIDs for the conditions to make them clickable/draggable
    const packKey = "world.status-items";
    const pack = game.packs.get(packKey);

    if (pack) {
      if (!proneUUID) {
        const ProneEntry = pack.index.getName("Prone");
        if (ProneEntry)
          proneUUID = `Compendium.${packKey}.Item.${ProneEntry._id}`;
      }
      if (!immobilizedUUID) {
        const immobilizedEntry = pack.index.getName("Immobilized");
        if (immobilizedEntry)
          immobilizedUUID = `Compendium.${packKey}.Item.${immobilizedEntry._id}`;
      }
    }

    if (proneUUID && immobilizedUUID) {
      // Replace the whole word "Prone" with the Foundry link tag
      let updatedContent = message.content.replace(
        "Prone",
        `@UUID[${proneUUID}]{Prone}`,
      );

      // Replace the whole word "Immobilized" with the Foundry link tag
      updatedContent = updatedContent.replace(
        "Immobilized",
        `@UUID[${immobilizedUUID}]{Immobilized}`,
      );

      // If a replacement was made, update the message source before it saves to the database
      if (updatedContent !== message.content) {
        message.updateSource({ content: updatedContent });
      }
    }
  });
}
