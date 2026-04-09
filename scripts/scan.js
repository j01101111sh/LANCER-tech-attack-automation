/**
 * Executes a Lancer Scan action on a single target and outputs the results to chat.
 * @param {Object} target - A single target/token object to be scanned.
 */
export function performScan(target) {
    if (!target || !target.actor) return;

    // Helper functions
    function sort_features(a, b) {
        return (b.system.origin?.base || 0) - (a.system.origin?.base || 0);
    }

    function construct_features(items, origin) {
        let sc_list = `<p><strong>${origin}</strong></p>`;
        let sc_features = items.filter(f => f.system.origin?.name === origin).sort(sort_features);
        
        sc_features.forEach(i => {
            let sc_name = ``;
            let sc_desc = ``;
            
            if (i.system.origin?.name === "EXOTIC" && !i.system.origin?.base) {
                sc_name = '<code class="horus--subtle">UNKNOWN EXOTIC SYSTEM</code>';
                sc_desc = "???";
            } else {
                sc_name = i.name;
                sc_desc = i.system.effect ? i.system.effect : "No description given.";
                if (i.system.trigger) sc_desc = `<em>Trigger: ${i.system.trigger}</em><br>${sc_desc}`;
            }
            sc_list += `<details style="margin-left: 10px;"><summary>${sc_name}</summary><p style="margin-top:5px; font-size:0.9em;">${sc_desc}</p></details>`;
        });
        return sc_list;
    }

    function construct_templates(items) {
        if (!items || items.length === 0) return "<p>NONE</p>";
        return items.map(i => `<p style="margin-bottom:0;">${i.name}</p>`).join('') + "<br>";
    }

    let actor = target.actor;
    let items = actor.items;
    
    // Construct HTML Tables
    let hase_table_html = `
    <table style="text-align: center;">
      <tr><th>HULL</th><th>AGI</th><th>SYS</th><th>ENG</th></tr>
      <tr>
        <td>${actor.system.hull || 0}</td>
        <td>${actor.system.agi || 0}</td>
        <td>${actor.system.sys || 0}</td>
        <td>${actor.system.eng || 0}</td>
      </tr>
    </table>`;
    
    let stat_table_html = `
    <table style="text-align: center;">
      <tr><th>Armor</th><th>HP</th><th>Heat</th><th>Speed</th></tr>
      <tr>
        <td>${actor.system.armor || 0}</td>
        <td>${actor.system.hp?.value || 0}/${actor.system.hp?.max || 0}</td>
        <td>${actor.system.heat?.value || 0}/${actor.system.heat?.max || 0}</td>
        <td>${actor.system.speed || 0}</td>
      </tr>
      <tr><th>Evasion</th><th>E-Def</th><th>Save</th><th>Sensors</th></tr>
      <tr>
        <td>${actor.system.evasion || 0}</td>
        <td>${actor.system.edef || 0}</td>
        <td>${actor.system.save || 0}</td>
        <td>${actor.system.sensor_range || 0}</td>
      </tr>
      <tr><th>Size</th><th>Activ</th><th>Struct</th><th>Stress</th></tr>
      <tr>
        <td>${actor.system.size || 1}</td>
        <td>${actor.system.activations || 1}</td>
        <td>${actor.system.structure?.value || 0}/${actor.system.structure?.max || 0}</td>
        <td>${actor.system.stress?.value || 0}/${actor.system.stress?.max || 0}</td>
      </tr>
    </table>`;

    // Process NPC Classes, Templates, and Features
    const classes = items.filter(i => i.is_npc_class && i.is_npc_class());
    let sc_class = !classes || classes.length === 0 ? "NONE" : classes[0].name;
    let sc_tier = actor.system.tier || 1;
    
    const templates = items.filter(i => i.is_npc_template && i.is_npc_template());
    let sc_templates = construct_templates(templates);
    
    let sc_list = ``;
    const features = items.filter(i => i.is_npc_feature && i.is_npc_feature());
    
    if (!features || features.length === 0) {
        sc_list += "<p>NONE</p>";
    } else {
        let sc_origins = [];
        features.forEach(f => {
            let origin = f.system.origin?.name;
            if (origin && !sc_origins.includes(origin)) sc_origins.push(origin);
        });
        sc_origins.forEach(origin => {
            sc_list += construct_features(features, origin);
        });
    }

    // Whisper the final Scan chat card directly to the user who clicked the button
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ alias: "Data Siphon System" }),
        content: `
            <div class="lancer">
                <h2 style="border-bottom: 1px solid white;">Scan Results: ${actor.name}</h2>
                <h3>Class: ${sc_class}, Tier ${sc_tier}</h3>
                ${hase_table_html}
                ${stat_table_html}
                <hr>
                <h3>Templates:</h3>
                ${sc_templates}
                <hr>
                <h3>Systems & Weapons:</h3>
                ${sc_list}
            </div>
        `,
        whisper: [game.user.id]
    });
}