export const TEAM_LEVEL_LABELS: Record<string, string> = {
  YOUTH: "Youth",
  HIGH_SCHOOL: "High School",
  COLLEGE: "College",
  NFL: "NFL",
};

export const PLAY_TYPE_LABELS: Record<string, string> = {
  RUN: "Run",
  PASS: "Pass",
  PUNT: "Punt",
  KICKOFF: "Kickoff",
  FIELD_GOAL: "Field Goal",
  EXTRA_POINT: "Extra Point",
  TWO_POINT: "2-Point Try",
  PENALTY: "Penalty",
  KNEEL: "Kneel",
  SPIKE: "Spike",
  OTHER: "Other",
};

export const GAME_SIDE_LABELS: Record<string, string> = {
  OFFENSE: "Offense",
  DEFENSE: "Defense",
  SPECIAL_TEAMS: "Special Teams",
};

export const PARTICIPANT_ROLE_LABELS: Record<string, string> = {
  BALL_CARRIER: "Ball carrier",
  PASSER: "Passer",
  RECEIVER: "Receiver",
  TACKLE: "Tackle",
  ASSIST_TACKLE: "Assist tackle",
  SACK: "Sack",
  FORCED_FUMBLE: "Forced fumble",
  FUMBLE_RECOVERY: "Fumble recovery",
  INTERCEPTION: "Interception",
};

export const POSITIONS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "CB",
  "S",
  "K",
  "P",
  "ATH",
] as const;
