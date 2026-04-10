let jammedUUID = "";

export function initEjectPowerCoresHooks() {
  // Intercept chat messages and inject the link
  Hooks.on("preCreateChatMessage", (message, data, options, userId) => {
    // Only process the message if the current user is the one creating it
    if (userId !== game.user.id) return;

    const isEjectPowerCores = message.content.includes(
      "INVADE :: Eject Power Cores",
    );
    if (!isEjectPowerCores) return;

    // Cache UUIDs for the conditions to make them clickable/draggable
    if (!jammedUUID) {
      const packKey = "world.status-items";
      const pack = game.packs.get(packKey);

      if (pack) {
        const indexEntry = pack.index.getName("Jammed");
        if (indexEntry) {
          // Construct the UUID that Foundry uses to generate drag-and-drop links
          jammedUUID = `Compendium.${packKey}.Item.${indexEntry._id}`;
          console.log(`Lancer Automation | Cached Jammed UUID: ${jammedUUID}`);
        } else {
          console.warn(
            `Lancer Automation | "Jammed" not found in pack ${packKey}`,
          );
        }
      }
    }

    let content = message.content || "";
    // Check if this is the Eject Power Cores message and there is a jammedUUID.
    if (isEjectPowerCores && jammedUUID) {
      // Replace the whole word "Jammed" with the Foundry link tag
      const updatedContent = content.replace(
        "Jammed",
        `@UUID[${jammedUUID}]{Jammed}`,
      );

      // If a replacement was made, update the message source before it saves to the database
      if (updatedContent !== content) {
        message.updateSource({ content: updatedContent });
      }
    }
  });
}
