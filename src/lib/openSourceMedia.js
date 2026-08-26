/**
 * ============================================================================
 * X FIT FORMULA — Open Source & Public Domain Exercise Demonstration Library
 * ============================================================================
 * Source: https://github.com/yuhonas/free-exercise-db
 * License: Public Domain (Unlicense) — Free for personal & commercial use with no copyright restrictions.
 * ============================================================================
 */

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

export const OPEN_SOURCE_EXERCISE_MEDIA = {
  // Gym / Standard Exercises
  'push-up': {
    path: 'Pushups',
    frames: [`${BASE_URL}/Pushups/0.jpg`, `${BASE_URL}/Pushups/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'bodyweight-squat': {
    path: 'Bodyweight_Squat',
    frames: [`${BASE_URL}/Bodyweight_Squat/0.jpg`, `${BASE_URL}/Bodyweight_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
  },
  'glute-bridge': {
    path: 'Glute_Bridge',
    frames: [`${BASE_URL}/Glute_Bridge/0.jpg`, `${BASE_URL}/Glute_Bridge/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vigk',
  },
  'plank': {
    path: 'Plank',
    frames: [`${BASE_URL}/Plank/0.jpg`, `${BASE_URL}/Plank/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  },
  'reverse-lunge': {
    path: 'Bodyweight_Walking_Lunge',
    frames: [`${BASE_URL}/Bodyweight_Walking_Lunge/0.jpg`, `${BASE_URL}/Bodyweight_Walking_Lunge/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs',
  },
  'barbell-bench-press': {
    path: 'Barbell_Bench_Press_-_Medium_Grip',
    frames: [`${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`, `${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  'lat-pulldown': {
    path: 'Wide-Grip_Lat_Pulldown',
    frames: [`${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`, `${BASE_URL}/Wide-Grip_Lat_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  'leg-press': {
    path: 'Leg_Press',
    frames: [`${BASE_URL}/Leg_Press/0.jpg`, `${BASE_URL}/Leg_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
  },
  'seated-cable-row': {
    path: 'Seated_Cable_Rows',
    frames: [`${BASE_URL}/Seated_Cable_Rows/0.jpg`, `${BASE_URL}/Seated_Cable_Rows/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033fBo',
  },
  'machine-shoulder-press': {
    path: 'Leverage_Shoulder_Press',
    frames: [`${BASE_URL}/Leverage_Shoulder_Press/0.jpg`, `${BASE_URL}/Leverage_Shoulder_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },

  // Intermediate & Advanced Movements
  'pull-up': {
    path: 'Pullups',
    frames: [`${BASE_URL}/Pullups/0.jpg`, `${BASE_URL}/Pullups/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  },
  'pull-ups': {
    path: 'Pullups',
    frames: [`${BASE_URL}/Pullups/0.jpg`, `${BASE_URL}/Pullups/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  },
  'barbell-squat': {
    path: 'Barbell_Squat',
    frames: [`${BASE_URL}/Barbell_Squat/0.jpg`, `${BASE_URL}/Barbell_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
  },
  'deadlift': {
    path: 'Barbell_Deadlift',
    frames: [`${BASE_URL}/Barbell_Deadlift/0.jpg`, `${BASE_URL}/Barbell_Deadlift/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
  },
  'romanian-deadlift': {
    path: 'Romanian_Deadlift',
    frames: [`${BASE_URL}/Romanian_Deadlift/0.jpg`, `${BASE_URL}/Romanian_Deadlift/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=_oyxCn2iSjU',
  },
  'barbell-row': {
    path: 'Bent_Over_Barbell_Row',
    frames: [`${BASE_URL}/Bent_Over_Barbell_Row/0.jpg`, `${BASE_URL}/Bent_Over_Barbell_Row/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8gkQ',
  },
  'overhead-press': {
    path: 'Standing_Military_Press',
    frames: [`${BASE_URL}/Standing_Military_Press/0.jpg`, `${BASE_URL}/Standing_Military_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
  },
  'lateral-raise': {
    path: 'Side_Lateral_Raise',
    frames: [`${BASE_URL}/Side_Lateral_Raise/0.jpg`, `${BASE_URL}/Side_Lateral_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  'bicep-curl': {
    path: 'Barbell_Curl',
    frames: [`${BASE_URL}/Barbell_Curl/0.jpg`, `${BASE_URL}/Barbell_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
  },
  'tricep-pushdown': {
    path: 'Triceps_Pushdown',
    frames: [`${BASE_URL}/Triceps_Pushdown/0.jpg`, `${BASE_URL}/Triceps_Pushdown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
  },
  'dumbbell-bench-press': {
    path: 'Dumbbell_Bench_Press',
    frames: [`${BASE_URL}/Dumbbell_Bench_Press/0.jpg`, `${BASE_URL}/Dumbbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
  },

  // Home Workouts
  'warm-up': {
    path: 'Arm_Circles',
    frames: [`${BASE_URL}/Arm_Circles/0.jpg`, `${BASE_URL}/Arm_Circles/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=A2WJ27b6y3o',
  },
  'incline-push-ups': {
    path: 'Incline_Push-Up',
    frames: [`${BASE_URL}/Incline_Push-Up/0.jpg`, `${BASE_URL}/Incline_Push-Up/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=cfns5VDl_P0',
  },
  'free-squats': {
    path: 'Bodyweight_Squat',
    frames: [`${BASE_URL}/Bodyweight_Squat/0.jpg`, `${BASE_URL}/Bodyweight_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
  },
  'push-ups': {
    path: 'Pushups',
    frames: [`${BASE_URL}/Pushups/0.jpg`, `${BASE_URL}/Pushups/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'standard-crunches': {
    path: 'Crunches',
    frames: [`${BASE_URL}/Crunches/0.jpg`, `${BASE_URL}/Crunches/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=5ER5Of4MOPI',
  },
  'crunches': {
    path: 'Crunches',
    frames: [`${BASE_URL}/Crunches/0.jpg`, `${BASE_URL}/Crunches/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=5ER5Of4MOPI',
  },
  'leg-raises': {
    path: 'Flat_Bench_Lying_Leg_Raise',
    frames: [`${BASE_URL}/Flat_Bench_Lying_Leg_Raise/0.jpg`, `${BASE_URL}/Flat_Bench_Lying_Leg_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=l4kQd9eWclE',
  },
  'bicycle-crunches': {
    path: 'Air_Bike',
    frames: [`${BASE_URL}/Air_Bike/0.jpg`, `${BASE_URL}/Air_Bike/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=9FGilxCbdz8',
  },
  'mountain-climbers': {
    path: 'Mountain_Climbers',
    frames: [`${BASE_URL}/Mountain_Climbers/0.jpg`, `${BASE_URL}/Mountain_Climbers/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
  },
  'hanging-knee-raises': {
    path: 'Hanging_Leg_Raise',
    frames: [`${BASE_URL}/Hanging_Leg_Raise/0.jpg`, `${BASE_URL}/Hanging_Leg_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_E',
  },
  'reverse-crunches': {
    path: 'Reverse_Crunch',
    frames: [`${BASE_URL}/Reverse_Crunch/0.jpg`, `${BASE_URL}/Reverse_Crunch/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=gAyxnl_qH_g',
  },
  'walking': {
    path: 'Walking_Treadmill',
    frames: [`${BASE_URL}/Walking_Treadmill/0.jpg`, `${BASE_URL}/Walking_Treadmill/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=b4bM5G2i68w',
  },
}

/**
 * Returns public-domain demonstration frames and thumbnail for an exercise
 */
export function getOpenSourceDemo(slug) {
  if (!slug) return null
  const normalizedSlug = String(slug).toLowerCase().trim()
  return OPEN_SOURCE_EXERCISE_MEDIA[normalizedSlug] || null
}

/**
 * Extracts YouTube video embed URL if the string is a valid YouTube link
 */
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
    : null
}

/**
 * Normalizes any YouTube URL to its standard web watch link
 */
export function getYouTubeWatchUrl(url) {
  if (!url || typeof url !== 'string') return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube.com/watch?v=${match[2]}`
    : url
}
