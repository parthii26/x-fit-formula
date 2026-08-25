// ─── X Fit Formula — plan generation logic ────────────────────────────────
// Builds a weekly split + per-day session blocks from the user's answers.

const SPLITS = {
  1: ['Full Body'],
  2: ['Full Body A', 'Full Body B'],
  3: ['Push', 'Pull', 'Legs'],
  4: ['Upper', 'Lower', 'Upper', 'Lower'],
  5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
  6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
  7: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Conditioning', 'Active Recovery'],
}

const EXERCISES = {
  gym: {
    'Push':          ['Barbell Bench Press', 'Overhead Press', 'Incline DB Press', 'Cable Fly', 'Triceps Pushdown'],
    'Pull':          ['Deadlift', 'Lat Pulldown', 'Seated Cable Row', 'Face Pull', 'Barbell Curl'],
    'Legs':          ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Standing Calf Raise'],
    'Upper':         ['Bench Press', 'Barbell Row', 'Overhead Press', 'Pull-Up', 'EZ-Bar Curl'],
    'Lower':         ['Front Squat', 'Hip Thrust', 'Walking Lunge', 'Leg Extension', 'Seated Calf Raise'],
    'Full Body':     ['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Plank'],
    'Full Body A':   ['Squat', 'Bench Press', 'Lat Pulldown', 'Leg Curl', 'Cable Crunch'],
    'Full Body B':   ['Deadlift', 'Overhead Press', 'Seated Row', 'Leg Press', 'Hanging Knee Raise'],
    'Conditioning':  ['Rower Intervals', 'Sled Push', 'Battle Ropes', 'Assault Bike Sprints', 'Farmer Carry'],
    'Active Recovery': ['Incline Treadmill Walk', 'Mobility Flow', 'Light Cycling', 'Foam Rolling', 'Stretching Circuit'],
  },
  dumbbells: {
    'Push':          ['DB Bench Press', 'DB Shoulder Press', 'DB Incline Press', 'DB Lateral Raise', 'DB Overhead Extension'],
    'Pull':          ['DB Romanian Deadlift', 'One-Arm DB Row', 'DB Pullover', 'DB Rear Delt Fly', 'DB Hammer Curl'],
    'Legs':          ['Goblet Squat', 'DB Split Squat', 'DB Step-Up', 'DB Stiff-Leg Deadlift', 'DB Calf Raise'],
    'Upper':         ['DB Bench Press', 'Bent-Over DB Row', 'DB Arnold Press', 'DB Curl', 'DB Skullcrusher'],
    'Lower':         ['DB Front Squat', 'DB Hip Thrust', 'DB Reverse Lunge', 'DB Swing', 'Single-Leg Calf Raise'],
    'Full Body':     ['Goblet Squat', 'DB Floor Press', 'One-Arm DB Row', 'DB Push Press', 'Weighted Plank'],
    'Full Body A':   ['Goblet Squat', 'DB Bench Press', 'DB Row', 'DB Lateral Raise', 'DB Crunch'],
    'Full Body B':   ['DB Romanian Deadlift', 'DB Shoulder Press', 'DB Lunge', 'DB Pullover', 'Russian Twist'],
    'Conditioning':  ['DB Thrusters', 'DB Swings', 'DB Man-Makers', 'Renegade Rows', 'DB Farmer Carry'],
    'Active Recovery': ['Brisk Walk', 'Mobility Flow', 'Light DB Circuit', 'Foam Rolling', 'Stretching Circuit'],
  },
  bodyweight: {
    'Push':          ['Push-Up', 'Pike Push-Up', 'Decline Push-Up', 'Diamond Push-Up', 'Bench Dip'],
    'Pull':          ['Doorframe Row / Towel Row', 'Superman Hold', 'Reverse Snow Angel', 'Prone Y-T-W', 'Chin-Up (if bar)'],
    'Legs':          ['Bodyweight Squat', 'Reverse Lunge', 'Bulgarian Split Squat', 'Glute Bridge', 'Single-Leg Calf Raise'],
    'Upper':         ['Push-Up', 'Inverted Row (table)', 'Pike Push-Up', 'Plank to Push-Up', 'Triceps Dip'],
    'Lower':         ['Jump Squat', 'Walking Lunge', 'Single-Leg Glute Bridge', 'Wall Sit', 'Calf Raise'],
    'Full Body':     ['Squat', 'Push-Up', 'Reverse Lunge', 'Mountain Climber', 'Plank'],
    'Full Body A':   ['Squat', 'Push-Up', 'Glute Bridge', 'Bird Dog', 'Hollow Hold'],
    'Full Body B':   ['Split Squat', 'Pike Push-Up', 'Superman', 'Side Plank', 'Burpee'],
    'Conditioning':  ['Burpees', 'High Knees', 'Jump Squats', 'Mountain Climbers', 'Jumping Jacks'],
    'Active Recovery': ['Walk 30–40 min', 'Mobility Flow', 'Yoga Sequence', 'Deep Stretching', 'Breathing Drills'],
  },
}

const GOAL_PRESCRIPTION = {
  fatloss:  { sets: '3', reps: '12–15', rest: '45–60s', cardio: '15 min finisher (HIIT or incline walk)' },
  muscle:   { sets: '3–4', reps: '8–12', rest: '60–90s', cardio: 'Optional 10 min cooldown walk' },
  strength: { sets: '4–5', reps: '3–6', rest: '2–3 min', cardio: 'Optional light cardio warm-up only' },
  general:  { sets: '3', reps: '10–12', rest: '60s', cardio: '10–15 min moderate cardio' },
}

const EXP_VOLUME = {
  beginner:     { exercises: 4, note: 'Focus on form. Leave 2–3 reps in the tank on every set.' },
  intermediate: { exercises: 5, note: 'Push close to failure on final sets. Progressive overload weekly.' },
  advanced:     { exercises: 5, note: 'Use intensity techniques (drop sets, paused reps) on last set.' },
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Spread N training days across the week with sensible rest placement
export const DAY_SLOTS = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
}

export function generatePlan(data) {
  const days = Math.min(Math.max(data.daysPerWeek, 1), 7)
  const split = SPLITS[days]
  const pool = EXERCISES[data.equipment] || EXERCISES.bodyweight
  const rx = GOAL_PRESCRIPTION[data.goal] || GOAL_PRESCRIPTION.general
  const vol = EXP_VOLUME[data.experience] || EXP_VOLUME.beginner
  const slots = DAY_SLOTS[days]

  const week = DAY_NAMES.map((dayName, i) => {
    const slotIdx = slots.indexOf(i)
    if (slotIdx === -1) {
      return { day: dayName, focus: 'Rest', rest: true, exercises: [] }
    }
    const focus = split[slotIdx]
    const isRecovery = focus === 'Active Recovery'
    return {
      day: dayName,
      focus,
      rest: false,
      recovery: isRecovery,
      exercises: (pool[focus] || []).slice(0, vol.exercises).map((name) => ({
        name,
        sets: isRecovery ? '—' : rx.sets,
        reps: isRecovery ? '20–30 min' : rx.reps,
      })),
    }
  })

  return { week, rx, volumeNote: vol.note, split: [...new Set(split)].join(' / ') }
}

// Map an ordered list of trainer-built training days onto a 7-day week,
// spreading rest days sensibly (used by the Trainer Workout Builder).
export function assembleWeek(trainingDays, daysPerWeek) {
  const days = Math.min(Math.max(daysPerWeek, 1), 7)
  const slots = DAY_SLOTS[days]
  return DAY_NAMES.map((day, i) => {
    const idx = slots.indexOf(i)
    if (idx === -1) return { day, focus: 'Rest', rest: true, exercises: [] }
    const d = trainingDays[idx] || { focus: 'Training', exercises: [] }
    return {
      day,
      focus: d.focus || 'Training',
      rest: false,
      recovery: /recovery|mobility|rest/i.test(d.focus || ''),
      exercises: (d.exercises || []).filter((ex) => ex.name && ex.name.trim()),
    }
  })
}

export const LABELS = {
  goal: { fatloss: 'Fat Loss', muscle: 'Muscle Gain', strength: 'Strength', general: 'General Fitness' },
  equipment: { gym: 'Full Gym', dumbbells: 'Dumbbells Only', bodyweight: 'Bodyweight' },
  experience: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  lifestyle: { active: 'Highly Active', desk: 'Sedentary Desk Job', studying: 'Studying' },
}
