(function () {
  "use strict";

  const levels = [
    {
      name: "Safe Practice",
      behavior: "Use the week's communication skill once with your coach or someone you deeply trust.",
      meaning: "Make the skill feel usable before adding social pressure.",
      actions: ["Choose your safest listener", "Use the weekly skill once", "Stop after the attempt and notice what happened"],
      starter: "I want to practice one short answer...",
      practice: "Rehearse the weekly skill once in the Speaker's Gym app before the conversation.",
      community: "Optionally share that you completed your first low-pressure attempt.",
      evidence: "The weekly skill was attempted once in a safe setting."
    },
    {
      name: "Familiar One-to-One",
      behavior: "Use the week's communication skill once in a relaxed conversation with a familiar person.",
      meaning: "Transfer the skill into real life without making the situation itself demanding.",
      actions: ["Choose a familiar person", "Wait for a natural opening", "Use the weekly skill once"],
      starter: "I want to share one thought...",
      practice: "Practice one short version in the app, then let the real wording change.",
      community: "Optionally share what felt different when the skill entered a real conversation.",
      evidence: "The weekly skill was used once in a familiar one-to-one conversation."
    },
    {
      name: "Familiar Colleague",
      behavior: "Use the week's communication skill once with a colleague you already feel comfortable around.",
      meaning: "Introduce a small amount of professional visibility while keeping the relationship familiar.",
      actions: ["Choose a supportive colleague", "Choose a routine topic", "Use the weekly skill once"],
      starter: "My view is...",
      practice: "Prepare one concise response in the app using this week's skill.",
      community: "Optionally name the work situation where you used the skill.",
      evidence: "The weekly skill was used once with a familiar colleague."
    },
    {
      name: "Planned Professional Moment",
      behavior: "Use the week's communication skill once in a professional conversation you can anticipate.",
      meaning: "Increase visibility while keeping enough predictability to support success.",
      actions: ["Choose the conversation in advance", "Decide when you will contribute", "Use the weekly skill once"],
      starter: "I would like to add one thought...",
      practice: "Record one version in the app, then reduce it to a few anchors.",
      community: "Optionally share the situation you chose and what you learned.",
      evidence: "The weekly skill was used during one planned professional moment."
    },
    {
      name: "Small Familiar Group",
      behavior: "Use the week's communication skill once while speaking to a small group of familiar people.",
      meaning: "Let more than one person hear you without making the setting high stakes.",
      actions: ["Choose a familiar group", "Prepare only the opening idea", "Use the weekly skill once"],
      starter: "There is one point I want to share...",
      practice: "Practice a short contribution in the app without memorizing full sentences.",
      community: "Optionally share what helped you speak while more people were listening.",
      evidence: "The weekly skill was used once in a small familiar group."
    },
    {
      name: "Routine Meeting",
      behavior: "Use the week's communication skill for one prepared contribution during a routine meeting.",
      meaning: "Practice becoming visible in a real professional group where your contribution belongs.",
      actions: ["Choose a routine meeting", "Know the moment you want to enter", "Use the weekly skill once"],
      starter: "I would like to add one point...",
      practice: "Record a meeting-sized response in the app and keep only the essential anchors.",
      community: "Optionally share that you made your planned contribution.",
      evidence: "The weekly skill was used for one contribution during a routine meeting."
    },
    {
      name: "Unplanned Professional Moment",
      behavior: "Use the week's communication skill once when a professional conversation develops unexpectedly.",
      meaning: "Keep the skill available when you have less time to prepare the situation.",
      actions: ["Notice a relevant opening", "Use the weekly skill once", "Let imperfect wording be acceptable"],
      starter: "One thought that comes to mind is...",
      practice: "Use the app to answer one surprise prompt with the weekly skill.",
      community: "Optionally share what happened when you responded without complete preparation.",
      evidence: "The weekly skill was used once in an unplanned professional moment."
    },
    {
      name: "Lead a Short Conversation",
      behavior: "Use the week's communication skill while guiding one short professional conversation.",
      meaning: "Apply the skill while carrying a little more responsibility for the interaction.",
      actions: ["Choose a clear purpose", "Use the weekly skill at the key moment", "Bring the conversation to a clear close"],
      starter: "The main thing I want us to consider is...",
      practice: "Practice the key contribution in the app, not the entire conversation.",
      community: "Optionally share what the skill helped you communicate as the conversation's guide.",
      evidence: "The weekly skill was used while guiding a short professional conversation."
    },
    {
      name: "Unexpected Question",
      behavior: "Use the week's communication skill to answer one unexpected question in a visible setting.",
      meaning: "Rely on the trained skill when preparation time and control are limited.",
      actions: ["Allow yourself one moment to think", "Use the weekly skill once", "Complete the answer without restarting"],
      starter: "Let me organize that into one clear answer...",
      practice: "Ask the app for one surprise prompt and respond using the weekly skill.",
      community: "Optionally share what helped the skill remain available under pressure.",
      evidence: "The weekly skill was used to answer one unexpected question."
    },
    {
      name: "High-Stakes Leadership Moment",
      behavior: "Use the week's communication skill once when visibility, responsibility or consequences feel high.",
      meaning: "Make the trained skill available where your professional voice matters most.",
      actions: ["Choose one meaningful leadership moment", "Use the weekly skill at the most important point", "Judge success by the attempt"],
      starter: "The key point I want to make is...",
      practice: "Use the app to prepare the core message, then keep only the anchors you need.",
      community: "Optionally share the evidence you collected from the high-stakes attempt.",
      evidence: "The weekly skill was used once in a high-stakes leadership moment."
    }
  ];

  const clampLevel = value => Math.max(1, Math.min(10, Number(value) || 1));

  function staircase(selectedValue, attribute = "data-level") {
    const selected = clampLevel(selectedValue);
    const next = Math.min(10, selected + 1);
    return levels.map((level, index) => {
      const number = index + 1;
      const state = number < selected ? "done" : number === selected ? "current" : number === next ? "next" : "ahead";
      const marker = number === selected ? "<em>You are here</em>"
        : number === next && next !== selected ? "<em>Practice next</em>" : "";
      return `<button type="button" class="step ${state}" ${attribute}="${number}" style="--rise:${index}" aria-pressed="${number === selected}">
        <span class="step-number">${String(number).padStart(2, "0")}</span>
        <span class="step-copy"><strong>${level.name}</strong><small>${level.behavior}</small></span>
        ${marker}
      </button>`;
    }).reverse().join("");
  }

  function detail(selectedValue) {
    const selected = clampLevel(selectedValue);
    const current = levels[selected - 1];
    const nextNumber = Math.min(10, selected + 1);
    const next = levels[nextNumber - 1];
    const isTop = selected === 10;

    return `<div class="level-card current">
        <small>YOUR CURRENT RELIABLE LEVEL</small>
        <span>LEVEL ${selected}</span>
        <h3>${current.name}</h3>
        <p>${current.behavior}</p>
        <em>${current.meaning}</em>
      </div>
      <div class="level-card next">
        <small>${isTop ? "KEEP EXPRESSING" : "YOUR NEXT EXPOSURE"}</small>
        <span>LEVEL ${nextNumber}</span>
        <h3>${next.name}</h3>
        <p>${next.behavior}</p>
        <ul>${next.actions.map(action => `<li>${action}</li>`).join("")}</ul>
        <blockquote><small>FIRST SENTENCE</small>${next.starter}</blockquote>
        <div class="exposure-plan">
          <div><small>PRACTICE IN THE APP</small><p>${next.practice}</p></div>
          <div><small>POST ON SKOOL</small><p>${next.community}</p></div>
          <div><small>COLLECT THE EVIDENCE</small><p>${next.evidence}</p></div>
        </div>
      </div>`;
  }

  window.SpeakersGymExposure = { levels, clampLevel, staircase, detail };
})();
