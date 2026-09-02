const fs = require('fs');
const path = require('path');

const beginner = [
  // Monday (4)
  { id: 'gym-beg-mon-1', exercise_name: 'Barbell Flat Bench Press', slug: 'barbell-flat-bench-press', level: 'Beginner', day: 'Monday', split_name: 'Chest & Upper Body', sets: '3 sets', reps: '8-12 reps', target_muscle: 'Pectoralis Major, Anterior Deltoids & Triceps', equipment: 'Barbell & Bench' },
  { id: 'gym-beg-mon-2', exercise_name: 'Incline Dumbbell Bench Press', slug: 'incline-dumbbell-bench-press', level: 'Beginner', day: 'Monday', split_name: 'Chest & Upper Body', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Clavicular Pectoralis & Anterior Deltoid', equipment: 'Incline Bench & Dumbbells' },
  { id: 'gym-beg-mon-3', exercise_name: 'Face Pull', slug: 'face-pull', level: 'Beginner', day: 'Monday', split_name: 'Chest & Upper Body', sets: '3 sets', reps: '12-15 reps', target_muscle: 'Rear Deltoids, Rhomboids & Rotator Cuff', equipment: 'Cable Machine & Rope' },
  { id: 'gym-beg-mon-4', exercise_name: 'Upright Row', slug: 'upright-row', level: 'Beginner', day: 'Monday', split_name: 'Chest & Upper Body', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Lateral Deltoids & Upper Trapezius', equipment: 'Barbell or Cable' },

  // Tuesday (4)
  { id: 'gym-beg-tue-1', exercise_name: 'Barbell Squat', slug: 'barbell-squat', level: 'Beginner', day: 'Tuesday', split_name: 'Legs & Lower Body', sets: '3 sets', reps: '8-10 reps', target_muscle: 'Quadriceps, Glutes & Adductors', equipment: 'Barbell & Squat Rack' },
  { id: 'gym-beg-tue-2', exercise_name: 'Leg Extension', slug: 'leg-extension', level: 'Beginner', day: 'Tuesday', split_name: 'Legs & Lower Body', sets: '3 sets', reps: '12-15 reps', target_muscle: 'Quadriceps (Rectus Femoris)', equipment: 'Leg Extension Machine' },
  { id: 'gym-beg-tue-3', exercise_name: 'Seated Calf Raises', slug: 'seated-calf-raises', level: 'Beginner', day: 'Tuesday', split_name: 'Legs & Lower Body', sets: '3 sets', reps: '15-20 reps', target_muscle: 'Soleus & Gastrocnemius', equipment: 'Seated Calf Machine' },
  { id: 'gym-beg-tue-4', exercise_name: 'Cardio', slug: 'cardio-treadmill', level: 'Beginner', day: 'Tuesday', split_name: 'Legs & Lower Body', sets: '1 set', reps: '20 min steady state', target_muscle: 'Cardiovascular System & Endurance', equipment: 'Treadmill / Elliptical' },

  // Thursday (5)
  { id: 'gym-beg-thu-1', exercise_name: 'Dumbbell Shoulder Press', slug: 'dumbbell-shoulder-press', level: 'Beginner', day: 'Thursday', split_name: 'Shoulders, Arms & Back', sets: '3 sets', reps: '8-12 reps', target_muscle: 'Anterior & Lateral Deltoids', equipment: 'Dumbbells & Bench' },
  { id: 'gym-beg-thu-2', exercise_name: 'Cable Biceps Curl Bar', slug: 'cable-biceps-curl-bar', level: 'Beginner', day: 'Thursday', split_name: 'Shoulders, Arms & Back', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Biceps Brachii & Brachialis', equipment: 'Cable Machine & Straight Bar' },
  { id: 'gym-beg-thu-3', exercise_name: 'Biceps Dumbbell Press', slug: 'biceps-dumbbell-press', level: 'Beginner', day: 'Thursday', split_name: 'Shoulders, Arms & Back', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Biceps Brachii', equipment: 'Dumbbells' },
  { id: 'gym-beg-thu-4', exercise_name: 'T-Bar', slug: 't-bar', level: 'Beginner', day: 'Thursday', split_name: 'Shoulders, Arms & Back', sets: '3 sets', reps: '8-12 reps', target_muscle: 'Latissimus Dorsi, Rhomboids & Mid-Back', equipment: 'T-Bar Platform' },
  { id: 'gym-beg-thu-5', exercise_name: 'Pulldown', slug: 'pulldown', level: 'Beginner', day: 'Thursday', split_name: 'Shoulders, Arms & Back', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Latissimus Dorsi & Teres Major', equipment: 'Lat Pulldown Machine' },

  // Friday (4)
  { id: 'gym-beg-fri-1', exercise_name: 'Incline Bench Press', slug: 'incline-bench-press', level: 'Beginner', day: 'Friday', split_name: 'Upper Chest & Arms', sets: '3 sets', reps: '8-12 reps', target_muscle: 'Clavicular Pectoralis & Anterior Deltoid', equipment: 'Incline Barbell Bench' },
  { id: 'gym-beg-fri-2', exercise_name: 'Flat Dumbbell Press', slug: 'flat-dumbbell-press', level: 'Beginner', day: 'Friday', split_name: 'Upper Chest & Arms', sets: '3 sets', reps: '8-12 reps', target_muscle: 'Pectoralis Major & Triceps', equipment: 'Dumbbells & Flat Bench' },
  { id: 'gym-beg-fri-3', exercise_name: 'Barbell Front Raise', slug: 'barbell-front-raise', level: 'Beginner', day: 'Friday', split_name: 'Upper Chest & Arms', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Anterior Deltoid & Upper Chest', equipment: 'Barbell or EZ-Bar' },
  { id: 'gym-beg-fri-4', exercise_name: 'Dumbbell Tricep Extensions', slug: 'dumbbell-tricep-extensions', level: 'Beginner', day: 'Friday', split_name: 'Upper Chest & Arms', sets: '3 sets', reps: '10-12 reps', target_muscle: 'Triceps Brachii (Long Head)', equipment: 'Dumbbells' },

  // Saturday (4)
  { id: 'gym-beg-sat-1', exercise_name: 'Plank', slug: 'plank', level: 'Beginner', day: 'Saturday', split_name: 'Core & Conditioning', sets: '3 sets', reps: '30s hold', target_muscle: 'Rectus Abdominis & Transverse Abdominis', equipment: 'Floor Mat' },
  { id: 'gym-beg-sat-2', exercise_name: 'Decline Crunch', slug: 'decline-crunch', level: 'Beginner', day: 'Saturday', split_name: 'Core & Conditioning', sets: '3 sets', reps: '30s or 15-20 reps', target_muscle: 'Upper & Middle Rectus Abdominis', equipment: 'Decline Ab Bench' },
  { id: 'gym-beg-sat-3', exercise_name: 'Knee Raise', slug: 'knee-raise', level: 'Beginner', day: 'Saturday', split_name: 'Core & Conditioning', sets: '3 sets', reps: '30s or 12-15 reps', target_muscle: 'Lower Abdominals & Hip Flexors', equipment: 'Captains Chair / Pull-Up Bar' },
  { id: 'gym-beg-sat-4', exercise_name: 'Cardio', slug: 'cardio-treadmill', level: 'Beginner', day: 'Saturday', split_name: 'Core & Conditioning', sets: '1 set', reps: '20 min steady state', target_muscle: 'Cardiovascular System', equipment: 'Treadmill / Cycle' }
];

const intermediate = [
  // Monday (Chest - 6)
  { id: 'gym-int-mon-1', exercise_name: 'Barbell Flat Bench Press', slug: 'barbell-flat-bench-press', level: 'Intermediate', day: 'Monday', split_name: 'Chest Hypertrophy', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Sternal Pectoralis Major', equipment: 'Barbell & Flat Bench' },
  { id: 'gym-int-mon-2', exercise_name: 'Barbell Incline Bench Press', slug: 'barbell-incline-bench-press', level: 'Intermediate', day: 'Monday', split_name: 'Chest Hypertrophy', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Clavicular Pectoralis Major', equipment: 'Barbell & Incline Bench' },
  { id: 'gym-int-mon-3', exercise_name: 'Barbell Decline Bench Press', slug: 'barbell-decline-bench-press', level: 'Intermediate', day: 'Monday', split_name: 'Chest Hypertrophy', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Costal Lower Pectoralis', equipment: 'Barbell & Decline Bench' },
  { id: 'gym-int-mon-4', exercise_name: 'Dumbbell Flat Bench Press', slug: 'dumbbell-flat-bench-press', level: 'Intermediate', day: 'Monday', split_name: 'Chest Hypertrophy', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Pectoralis Major & Stabilizers', equipment: 'Dumbbells & Flat Bench' },
  { id: 'gym-int-mon-5', exercise_name: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press', level: 'Intermediate', day: 'Monday', split_name: 'Chest Hypertrophy', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Upper Chest & Anterior Delts', equipment: 'Dumbbells & Incline Bench' },
  { id: 'gym-int-mon-6', exercise_name: 'Chest Butterfly', slug: 'chest-butterfly', level: 'Intermediate', day: 'Monday', split_name: 'Chest Hypertrophy', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Pectoralis Major Peak Contraction', equipment: 'Pec Deck / Butterfly Machine' },

  // Tuesday (Back / Lats - 4)
  { id: 'gym-int-tue-1', exercise_name: 'Cable Lat Pulldown', slug: 'cable-lat-pulldown', level: 'Intermediate', day: 'Tuesday', split_name: 'Back & Lats', sets: '3-4 sets', reps: '8-12 reps', target_muscle: 'Latissimus Dorsi & Teres Major', equipment: 'Lat Pulldown Machine' },
  { id: 'gym-int-tue-2', exercise_name: 'T-Bar', slug: 't-bar', level: 'Intermediate', day: 'Tuesday', split_name: 'Back & Lats', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Mid-Back, Rhomboids & Lats', equipment: 'T-Bar Platform' },
  { id: 'gym-int-tue-3', exercise_name: 'Barbell Row', slug: 'barbell-row', level: 'Intermediate', day: 'Tuesday', split_name: 'Back & Lats', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Latissimus Dorsi, Traps & Rhomboids', equipment: 'Barbell' },
  { id: 'gym-int-tue-4', exercise_name: 'Dumbbell Rowing', slug: 'dumbbell-rowing', level: 'Intermediate', day: 'Tuesday', split_name: 'Back & Lats', sets: '3-4 sets', reps: '10-12 reps each arm', target_muscle: 'Latissimus Dorsi & Unilateral Core', equipment: 'Dumbbells & Flat Bench' },

  // Wednesday (Biceps / Forearm - 6)
  { id: 'gym-int-wed-1', exercise_name: 'Barbell Curl', slug: 'barbell-curl', level: 'Intermediate', day: 'Wednesday', split_name: 'Biceps & Forearms', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Biceps Brachii (Short & Long Head)', equipment: 'Barbell or EZ-Bar' },
  { id: 'gym-int-wed-2', exercise_name: 'Dumbbell Curl', slug: 'dumbbell-curl', level: 'Intermediate', day: 'Wednesday', split_name: 'Biceps & Forearms', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Biceps Brachii & Supinators', equipment: 'Dumbbells' },
  { id: 'gym-int-wed-3', exercise_name: 'Cable Hammer Curl', slug: 'cable-hammer-curl', level: 'Intermediate', day: 'Wednesday', split_name: 'Biceps & Forearms', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Brachioradialis & Brachialis', equipment: 'Cable Machine & Rope' },
  { id: 'gym-int-wed-4', exercise_name: 'Barbell Hammer Curl', slug: 'barbell-hammer-curl', level: 'Intermediate', day: 'Wednesday', split_name: 'Biceps & Forearms', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Brachialis & Forearms', equipment: 'Swiss Bar / Dumbbells' },
  { id: 'gym-int-wed-5', exercise_name: 'Cable Hammer Curl', slug: 'cable-hammer-curl', level: 'Intermediate', day: 'Wednesday', split_name: 'Biceps & Forearms', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Brachioradialis & Brachialis', equipment: 'Cable Machine & Rope' },
  { id: 'gym-int-wed-6', exercise_name: 'Forearm', slug: 'forearm-wrist-curl', level: 'Intermediate', day: 'Wednesday', split_name: 'Biceps & Forearms', sets: '3-4 sets', reps: '15-20 reps', target_muscle: 'Wrist Flexors & Extensors', equipment: 'Barbell & Bench' },

  // Thursday (Shoulders - 7)
  { id: 'gym-int-thu-1', exercise_name: 'Overhead Press', slug: 'overhead-press', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '6-8 reps', target_muscle: 'Anterior & Lateral Deltoids', equipment: 'Barbell & Squat Rack' },
  { id: 'gym-int-thu-2', exercise_name: 'Bent Over Raise', slug: 'bent-over-raise', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Posterior Deltoids & Infraspinatus', equipment: 'Dumbbells' },
  { id: 'gym-int-thu-3', exercise_name: 'Face Pull', slug: 'face-pull', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Rear Delts, Rhomboids & Rotators', equipment: 'Cable & Rope' },
  { id: 'gym-int-thu-4', exercise_name: 'Dumbbell Side Raise', slug: 'dumbbell-side-raise', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Lateral Deltoids', equipment: 'Dumbbells' },
  { id: 'gym-int-thu-5', exercise_name: 'Standing Dumbbell Press', slug: 'standing-dumbbell-press', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Shoulder Complex & Core Stability', equipment: 'Dumbbells' },
  { id: 'gym-int-thu-6', exercise_name: 'Barbell Shrug', slug: 'barbell-shrug', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Upper Trapezius', equipment: 'Barbell' },
  { id: 'gym-int-thu-7', exercise_name: 'Dumbbell Shrug', slug: 'dumbbell-shrug', level: 'Intermediate', day: 'Thursday', split_name: 'Shoulders & Trapezius', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Upper & Middle Trapezius', equipment: 'Heavy Dumbbells' },

  // Friday (Triceps - 6)
  { id: 'gym-int-fri-1', exercise_name: 'Skullcrusher', slug: 'skullcrusher', level: 'Intermediate', day: 'Friday', split_name: 'Triceps Isolation', sets: '3-4 sets', reps: '8-10 reps', target_muscle: 'Triceps Brachii (Medial & Long Head)', equipment: 'EZ-Bar & Flat Bench' },
  { id: 'gym-int-fri-2', exercise_name: 'Cable Overhead Extension With Rope', slug: 'cable-overhead-extension-with-rope', level: 'Intermediate', day: 'Friday', split_name: 'Triceps Isolation', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Triceps Long Head in Stretched Position', equipment: 'Cable Machine & Rope' },
  { id: 'gym-int-fri-3', exercise_name: 'Cable Push-Down', slug: 'cable-push-down', level: 'Intermediate', day: 'Friday', split_name: 'Triceps Isolation', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Triceps Lateral Head', equipment: 'Cable & V-Bar / Straight Bar' },
  { id: 'gym-int-fri-4', exercise_name: 'Dumbbell Overhead Triceps Extension', slug: 'dumbbell-overhead-triceps-extension', level: 'Intermediate', day: 'Friday', split_name: 'Triceps Isolation', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Triceps Long Head', equipment: 'Dumbbell' },
  { id: 'gym-int-fri-5', exercise_name: 'Triceps Machine Dip', slug: 'triceps-machine-dip', level: 'Intermediate', day: 'Friday', split_name: 'Triceps Isolation', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Triceps & Lower Chest', equipment: 'Dip Machine' },
  { id: 'gym-int-fri-6', exercise_name: 'Triceps Dip', slug: 'triceps-dip', level: 'Intermediate', day: 'Friday', split_name: 'Triceps Isolation', sets: '3-4 sets', reps: 'Bodyweight to Failure', target_muscle: 'Triceps Brachii & Anterior Delts', equipment: 'Parallel Dip Bars' },

  // Saturday (Legs / Squat - 4)
  { id: 'gym-int-sat-1', exercise_name: 'Barbell Squat', slug: 'barbell-squat', level: 'Intermediate', day: 'Saturday', split_name: 'Legs & Squat Strength', sets: '3-4 sets', reps: '6-8 reps', target_muscle: 'Quadriceps, Gluteus Maximus & Hamstrings', equipment: 'Barbell & Squat Rack' },
  { id: 'gym-int-sat-2', exercise_name: 'Squat Machine Standing', slug: 'squat-machine-standing', level: 'Intermediate', day: 'Saturday', split_name: 'Legs & Squat Strength', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Quadriceps & Gluteal Drive', equipment: 'Hack Squat / V-Squat Machine' },
  { id: 'gym-int-sat-3', exercise_name: 'Leg Extension', slug: 'leg-extension', level: 'Intermediate', day: 'Saturday', split_name: 'Legs & Squat Strength', sets: '3-4 sets', reps: '12-15 reps', target_muscle: 'Quadriceps Isolation', equipment: 'Leg Extension Machine' },
  { id: 'gym-int-sat-4', exercise_name: 'Dumbbell Squat', slug: 'dumbbell-squat', level: 'Intermediate', day: 'Saturday', split_name: 'Legs & Squat Strength', sets: '3-4 sets', reps: '10-12 reps', target_muscle: 'Quadriceps, Core & Grip', equipment: 'Heavy Dumbbells' }
];

const advanced = [
  // Monday (Chest + Triceps - 11)
  { id: 'gym-adv-mon-1', exercise_name: 'Bench Press', slug: 'bench-press-power', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Flat Chest', sets: '4-5 sets + 1 drop set', reps: '6-8 reps (final drop set)', target_muscle: 'Sternal Pectoralis Major & Triceps', equipment: 'Olympic Barbell & Bench' },
  { id: 'gym-adv-mon-2', exercise_name: 'Dumbbell Bench Press', slug: 'dumbbell-bench-press', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Flat Chest', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Pectoralis Major & Stabilizers', equipment: 'Heavy Dumbbells & Bench' },
  { id: 'gym-adv-mon-3', exercise_name: 'Flat Bench Dumbbell Chest Fly', slug: 'flat-bench-dumbbell-chest-fly', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Flat Chest', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Pectoralis Major in Deep Stretch', equipment: 'Dumbbells & Flat Bench' },
  { id: 'gym-adv-mon-4', exercise_name: 'Machine Bench Press', slug: 'machine-bench-press', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Flat Chest', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Chest Hypertrophy & Lockout', equipment: 'Chest Press Machine' },
  { id: 'gym-adv-mon-5', exercise_name: 'Dumbbell Pullover', slug: 'dumbbell-pullover', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Flat Chest', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Serratus Anterior, Upper Chest & Lats', equipment: 'Dumbbell & Cross-Bench' },
  { id: 'gym-adv-mon-6', exercise_name: 'Decline Bench Press', slug: 'decline-bench-press', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Decline Chest', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Lower Sternal Pectoralis', equipment: 'Barbell & Decline Bench' },
  { id: 'gym-adv-mon-7', exercise_name: 'Decline Dumbbell Press', slug: 'decline-dumbbell-press', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Decline Chest', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Lower Chest Unilateral Drive', equipment: 'Dumbbells & Decline Bench' },
  { id: 'gym-adv-mon-8', exercise_name: 'Decline Dumbbell Chest Fly', slug: 'decline-dumbbell-chest-fly', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Decline Chest', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Lower Pec Fibers & Outer Stretch', equipment: 'Dumbbells & Decline Bench' },
  { id: 'gym-adv-mon-9', exercise_name: 'Cable Crossover', slug: 'cable-crossover', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Decline Chest', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Sternal Pecs & Inner Chest Line', equipment: 'Dual Cable Machine' },
  { id: 'gym-adv-mon-10', exercise_name: 'Rope Pushdowns', slug: 'rope-pushdowns', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Triceps', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Triceps Lateral & Medial Head', equipment: 'Cable & Rope' },
  { id: 'gym-adv-mon-11', exercise_name: 'Dumbbell Triceps Extension', slug: 'dumbbell-triceps-extension', level: 'Advanced', day: 'Monday', split_name: 'Flat & Decline Chest + Triceps', section: 'Triceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Triceps Long Head', equipment: 'Dumbbell' },

  // Tuesday (Lats / Back - 9)
  { id: 'gym-adv-tue-1', exercise_name: 'T-Bar Row', slug: 't-bar-heavy', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '5-6 sets + 1 drop set', reps: '6-8 reps (heavy + drop set)', target_muscle: 'Latissimus Dorsi, Rhomboids & Erector Spinae', equipment: 'T-Bar Platform' },
  { id: 'gym-adv-tue-2', exercise_name: 'Bent-Over Row', slug: 'bent-over-row-advanced', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '6-8 reps', target_muscle: 'Latissimus Dorsi & Trapezius', equipment: 'Olympic Barbell' },
  { id: 'gym-adv-tue-3', exercise_name: 'Pulldown Workout', slug: 'pulldown-workout', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Latissimus Dorsi (Outer Flare)', equipment: 'Lat Pulldown Machine' },
  { id: 'gym-adv-tue-4', exercise_name: 'Cable Machine', slug: 'cable-machine-pulldown', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Latissimus Dorsi & Teres Major', equipment: 'Cable Straight-Bar Pulldown' },
  { id: 'gym-adv-tue-5', exercise_name: 'Bent-Over Row', slug: 'reverse-grip-bent-over-row', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Lower Lats & Biceps Assistance', equipment: 'Underhand Barbell' },
  { id: 'gym-adv-tue-6', exercise_name: 'V-Grip Lat Pulldowns', slug: 'v-grip-lat-pulldowns', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Mid-Back & Lower Lats', equipment: 'Cable & V-Bar Handle' },
  { id: 'gym-adv-tue-7', exercise_name: 'Dumbbell Row', slug: 'dumbbell-rowing', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '8-10 reps each side', target_muscle: 'Latissimus Dorsi Unilateral Strength', equipment: 'Heavy Dumbbells & Bench' },
  { id: 'gym-adv-tue-8', exercise_name: 'Seated Row', slug: 'seated-row', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Rhomboids, Middle & Lower Trapezius', equipment: 'Low Cable Row Machine' },
  { id: 'gym-adv-tue-9', exercise_name: 'Single Arm Lat Pulldowns', slug: 'single-arm-lat-pulldowns', level: 'Advanced', day: 'Tuesday', split_name: 'Heavy Lats & Mid-Back Density', sets: '4 sets', reps: '10-12 reps each arm', target_muscle: 'Unilateral Latissimus Dorsi Focus', equipment: 'High Cable & Single D-Handle' },

  // Wednesday (Squat + Biceps - 11)
  { id: 'gym-adv-wed-1', exercise_name: 'Front Squat', slug: 'front-squat', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Squat / Legs', sets: '4-5 sets', reps: '6-8 reps', target_muscle: 'Anterior Quad Dominance & Core', equipment: 'Olympic Barbell & Rack' },
  { id: 'gym-adv-wed-2', exercise_name: 'Leg Press', slug: 'leg-press', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Squat / Legs', sets: '4 sets', reps: '8-12 reps', target_muscle: 'Quadriceps, Glutes & Hamstrings', equipment: '45-Degree Leg Press Machine' },
  { id: 'gym-adv-wed-3', exercise_name: 'Lying Leg Curl', slug: 'lying-leg-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Squat / Legs', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Hamstrings (Biceps Femoris)', equipment: 'Lying Leg Curl Machine' },
  { id: 'gym-adv-wed-4', exercise_name: 'Seated Leg Curl', slug: 'seated-leg-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Squat / Legs', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Hamstrings (Semitendinosus & Semimembranosus)', equipment: 'Seated Leg Curl Machine' },
  { id: 'gym-adv-wed-5', exercise_name: 'Calf', slug: 'standing-calf-raises', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Squat / Legs', sets: '4 sets', reps: '15-20 reps', target_muscle: 'Gastrocnemius & Soleus', equipment: 'Standing Calf Machine' },
  { id: 'gym-adv-wed-6', exercise_name: 'Barbell Curl', slug: 'barbell-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Biceps', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Biceps Brachii Mass', equipment: 'Olympic Barbell' },
  { id: 'gym-adv-wed-7', exercise_name: 'Dumbbell Curl', slug: 'dumbbell-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Biceps', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Biceps Peak & Supination', equipment: 'Dumbbells' },
  { id: 'gym-adv-wed-8', exercise_name: 'Cable Biceps Curls', slug: 'cable-biceps-curls', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Biceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Continuous Biceps Tension', equipment: 'Cable Machine & Straight Bar' },
  { id: 'gym-adv-wed-9', exercise_name: 'Barbell Hammer Curl', slug: 'barbell-hammer-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Biceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Brachialis & Forearm Thickness', equipment: 'Neutral Grip Bar' },
  { id: 'gym-adv-wed-10', exercise_name: 'Cable Hammer Curl', slug: 'cable-hammer-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Biceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Brachioradialis & Brachialis', equipment: 'Cable & Rope' },
  { id: 'gym-adv-wed-11', exercise_name: 'Forearm', slug: 'forearm-wrist-curl', level: 'Advanced', day: 'Wednesday', split_name: 'Squat Power & Biceps Hypertrophy', section: 'Biceps', sets: '4 sets', reps: '15-20 reps', target_muscle: 'Wrist Flexors & Grip Strength', equipment: 'Barbell & Bench' },

  // Thursday (Shoulders - 9)
  { id: 'gym-adv-thu-1', exercise_name: 'Overhead Press (Back & Front)', slug: 'overhead-press-front-back', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '6-8 reps', target_muscle: 'Entire Deltoid Complex & Triceps', equipment: 'Olympic Barbell & Squat Rack' },
  { id: 'gym-adv-thu-2', exercise_name: 'Bent Over Raises', slug: 'bent-over-raise', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Rear Deltoids & Rhomboids', equipment: 'Dumbbells' },
  { id: 'gym-adv-thu-3', exercise_name: 'Face Pull', slug: 'face-pull', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Rear Delts & Rotator Cuff Health', equipment: 'Cable & Rope' },
  { id: 'gym-adv-thu-4', exercise_name: 'Barbell Side Raise', slug: 'barbell-side-raise', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Lateral Deltoids Width', equipment: 'Light Barbell / Dumbbells' },
  { id: 'gym-adv-thu-5', exercise_name: 'Standing Dumbbell Press', slug: 'standing-dumbbell-press', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Shoulder Drive & Core Stability', equipment: 'Heavy Dumbbells' },
  { id: 'gym-adv-thu-6', exercise_name: 'Barbell Front Raises', slug: 'barbell-front-raises', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Anterior Deltoid Striations', equipment: 'Barbell' },
  { id: 'gym-adv-thu-7', exercise_name: 'Upright Row', slug: 'upright-row', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Lateral Delts & Upper Trapezius', equipment: 'Barbell or Cable' },
  { id: 'gym-adv-thu-8', exercise_name: 'Barbell Shrug', slug: 'barbell-shrug', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Upper Trapezius Thickness', equipment: 'Heavy Barbell' },
  { id: 'gym-adv-thu-9', exercise_name: 'Dumbbell Shrug', slug: 'dumbbell-shrug', level: 'Advanced', day: 'Thursday', split_name: 'Complete Shoulder Girdle & Traps', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Upper Trapezius & Neck Stability', equipment: 'Heavy Dumbbells' },

  // Friday (Chest + Triceps - 10)
  { id: 'gym-adv-fri-1', exercise_name: 'Incline Bench Press', slug: 'incline-bench-press', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Chest', sets: '4 sets', reps: '6-8 reps', target_muscle: 'Clavicular Pecs & Anterior Delts', equipment: 'Barbell & Incline Bench' },
  { id: 'gym-adv-fri-2', exercise_name: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Chest', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Upper Chest Hypertrophy', equipment: 'Dumbbells & Incline Bench' },
  { id: 'gym-adv-fri-3', exercise_name: 'Incline Dumbbell Flye', slug: 'incline-dumbbell-flye', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Chest', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Upper Chest Deep Stretch', equipment: 'Dumbbells & Incline Bench' },
  { id: 'gym-adv-fri-4', exercise_name: 'Low Cable Flye', slug: 'low-cable-flye', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Chest', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Upper Chest Fiber Isolation', equipment: 'Low Cable Pulleys' },
  { id: 'gym-adv-fri-5', exercise_name: 'Skullcrusher', slug: 'skullcrusher', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Triceps', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Triceps Brachii Long Head', equipment: 'EZ-Bar & Flat Bench' },
  { id: 'gym-adv-fri-6', exercise_name: 'Cable Overhead Extension With Rope', slug: 'cable-overhead-extension-with-rope', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Triceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Triceps Long Head Full Extension', equipment: 'Cable & Rope' },
  { id: 'gym-adv-fri-7', exercise_name: 'Cable Push-Down', slug: 'cable-push-down', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Triceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Triceps Lateral & Medial Head', equipment: 'Cable & Straight Bar' },
  { id: 'gym-adv-fri-8', exercise_name: 'Dumbbell Overhead Triceps Extension', slug: 'dumbbell-overhead-triceps-extension', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Triceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Triceps Long Head Stretch', equipment: 'Dumbbell' },
  { id: 'gym-adv-fri-9', exercise_name: 'Triceps Machine Dip', slug: 'triceps-machine-dip', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Triceps', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Triceps Lockout & Mass', equipment: 'Dip Machine' },
  { id: 'gym-adv-fri-10', exercise_name: 'Triceps Dip', slug: 'triceps-dip', level: 'Advanced', day: 'Friday', split_name: 'Upper Chest & Triceps Blast', section: 'Triceps', sets: '4 sets', reps: 'Bodyweight to Failure', target_muscle: 'Triceps Complex', equipment: 'Parallel Dip Bars' },

  // Saturday (Squat / Legs - 4)
  { id: 'gym-adv-sat-1', exercise_name: 'Barbell Squat', slug: 'barbell-squat', level: 'Advanced', day: 'Saturday', split_name: 'Heavy Lower Body & Squat Focus', sets: '4-5 sets', reps: '4-6 reps (heavy)', target_muscle: 'Quadriceps, Gluteus Maximus & Spinal Erectors', equipment: 'Olympic Barbell & Squat Rack' },
  { id: 'gym-adv-sat-2', exercise_name: 'Squat Machine Standing', slug: 'squat-machine-standing', level: 'Advanced', day: 'Saturday', split_name: 'Heavy Lower Body & Squat Focus', sets: '4 sets', reps: '8-10 reps', target_muscle: 'Quadriceps Anterior Loading', equipment: 'Hack Squat / Standing Squat Machine' },
  { id: 'gym-adv-sat-3', exercise_name: 'Leg Extension', slug: 'leg-extension', level: 'Advanced', day: 'Saturday', split_name: 'Heavy Lower Body & Squat Focus', sets: '4 sets', reps: '12-15 reps', target_muscle: 'Quadriceps Isolation & Teardrop (VMO)', equipment: 'Leg Extension Machine' },
  { id: 'gym-adv-sat-4', exercise_name: 'Dumbbell Squat', slug: 'dumbbell-squat', level: 'Advanced', day: 'Saturday', split_name: 'Heavy Lower Body & Squat Focus', sets: '4 sets', reps: '10-12 reps', target_muscle: 'Quadriceps, Glutes & Functional Core', equipment: 'Heavy Dumbbells' }
];

const allGym = [...beginner, ...intermediate, ...advanced];

console.log('Total entries:', allGym.length);
console.log('Beginner entries:', beginner.length);
console.log('Intermediate entries:', intermediate.length);
console.log('Advanced entries:', advanced.length);

const uniqueSlugs = Array.from(new Set(allGym.map(e => e.slug)));
console.log('Unique exercise movements (slugs):', uniqueSlugs.length);

fs.writeFileSync(
  path.join(__dirname, '../data/gym-workout-seed.json'),
  JSON.stringify(allGym, null, 2),
  'utf8'
);
console.log('Successfully wrote data/gym-workout-seed.json!');
