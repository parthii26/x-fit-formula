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
  // ─── CHEST MOVEMENTS ───────────────────────────────────────────────────────
  'barbell-flat-bench-press': {
    path: 'Barbell_Bench_Press_-_Medium_Grip',
    frames: [`${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`, `${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  'barbell-bench-press': {
    path: 'Barbell_Bench_Press_-_Medium_Grip',
    frames: [`${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`, `${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  'bench-press': {
    path: 'Barbell_Bench_Press_-_Medium_Grip',
    frames: [`${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`, `${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  'incline-dumbbell-bench-press': {
    path: 'Incline_Dumbbell_Press',
    frames: [`${BASE_URL}/Incline_Dumbbell_Press/0.jpg`, `${BASE_URL}/Incline_Dumbbell_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
  },
  'incline-dumbbell-press': {
    path: 'Incline_Dumbbell_Press',
    frames: [`${BASE_URL}/Incline_Dumbbell_Press/0.jpg`, `${BASE_URL}/Incline_Dumbbell_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
  },
  'incline-bench-press': {
    path: 'Barbell_Incline_Bench_Press_-_Medium_Grip',
    frames: [`${BASE_URL}/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg`, `${BASE_URL}/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
  },
  'barbell-incline-bench-press': {
    path: 'Barbell_Incline_Bench_Press_-_Medium_Grip',
    frames: [`${BASE_URL}/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg`, `${BASE_URL}/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
  },
  'barbell-decline-bench-press': {
    path: 'Decline_Barbell_Bench_Press',
    frames: [`${BASE_URL}/Decline_Barbell_Bench_Press/0.jpg`, `${BASE_URL}/Decline_Barbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
  },
  'decline-bench-press': {
    path: 'Decline_Barbell_Bench_Press',
    frames: [`${BASE_URL}/Decline_Barbell_Bench_Press/0.jpg`, `${BASE_URL}/Decline_Barbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
  },
  'flat-dumbbell-press': {
    path: 'Dumbbell_Bench_Press',
    frames: [`${BASE_URL}/Dumbbell_Bench_Press/0.jpg`, `${BASE_URL}/Dumbbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
  },
  'dumbbell-flat-bench-press': {
    path: 'Dumbbell_Bench_Press',
    frames: [`${BASE_URL}/Dumbbell_Bench_Press/0.jpg`, `${BASE_URL}/Dumbbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
  },
  'dumbbell-bench-press': {
    path: 'Dumbbell_Bench_Press',
    frames: [`${BASE_URL}/Dumbbell_Bench_Press/0.jpg`, `${BASE_URL}/Dumbbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
  },
  'chest-butterfly': {
    path: 'Butterfly',
    frames: [`${BASE_URL}/Butterfly/0.jpg`, `${BASE_URL}/Butterfly/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=eGjt4lk6g34',
  },
  'butterfly': {
    path: 'Butterfly',
    frames: [`${BASE_URL}/Butterfly/0.jpg`, `${BASE_URL}/Butterfly/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=eGjt4lk6g34',
  },
  'flat-bench-dumbbell-chest-fly': {
    path: 'Flat_Bench_Dumbbell_Fly',
    frames: [`${BASE_URL}/Flat_Bench_Dumbbell_Fly/0.jpg`, `${BASE_URL}/Flat_Bench_Dumbbell_Fly/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
  },
  'machine-bench-press': {
    path: 'Leverage_Chest_Press',
    frames: [`${BASE_URL}/Leverage_Chest_Press/0.jpg`, `${BASE_URL}/Leverage_Chest_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2q8E_3U3k_g',
  },
  'dumbbell-pullover': {
    path: 'Straight-Arm_Dumbbell_Pullover',
    frames: [`${BASE_URL}/Straight-Arm_Dumbbell_Pullover/0.jpg`, `${BASE_URL}/Straight-Arm_Dumbbell_Pullover/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=FK4rHfW644U',
  },
  'decline-dumbbell-press': {
    path: 'Decline_Dumbbell_Bench_Press',
    frames: [`${BASE_URL}/Decline_Dumbbell_Bench_Press/0.jpg`, `${BASE_URL}/Decline_Dumbbell_Bench_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=8x-2f_iW_54',
  },
  'decline-dumbbell-chest-fly': {
    path: 'Decline_Dumbbell_Flyes',
    frames: [`${BASE_URL}/Decline_Dumbbell_Flyes/0.jpg`, `${BASE_URL}/Decline_Dumbbell_Flyes/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=DFwM2gHkJyU',
  },
  'cable-crossover': {
    path: 'Cable_Crossover',
    frames: [`${BASE_URL}/Cable_Crossover/0.jpg`, `${BASE_URL}/Cable_Crossover/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
  },
  'incline-dumbbell-flye': {
    path: 'Incline_Dumbbell_Flyes',
    frames: [`${BASE_URL}/Incline_Dumbbell_Flyes/0.jpg`, `${BASE_URL}/Incline_Dumbbell_Flyes/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=bDaIL_zKbGs',
  },
  'low-cable-flye': {
    path: 'Low_Cable_Crossover',
    frames: [`${BASE_URL}/Low_Cable_Crossover/0.jpg`, `${BASE_URL}/Low_Cable_Crossover/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=5B3b5N3x74E',
  },

  // ─── BACK & LATS MOVEMENTS ────────────────────────────────────────────────
  'lat-pulldown': {
    path: 'Wide-Grip_Lat_Pulldown',
    frames: [`${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`, `${BASE_URL}/Wide-Grip_Lat_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  'pulldown': {
    path: 'Wide-Grip_Lat_Pulldown',
    frames: [`${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`, `${BASE_URL}/Wide-Grip_Lat_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  'pulldown-workout': {
    path: 'Wide-Grip_Lat_Pulldown',
    frames: [`${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`, `${BASE_URL}/Wide-Grip_Lat_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  'cable-lat-pulldown': {
    path: 'Wide-Grip_Lat_Pulldown',
    frames: [`${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`, `${BASE_URL}/Wide-Grip_Lat_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  't-bar': {
    path: 'T-Bar_Row_with_Handle',
    frames: [`${BASE_URL}/T-Bar_Row_with_Handle/0.jpg`, `${BASE_URL}/T-Bar_Row_with_Handle/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4',
  },
  't-bar-row': {
    path: 'T-Bar_Row_with_Handle',
    frames: [`${BASE_URL}/T-Bar_Row_with_Handle/0.jpg`, `${BASE_URL}/T-Bar_Row_with_Handle/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4',
  },
  'barbell-row': {
    path: 'Bent_Over_Barbell_Row',
    frames: [`${BASE_URL}/Bent_Over_Barbell_Row/0.jpg`, `${BASE_URL}/Bent_Over_Barbell_Row/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8gkQ',
  },
  'bent-over-row': {
    path: 'Bent_Over_Barbell_Row',
    frames: [`${BASE_URL}/Bent_Over_Barbell_Row/0.jpg`, `${BASE_URL}/Bent_Over_Barbell_Row/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8gkQ',
  },
  'dumbbell-rowing': {
    path: 'One-Arm_Dumbbell_Row',
    frames: [`${BASE_URL}/One-Arm_Dumbbell_Row/0.jpg`, `${BASE_URL}/One-Arm_Dumbbell_Row/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
  },
  'dumbbell-row': {
    path: 'One-Arm_Dumbbell_Row',
    frames: [`${BASE_URL}/One-Arm_Dumbbell_Row/0.jpg`, `${BASE_URL}/One-Arm_Dumbbell_Row/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
  },
  'seated-cable-row': {
    path: 'Seated_Cable_Rows',
    frames: [`${BASE_URL}/Seated_Cable_Rows/0.jpg`, `${BASE_URL}/Seated_Cable_Rows/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033fBo',
  },
  'seated-row': {
    path: 'Seated_Cable_Rows',
    frames: [`${BASE_URL}/Seated_Cable_Rows/0.jpg`, `${BASE_URL}/Seated_Cable_Rows/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033fBo',
  },
  'v-grip-lat-pulldowns': {
    path: 'V-Bar_Pulldown',
    frames: [`${BASE_URL}/V-Bar_Pulldown/0.jpg`, `${BASE_URL}/V-Bar_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=l_tZ9zMsz5I',
  },
  'single-arm-lat-pulldowns': {
    path: 'One-Arm_Lat_Pulldown',
    frames: [`${BASE_URL}/One-Arm_Lat_Pulldown/0.jpg`, `${BASE_URL}/One-Arm_Lat_Pulldown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=mRkzRkJQ5iA',
  },
  'cable-machine': {
    path: 'Cable_Crossover',
    frames: [`${BASE_URL}/Cable_Crossover/0.jpg`, `${BASE_URL}/Cable_Crossover/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
  },
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

  // ─── SHOULDERS & TRAPS ────────────────────────────────────────────────────
  'face-pull': {
    path: 'Face_Pull',
    frames: [`${BASE_URL}/Face_Pull/0.jpg`, `${BASE_URL}/Face_Pull/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
  },
  'upright-row': {
    path: 'Upright_Barbell_Row',
    frames: [`${BASE_URL}/Upright_Barbell_Row/0.jpg`, `${BASE_URL}/Upright_Barbell_Row/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=amCU-ziHITM',
  },
  'overhead-press': {
    path: 'Standing_Military_Press',
    frames: [`${BASE_URL}/Standing_Military_Press/0.jpg`, `${BASE_URL}/Standing_Military_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
  },
  'standing-military-press': {
    path: 'Standing_Military_Press',
    frames: [`${BASE_URL}/Standing_Military_Press/0.jpg`, `${BASE_URL}/Standing_Military_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
  },
  'dumbbell-shoulder-press': {
    path: 'Standing_Dumbbell_Press',
    frames: [`${BASE_URL}/Standing_Dumbbell_Press/0.jpg`, `${BASE_URL}/Standing_Dumbbell_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },
  'standing-dumbbell-press': {
    path: 'Standing_Dumbbell_Press',
    frames: [`${BASE_URL}/Standing_Dumbbell_Press/0.jpg`, `${BASE_URL}/Standing_Dumbbell_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },
  'machine-shoulder-press': {
    path: 'Leverage_Shoulder_Press',
    frames: [`${BASE_URL}/Leverage_Shoulder_Press/0.jpg`, `${BASE_URL}/Leverage_Shoulder_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },
  'barbell-front-raise': {
    path: 'Barbell_Front_Raise',
    frames: [`${BASE_URL}/Barbell_Front_Raise/0.jpg`, `${BASE_URL}/Barbell_Front_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=gzDawOzDe2Y',
  },
  'barbell-front-raises': {
    path: 'Barbell_Front_Raise',
    frames: [`${BASE_URL}/Barbell_Front_Raise/0.jpg`, `${BASE_URL}/Barbell_Front_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=gzDawOzDe2Y',
  },
  'bent-over-raise': {
    path: 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
    frames: [`${BASE_URL}/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg`, `${BASE_URL}/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=H530fW3kWfk',
  },
  'bent-over-raises': {
    path: 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
    frames: [`${BASE_URL}/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg`, `${BASE_URL}/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=H530fW3kWfk',
  },
  'dumbbell-side-raise': {
    path: 'Side_Lateral_Raise',
    frames: [`${BASE_URL}/Side_Lateral_Raise/0.jpg`, `${BASE_URL}/Side_Lateral_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  'lateral-raise': {
    path: 'Side_Lateral_Raise',
    frames: [`${BASE_URL}/Side_Lateral_Raise/0.jpg`, `${BASE_URL}/Side_Lateral_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  'barbell-side-raise': {
    path: 'Side_Lateral_Raise',
    frames: [`${BASE_URL}/Side_Lateral_Raise/0.jpg`, `${BASE_URL}/Side_Lateral_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  'barbell-shrug': {
    path: 'Barbell_Shrug',
    frames: [`${BASE_URL}/Barbell_Shrug/0.jpg`, `${BASE_URL}/Barbell_Shrug/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=M-5H4b1P_vM',
  },
  'dumbbell-shrug': {
    path: 'Dumbbell_Shrug',
    frames: [`${BASE_URL}/Dumbbell_Shrug/0.jpg`, `${BASE_URL}/Dumbbell_Shrug/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=g6qbq4Du13g',
  },

  // ─── ARMS (BICEPS, TRICEPS & FOREARMS) ────────────────────────────────────
  'barbell-curl': {
    path: 'Barbell_Curl',
    frames: [`${BASE_URL}/Barbell_Curl/0.jpg`, `${BASE_URL}/Barbell_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
  },
  'bicep-curl': {
    path: 'Barbell_Curl',
    frames: [`${BASE_URL}/Barbell_Curl/0.jpg`, `${BASE_URL}/Barbell_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
  },
  'dumbbell-curl': {
    path: 'Dumbbell_Bicep_Curl',
    frames: [`${BASE_URL}/Dumbbell_Bicep_Curl/0.jpg`, `${BASE_URL}/Dumbbell_Bicep_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I',
  },
  'biceps-dumbbell-press': {
    path: 'Dumbbell_Bicep_Curl',
    frames: [`${BASE_URL}/Dumbbell_Bicep_Curl/0.jpg`, `${BASE_URL}/Dumbbell_Bicep_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I',
  },
  'cable-biceps-curl-bar': {
    path: 'Cable_Curl',
    frames: [`${BASE_URL}/Cable_Curl/0.jpg`, `${BASE_URL}/Cable_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=AsAVbXupbHA',
  },
  'cable-biceps-curls': {
    path: 'Cable_Curl',
    frames: [`${BASE_URL}/Cable_Curl/0.jpg`, `${BASE_URL}/Cable_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=AsAVbXupbHA',
  },
  'cable-hammer-curl': {
    path: 'Cable_Hammer_Curls_-_Rope_Attachment',
    frames: [`${BASE_URL}/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg`, `${BASE_URL}/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=d_kXkVvK_40',
  },
  'barbell-hammer-curl': {
    path: 'Hammer_Curls',
    frames: [`${BASE_URL}/Hammer_Curls/0.jpg`, `${BASE_URL}/Hammer_Curls/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
  },
  'forearm': {
    path: 'Palms-Down_Wrist_Curl_Over_A_Bench',
    frames: [`${BASE_URL}/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg`, `${BASE_URL}/Palms-Down_Wrist_Curl_Over_A_Bench/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=uK7hLgA2Q5A',
  },
  'skullcrusher': {
    path: 'Lying_Triceps_Extension',
    frames: [`${BASE_URL}/Lying_Triceps_Extension/0.jpg`, `${BASE_URL}/Lying_Triceps_Extension/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
  },
  'cable-overhead-extension-with-rope': {
    path: 'Cable_Rope_Overhead_Triceps_Extension',
    frames: [`${BASE_URL}/Cable_Rope_Overhead_Triceps_Extension/0.jpg`, `${BASE_URL}/Cable_Rope_Overhead_Triceps_Extension/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=1u18yJcL160',
  },
  'cable-push-down': {
    path: 'Triceps_Pushdown',
    frames: [`${BASE_URL}/Triceps_Pushdown/0.jpg`, `${BASE_URL}/Triceps_Pushdown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
  },
  'tricep-pushdown': {
    path: 'Triceps_Pushdown',
    frames: [`${BASE_URL}/Triceps_Pushdown/0.jpg`, `${BASE_URL}/Triceps_Pushdown/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
  },
  'rope-pushdowns': {
    path: 'Triceps_Pushdown_-_Rope_Attachment',
    frames: [`${BASE_URL}/Triceps_Pushdown_-_Rope_Attachment/0.jpg`, `${BASE_URL}/Triceps_Pushdown_-_Rope_Attachment/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
  },
  'dumbbell-tricep-extensions': {
    path: 'Standing_Dumbbell_Triceps_Extension',
    frames: [`${BASE_URL}/Standing_Dumbbell_Triceps_Extension/0.jpg`, `${BASE_URL}/Standing_Dumbbell_Triceps_Extension/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=-Vyt2QdsR7E',
  },
  'dumbbell-overhead-triceps-extension': {
    path: 'Standing_Dumbbell_Triceps_Extension',
    frames: [`${BASE_URL}/Standing_Dumbbell_Triceps_Extension/0.jpg`, `${BASE_URL}/Standing_Dumbbell_Triceps_Extension/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=-Vyt2QdsR7E',
  },
  'triceps-machine-dip': {
    path: 'Leverage_Chest_Press',
    frames: [`${BASE_URL}/Leverage_Chest_Press/0.jpg`, `${BASE_URL}/Leverage_Chest_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=2q8E_3U3k_g',
  },
  'triceps-dip': {
    path: 'Dips_-_Triceps_Version',
    frames: [`${BASE_URL}/Dips_-_Triceps_Version/0.jpg`, `${BASE_URL}/Dips_-_Triceps_Version/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=6kALZikXxLc',
  },

  // ─── LEGS & LOWER BODY ────────────────────────────────────────────────────
  'barbell-squat': {
    path: 'Barbell_Squat',
    frames: [`${BASE_URL}/Barbell_Squat/0.jpg`, `${BASE_URL}/Barbell_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
  },
  'front-squat': {
    path: 'Front_Barbell_Squat',
    frames: [`${BASE_URL}/Front_Barbell_Squat/0.jpg`, `${BASE_URL}/Front_Barbell_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=uYumuL_G_V0',
  },
  'leg-extension': {
    path: 'Leg_Extensions',
    frames: [`${BASE_URL}/Leg_Extensions/0.jpg`, `${BASE_URL}/Leg_Extensions/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
  },
  'seated-calf-raises': {
    path: 'Seated_Calf_Raise',
    frames: [`${BASE_URL}/Seated_Calf_Raise/0.jpg`, `${BASE_URL}/Seated_Calf_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=JbyjNymZOt0',
  },
  'squat-machine-standing': {
    path: 'Hack_Squat',
    frames: [`${BASE_URL}/Hack_Squat/0.jpg`, `${BASE_URL}/Hack_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=0tn5K9NlCfo',
  },
  'dumbbell-squat': {
    path: 'Dumbbell_Squat',
    frames: [`${BASE_URL}/Dumbbell_Squat/0.jpg`, `${BASE_URL}/Dumbbell_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=v_C6VoK5fA8',
  },
  'leg-press': {
    path: 'Leg_Press',
    frames: [`${BASE_URL}/Leg_Press/0.jpg`, `${BASE_URL}/Leg_Press/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
  },
  'lying-leg-curl': {
    path: 'Lying_Leg_Curls',
    frames: [`${BASE_URL}/Lying_Leg_Curls/0.jpg`, `${BASE_URL}/Lying_Leg_Curls/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3EDRyKUw',
  },
  'seated-leg-curl': {
    path: 'Seated_Leg_Curl',
    frames: [`${BASE_URL}/Seated_Leg_Curl/0.jpg`, `${BASE_URL}/Seated_Leg_Curl/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=ELOCsoDSmrg',
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

  // ─── CORE & CONDITIONING ──────────────────────────────────────────────────
  'plank': {
    path: 'Plank',
    frames: [`${BASE_URL}/Plank/0.jpg`, `${BASE_URL}/Plank/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  },
  'decline-crunch': {
    path: 'Decline_Crunch',
    frames: [`${BASE_URL}/Decline_Crunch/0.jpg`, `${BASE_URL}/Decline_Crunch/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=Xkyk3E8F43w',
  },
  'knee-raise': {
    path: 'Hanging_Leg_Raise',
    frames: [`${BASE_URL}/Hanging_Leg_Raise/0.jpg`, `${BASE_URL}/Hanging_Leg_Raise/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_E',
  },
  'cardio': {
    path: 'Walking_Treadmill',
    frames: [`${BASE_URL}/Walking_Treadmill/0.jpg`, `${BASE_URL}/Walking_Treadmill/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=b4bM5G2i68w',
  },
  'walking': {
    path: 'Walking_Treadmill',
    frames: [`${BASE_URL}/Walking_Treadmill/0.jpg`, `${BASE_URL}/Walking_Treadmill/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=b4bM5G2i68w',
  },
  'push-up': {
    path: 'Pushups',
    frames: [`${BASE_URL}/Pushups/0.jpg`, `${BASE_URL}/Pushups/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'push-ups': {
    path: 'Pushups',
    frames: [`${BASE_URL}/Pushups/0.jpg`, `${BASE_URL}/Pushups/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'bodyweight-squat': {
    path: 'Bodyweight_Squat',
    frames: [`${BASE_URL}/Bodyweight_Squat/0.jpg`, `${BASE_URL}/Bodyweight_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
  },
  'free-squats': {
    path: 'Bodyweight_Squat',
    frames: [`${BASE_URL}/Bodyweight_Squat/0.jpg`, `${BASE_URL}/Bodyweight_Squat/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
  },
  'glute-bridge': {
    path: 'Glute_Bridge',
    frames: [`${BASE_URL}/Glute_Bridge/0.jpg`, `${BASE_URL}/Glute_Bridge/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vigk',
  },
  'reverse-lunge': {
    path: 'Bodyweight_Walking_Lunge',
    frames: [`${BASE_URL}/Bodyweight_Walking_Lunge/0.jpg`, `${BASE_URL}/Bodyweight_Walking_Lunge/1.jpg`],
    videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs',
  },
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
