// Preserve Pankaj's personalized program; adapt it to the shared journey layout.
window.PANKAJ_JOURNEY_DATA = {
  ...window.PANKAJ_PORTAL_DATA,
  weeks: window.PANKAJ_PORTAL_DATA.weeks.map(week => ({
    ...week,
    days: week.days.map(day => [day.title, day.intention, day.required, [day.required, ...(day.extras || [])]])
  })),
  lectures: [
  {
    "week": 1,
    "title": "Think clearly. Speak simply.",
    "skill": "STRUCTURE & PREP",
    "description": "Give your answers a clear shape. Point, reason, example, point.",
    "art": "structure",
    "trigger": "data-open-week1"
  },
  {
    "week": 2,
    "title": "A voice that carries.",
    "skill": "VOLUME & PRESENCE",
    "description": "Build a supported voice and let your final words be heard.",
    "art": "voice",
    "trigger": "data-open-week2-lecture"
  },
  {
    "week": 3,
    "title": "Find your speaking rhythm.",
    "skill": "PACE & VARIETY",
    "description": "Fast, slow, stop. Give your important ideas the space they need.",
    "art": "pace",
    "trigger": "data-open-week3-lecture"
  },
  {
    "week": 4,
    "title": "The power of a pause.",
    "skill": "SILENCE & COMPOSURE",
    "description": "Take a moment to think. Replace fillers with intentional silence.",
    "art": "pauses",
    "trigger": "data-open-week4-lecture"
  },
  {
    "week": 5,
    "title": "Find the music in your voice.",
    "skill": "PITCH & VOCAL VARIETY",
    "description": "Step, lift, drop, and land. Mix pitch with pace and volume so people hear how you feel.",
    "art": "melody",
    "trigger": "data-open-week5-lecture"
  }
]
};
