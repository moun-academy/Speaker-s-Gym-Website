(function () {
  "use strict";

  const levels = [
    {
      name: "Look Up and Begin",
      behavior: "Say one prepared sentence to a familiar person with one second of eye contact.",
      meaning: "Teach your body that looking up and beginning can be safe, brief and successful.",
      actions: ["Take one low breath", "Look at the listener for the first phrase", "Finish the sentence before evaluating yourself"],
      starter: "I wanted to share one thing...",
      practice: "Record the sentence three times in the Speaker's Gym app with a steady first word.",
      community: "Post your clearest practice and name the person you will try it with.",
      evidence: "One complete sentence was delivered with brief eye contact."
    },
    {
      name: "Hold Gentle Eye Contact",
      behavior: "Complete one short answer with two natural moments of eye contact.",
      meaning: "Build connection without forcing yourself to stare or perform confidence.",
      actions: ["Look up for the opening phrase", "Look away naturally while thinking", "Return for the final sentence"],
      starter: "My answer is...",
      practice: "Record a 30-second answer and mark the two places where you will look up.",
      community: "Post the practice and ask whether your eye contact feels natural and connected.",
      evidence: "The answer was completed with two intentional moments of eye contact."
    },
    {
      name: "Ask a New Question",
      behavior: "Ask one simple question during an interaction with someone less familiar.",
      meaning: "Move from avoiding unfamiliar interactions to participating in one manageable way.",
      actions: ["Choose a situational question", "Begin within five seconds", "Stay present for the complete answer"],
      starter: "Can I ask you one quick question?",
      practice: "Practice three natural questions in the app with calm volume and pace.",
      community: "Post your strongest opener and name the real situation where you will use it.",
      evidence: "The question was asked and the answer was heard without leaving early."
    },
    {
      name: "Share One Clear Opinion",
      behavior: "Give one concise PREP opinion to a colleague or familiar professional contact.",
      meaning: "Let your experience become visible before overthinking closes the opportunity.",
      actions: ["Lead with the point", "Give one reason or example", "Finish without apologizing"],
      starter: "My view is...",
      practice: "Record a 45-second PREP opinion and begin within five seconds.",
      community: "Post the practice and ask whether your main point is easy to follow.",
      evidence: "The opinion was expressed clearly from beginning to end."
    },
    {
      name: "Start an Unplanned Conversation",
      behavior: "Initiate and sustain a two-minute conversation with someone less familiar.",
      meaning: "Practice staying available when an interaction was not completely scripted in advance.",
      actions: ["Use one natural opener", "Ask one follow-up question", "Share one thought of your own"],
      starter: "How has your day been so far?",
      practice: "Role-play an opener, follow-up and personal response in the app.",
      community: "Post the role-play and ask whether you sound curious and present.",
      evidence: "A two-minute conversation was initiated and completed."
    },
    {
      name: "Contribute in a Group",
      behavior: "Ask a question or share one point during a small professional group conversation.",
      meaning: "Enter the room as a contributor instead of waiting to feel completely calm.",
      actions: ["Prepare one keyword", "Look at one person as you begin", "Complete the point at a steady pace"],
      starter: "I would like to add one point...",
      practice: "Record a 60-second contribution with one pause and a firm ending.",
      community: "Post the contribution and name the group situation where you will use it.",
      evidence: "One useful contribution was made before the group conversation ended."
    },
    {
      name: "Make a Recommendation",
      behavior: "Present one professional recommendation with a reason, example and next step.",
      meaning: "Translate more than a decade of experience into leadership thinking others can act on.",
      actions: ["Open with the recommendation", "Support it with one specific example", "End with the next action"],
      starter: "My recommendation is...",
      practice: "Record a 90-second recommendation and review the AI report for clarity and logical flow.",
      community: "Post the answer and ask whether your recommendation feels clear and credible.",
      evidence: "The recommendation, reasoning and next step were all communicated."
    },
    {
      name: "Lead a Short Discussion",
      behavior: "Guide a five-minute professional conversation with structure, eye contact and follow-up questions.",
      meaning: "Practice the visible behaviors of leadership in a manageable setting.",
      actions: ["State the purpose", "Invite one response", "Summarize the decision or next step"],
      starter: "The goal of this conversation is...",
      practice: "Record a two-minute opening and closing for the discussion in the app.",
      community: "Post the opening and ask whether you sound clear, warm and in charge of the structure.",
      evidence: "A complete short discussion was opened, guided and closed."
    },
    {
      name: "Speak Under Pressure",
      behavior: "Present a recommendation and respond to an unexpected question or objection.",
      meaning: "Keep access to your voice and structure when attention and consequences feel higher.",
      actions: ["Pause before responding", "Maintain natural eye contact", "Return to one clear recommendation without excessive apology"],
      starter: "Let me take a moment to organize my answer...",
      practice: "Record a recommendation, then answer one surprise follow-up in the app.",
      community: "Post both responses and ask for feedback on composure and structure.",
      evidence: "The recommendation and follow-up were completed without retreating from the message."
    },
    {
      name: "Lead With Confident Presence",
      behavior: "Lead a discussion or presentation with structure, eye contact, personality and spontaneity.",
      meaning: "Communicate as the experienced professional and future leader you are, even when some nerves remain.",
      actions: ["Guide the room with clear structure", "Use vocal variety and connected eye contact", "Respond naturally when the moment changes"],
      starter: "Here is what I want us to accomplish...",
      practice: "Record a three-minute leadership presentation using your complete communication toolkit.",
      community: "Post the final speech and ask what feels most authentic, confident and leader-like.",
      evidence: "A complete discussion or presentation was led with visible structure, composure and personal expression."
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
