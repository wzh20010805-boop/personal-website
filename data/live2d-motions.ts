export const petMotions = [
  { id: "NaturalIdle36", label: "自然待机", group: "Idle", index: 0, idle: true, message: "慢慢看，我会一直在这里陪你。" },
  { id: "AttentiveIdle24", label: "专注待机", group: "Idle", index: 1, idle: true, message: "准备好啦，陪你一起发现新东西。" },
  { id: "RelaxedIdle30", label: "轻松待机", group: "Idle", index: 2, idle: true, message: "放轻松，按自己的节奏逛逛吧。" },
  { id: "Greeting8", label: "轻提袖问候", group: "Greeting", index: 0, idle: false, message: "你好呀，欢迎来到创作空间！" },
  { id: "NodYes6", label: "轻轻点头", group: "NodYes", index: 0, idle: false, message: "嗯嗯，我在认真听。" },
  { id: "HeadShake6", label: "轻轻摇头", group: "HeadShake", index: 0, idle: false, message: "换个想法，也许会有新发现。" },
  { id: "CuriousTilt8", label: "好奇歪头", group: "CuriousTilt", index: 0, idle: false, message: "咦，你发现什么有趣的东西了吗？" },
  { id: "JoySmile6", label: "开心微笑", group: "JoySmile", index: 0, idle: false, message: "能陪你逛逛，今天也很开心。" },
  { id: "SoftWink4", label: "眨个眼睛", group: "SoftWink", index: 0, idle: false, message: "送你一个小小的眨眼。" },
  { id: "LookAround12", label: "左右看看", group: "LookAround", index: 0, idle: false, message: "让我看看，这里还有什么宝藏。" },
  { id: "Thoughtful8", label: "安静思考", group: "Thoughtful", index: 0, idle: false, message: "让我想一想……灵感正在路上。" },
  { id: "Wave7", label: "挥挥手", group: "Wave", index: 0, idle: false, message: "嗨，我在这里！" },
  { id: "motion_18", label: "害羞一下", group: "Shy", index: 0, idle: false, message: "有一点害羞，但很高兴见到你。" },
  { id: "HeadTiltArmClearance", label: "轻轻侧头", group: "HeadTilt", index: 0, idle: false, message: "歪歪头，陪你想一想。" },
  { id: "HandsOnHips7", label: "双手叉腰", group: "HandsOnHips", index: 0, idle: false, message: "准备好了，今天也要元气满满。" },
  { id: "motion_19", label: "开心加油", group: "Cheer", index: 0, idle: false, message: "一起加油，今天也有新的小收获！" },
  { id: "GestureSequence18", label: "连续手势", group: "GestureSequence", index: 0, idle: false, message: "挥挥手，再摆个双手叉腰的小姿势。" },
] as const;

export type PetMotionId = (typeof petMotions)[number]["id"];

export function getPetMotion(id: string) {
  return petMotions.find((motion) => motion.id === id) ?? petMotions[0];
}
