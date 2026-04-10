let impairedUUID = "";
let slowedUUID = "";

export function initFragmentSignalHooks() {
  Hooks.on("preCreateChatMessage", (message, data, options, userId) => {
    // Only process the message if the current user is the one creating it
    if (userId !== game.user.id) return;
    // Determine if this is a basic tech attack/invade
    if (!message.content.includes("INVADE :: TECH ATTACK")) return;

    // Cache UUIDs for the conditions to make them clickable/draggable
    if (!impairedUUID || !slowedUUID) {
      const packKey = "world.status-items";
      const pack = game.packs.get(packKey);

      if (pack) {
        if (!impairedUUID) {
          const impairedEntry = pack.index.getName("Impaired");
          if (impairedEntry)
            impairedUUID = `Compendium.${packKey}.Item.${impairedEntry._id}`;
        }
        if (!slowedUUID) {
          const slowedEntry = pack.index.getName("Slowed");
          if (slowedEntry)
            slowedUUID = `Compendium.${packKey}.Item.${slowedEntry._id}`;
        }
      }
    }

    // Exclude appending if the text is already there to prevent infinite loops / duplicates
    if (!message.content.includes("Fragment Signal")) {
      // Determine if we have valid Compendium links, fallback to bold text if not
      const impairedText = impairedUUID
        ? `@UUID[${impairedUUID}]{Impaired}`
        : "<strong>Impaired</strong>";
      const slowedText = slowedUUID
        ? `@UUID[${slowedUUID}]{Slowed}`
        : "<strong>Slowed</strong>";

      const fragmentSignalHTML = `
        <div class="lancer-fragment-signal" style="margin-top: 5px; border-top: 1px solid var(--color-border-dark); padding-top: 5px;">
            <p style="margin: 0;"><strong>INVADE :: Fragment Signal</strong></p>
            <p style="margin: 0; font-size: 0.9em;">You feed false targeting data, phantom enemies, and rogue code into the target. They become ${impairedText} and ${slowedText} until the end of their next turn.</p>
        </div>
      `;

      // Update the message source before it saves to the database
      message.updateSource({ content: message.content + fragmentSignalHTML });
    }
  });
}
