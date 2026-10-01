(function () {
  "use strict";

  const levels = [
    {
      name: "Ask One Question",
      behavior: "Ask one question during a small meeting.",
      meaning: "Enter the conversation with one useful question instead of waiting for the perfect contribution.",
      actions: ["Choose one point to clarify", "Ask before the meeting ends", "Stay present for the answer"],
      starter: "Could I clarify one point?",
      practice: "Record the question three times in the Speaker's Gym app using a clear volume.",
      community: "Post your clearest practice and name the meeting where you will use it.",
      evidence: "The question was asked before the meeting ended."
    },
    {
      name: "Be Seen Practising",
      behavior: "Post a 60-second PREP speech on the community.",
      meaning: "Let yourself be seen learning before the speech feels perfect.",
      actions: ["Choose one simple opinion", "Record one honest take", "Ask for one specific point of feedback"],
      starter: "I believe...",
      practice: "Record one 60-second PREP opinion in the Speaker's Gym app and read the AI report.",
      community: "Post the video on Skool and ask for feedback on one observable behavior.",
      evidence: "The video remains posted and the feedback has been reviewed."
    },
    {
      name: "Share an Opinion",
      behavior: "Share one opinion without being invited.",
      meaning: "Let the room hear what you think before overthinking closes the opportunity.",
      actions: ["Enter with one clear point", "Use one PREP reason", "Finish without apologizing for contributing"],
      starter: "I would like to add one point...",
      practice: "Record a 45-second PREP opinion in the app and begin within five seconds.",
      community: "Post the practice and write the first sentence you will use in the real situation.",
      evidence: "The opinion was shared without waiting to be called on."
    },
    {
      name: "Volunteer an Update",
      behavior: "Volunteer a short update during a meeting.",
      meaning: "Take responsibility for a useful moment instead of remaining invisible.",
      actions: ["Open with the result", "Give one important detail", "End with the next action"],
      starter: "I can give a quick update...",
      practice: "Record a 60-second update in the app using Point, Reason and next action.",
      community: "Post the update on Skool and ask whether the main message was easy to follow.",
      evidence: "The update was volunteered and completed without being invited."
    },
    {
      name: "Hold the Floor",
      behavior: "Deliver a clear 60 to 90-second contribution without rushing or fading away.",
      meaning: "Give your experience enough time and vocal space to be understood.",
      actions: ["Use PREP from beginning to end", "Pause between the main ideas", "Keep the final sentence audible"],
      starter: "My recommendation is...",
      practice: "Record a 90-second answer in the app with deliberate pauses and a firm ending.",
      community: "Post the speech and ask for feedback on clarity, pace and volume.",
      evidence: "The complete contribution was delivered at a steady pace."
    },
    {
      name: "Disagree Without Offending",
      behavior: "Express a different opinion clearly, warmly and without excessive apologies.",
      meaning: "Make the intended message easier to receive without hiding the disagreement.",
      actions: ["Acknowledge the other view", "State the difference directly", "Support it with one reason"],
      starter: "I see this slightly differently...",
      practice: "Record a respectful disagreement in the app and check whether the tone matches the intention.",
      community: "Post the response and ask how the message feels to a listener.",
      evidence: "A different view was expressed clearly and the conversation remained constructive."
    },
    {
      name: "Make Your Experience Visible",
      behavior: "Answer an interview question with a structured example that demonstrates your value.",
      meaning: "Translate years of experience into evidence another person can quickly understand.",
      actions: ["Lead with the answer", "Use one specific professional example", "Name the result confidently"],
      starter: "One example that demonstrates this is...",
      practice: "Record a 90-second interview answer in the app and review the AI report.",
      community: "Post the answer on Skool and ask whether your value is clear and memorable.",
      evidence: "The interview answer included a clear example, action and result."
    },
    {
      name: "Create a Deeper Conversation",
      behavior: "Initiate a meaningful conversation and move beyond small talk.",
      meaning: "Use your voice to create connection with a family member or someone you care about.",
      actions: ["Ask one open question", "Use two natural follow-up questions", "Share one honest thought of your own"],
      starter: "What has been on your mind lately?",
      practice: "Practise an open question, two follow-ups and a personal response in the app.",
      community: "Post a short role-play and ask whether you sound curious and present.",
      evidence: "The conversation moved beyond small talk and both people shared something meaningful."
    },
    {
      name: "Speak Under Pressure",
      behavior: "Present a recommendation and respond to an unexpected question or objection.",
      meaning: "Keep access to your structure when attention and consequences feel higher.",
      actions: ["Pause before responding", "Return to one clear recommendation", "Recover without excessive apology"],
      starter: "Let me take a moment to organize my answer...",
      practice: "Record a recommendation, then answer one surprise follow-up in the app.",
      community: "Post both responses and ask for feedback on composure and structure.",
      evidence: "The recommendation and follow-up were completed without retreating from the message."
    },
    {
      name: "Full Expression",
      behavior: "Lead a discussion or presentation with structure, personality and spontaneity.",
      meaning: "Communicate with approximately the same freedom you have when you feel safe and fully yourself.",
      actions: ["Guide the room with clear structure", "Use vocal variety and personality", "Respond naturally when the moment changes"],
      starter: "Here is what I want us to explore...",
      practice: "Record a three-minute presentation in the app using your complete communication toolkit.",
      community: "Post the final speech and ask what feels most authentic, confident and memorable.",
      evidence: "A complete discussion or presentation was led with visible structure and personal expression."
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
        : number === next && next !== selected ? "<em>Practise next</em>" : "";
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
          <div><small>PRACTISE IN THE APP</small><p>${next.practice}</p></div>
          <div><small>POST ON SKOOL</small><p>${next.community}</p></div>
          <div><small>COLLECT THE EVIDENCE</small><p>${next.evidence}</p></div>
        </div>
      </div>`;
  }

  window.SpeakersGymExposure = { levels, clampLevel, staircase, detail };
})();
