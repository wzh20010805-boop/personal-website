// Cubism L is the character's left eye, on the viewer's RIGHT.
export const FACE_DEFAULTS = Object.freeze({
  ParamEyeLStyle: 0, ParamEyeRStyle: 0, ParamIrisStyle: 0, ParamMouthStyle: 0,
  ParamMouthOpenY: 0, ParamMouthForm: 0,
  ParamEyeLOpen: 1, ParamEyeROpen: 1,
  ParamEyeBallX: 0, ParamEyeBallY: 0, ParamEyeBallForm: 0,
  ParamBrowLY: 0, ParamBrowRY: 0, ParamBrowLForm: 0, ParamBrowRForm: 0,
  ParamEyeEmotion: 0,
  ParamBlush: 0, ParamTearPool: 0, ParamTears: 0, ParamSweat: 0, ParamQuestion: 0,
});

// Iris colors are appearance choices, independent of expression snapshots.
export const IRIS_DEFAULTS = Object.freeze({ParamIrisColorL: 0, ParamIrisColorR: 0});

export const EFFECT_CONTROLS = Object.freeze([
  {key: 'blush', parameter: 'ParamBlush', label: '腮红'},
  {key: 'tearPool', parameter: 'ParamTearPool', label: '眼眶泪'},
  {key: 'tears', parameter: 'ParamTears', label: '脸颊泪'},
  {key: 'sweat', parameter: 'ParamSweat', label: '汗滴'},
  {key: 'question', parameter: 'ParamQuestion', label: '问号'},
].map(Object.freeze));

const preset = (id, label, note, mouthStyle, mouthOpen, eyeL = 0, eyeR = 0, brow = 0, extra = {}) => Object.freeze({
  id, label, note, values: Object.freeze({
    ...FACE_DEFAULTS,
    ParamEyeLStyle: eyeL, ParamEyeRStyle: eyeR, ParamMouthStyle: mouthStyle,
    ParamMouthOpenY: mouthOpen, ParamBrowLY: brow, ParamBrowRY: brow,
    ...extra,
  }),
});

export const EXPRESSIONS = Object.freeze([
  preset('neutral', '自然', '回到原本的表情', 0, 0),
  preset('smile', '微笑', '轻轻弯起嘴角', 1, 0),
  preset('open', '张嘴', '睁眼 · 自然张口', 1, .75),
  preset('happy', '开心', '弯弯的笑眼', 1, .7, 1, 1),
  preset('laugh', '大笑', '挤眼 · 放声大笑', 2, 1, 2, 2),
  preset('wink', '眨眼', '画面右侧闭眼', 1, 0, 1, 0),
  preset('surprise', '惊讶', '正常眼睛 · 小 O 形嘴', 3, .7, 0, 0, .5),
  preset('blush', '脸红', '轻轻微笑 · 双颊泛红', 1, 0, 0, 0, 0, {
    ParamBlush: .55,
  }),
  preset('shy', '害羞', '垂下视线 · 拘谨的小微笑', 1, 0, 0, 0, -.15, {
    ParamBlush: .95, ParamEyeBallY: -.45, ParamEyeBallX: -.12,
    ParamBrowLForm: -.3, ParamBrowRForm: -.3, ParamEyeEmotion: -.2,
  }),
  preset('angry', '生气', '眉头压低 · 眼神收紧', 4, 0, 0, 0, -.35, {
    ParamBrowLForm: 1, ParamBrowRForm: 1, ParamEyeEmotion: 1,
  }),
  preset('sad', '委屈', '眉头上抬 · 嘴角轻轻向下', 5, 0, 0, 0, .1, {
    ParamBrowLForm: -1, ParamBrowRForm: -1, ParamEyeEmotion: -.7,
    ParamEyeBallY: -.18,
  }),
  preset('cry', '流泪', '眼眶含泪 · 泪水沿脸颊落下', 5, .15, 0, 0, .1, {
    ParamBrowLForm: -1, ParamBrowRForm: -1, ParamEyeEmotion: -.7,
    ParamEyeBallY: -.18, ParamTearPool: 1, ParamTears: 1,
  }),
  preset('sweat', '汗滴', '有点不安 · 头侧一滴汗', 3, .2, 0, 0, 0, {
    ParamBrowLY: .2, ParamBrowRY: -.15,
    ParamBrowLForm: -.45, ParamBrowRForm: -.15,
    ParamEyeEmotion: -.2, ParamEyeBallX: -.15, ParamSweat: 1,
  }),
  preset('confused', '困惑', '一高一低的眉毛 · 小小问号', 3, .3, 0, 0, 0, {
    ParamBrowLY: .55, ParamBrowRY: -.3,
    ParamBrowLForm: -.35, ParamBrowRForm: .3,
    ParamEyeBallX: .35, ParamEyeBallY: .1, ParamQuestion: 1,
  }),
  preset('star', '星星眼', '金色星星 · 期待的小微笑', 1, 0, 0, 0, .15, {
    ParamIrisStyle: 1,
  }),
  preset('heart', '爱心眼', '红色爱心 · 喜欢藏在眼睛里', 1, 0, 0, 0, 0, {
    ParamIrisStyle: 2, ParamBlush: .4,
  }),
  preset('helpless', '无奈', '半睁眼 · 拿你没办法', 6, 0, 0, 0, -.12, {
    ParamEyeLOpen: .55, ParamEyeROpen: .55,
  }),
  preset('shocked', '吃惊', '白色圆眼 · 一时愣住', 3, 1, 3, 3, .55),
  preset('ecstatic', '超开心', '弯弯笑眼 · 开怀大笑与红晕', 2, 1, 1, 1, .15, {
    ParamBlush: 1,
  }),
]);

export const DEFAULT_STATE = Object.freeze({
  expression: 'smile', outfit: 1, view: 'face', mouthMode: 'preset', mouth: .5,
  headX: 0, headY: 0, headZ: 0, sweep: false, autoBlink: true,
  blush: 0, tearPool: 0, tears: 0, sweat: 0, question: 0,
  irisColorL: IRIS_DEFAULTS.ParamIrisColorL, irisColorR: IRIS_DEFAULTS.ParamIrisColorR,
});

const discrete = new Set(['ParamEyeLStyle', 'ParamEyeRStyle', 'ParamIrisStyle', 'ParamIrisColorL', 'ParamIrisColorR', 'ParamMouthStyle', 'ParamOutfit']);
const effects = new Set(EFFECT_CONTROLS.map(item => item.parameter));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function normalizeState(current, patch) {
  const state = {...current};
  if ('expression' in patch) {
    const expression = EXPRESSIONS.find(item => item.id === patch.expression);
    if (!expression) throw new RangeError('未知表情');
    state.expression = patch.expression;
    for (const {key, parameter} of EFFECT_CONTROLS) state[key] = expression.values[parameter];
  }
  for (const [key, options] of Object.entries({view: ['face', 'full'], mouthMode: ['preset', 'manual', 'demo']})) {
    if (key in patch) {
      if (!options.includes(patch[key])) throw new RangeError(`无效的 ${key}`);
      state[key] = patch[key];
    }
  }
  if ('outfit' in patch) {
    if (patch.outfit !== 0 && patch.outfit !== 1) throw new RangeError('服装只能是 0 或 1');
    state.outfit = patch.outfit;
  }
  for (const key of ['irisColorL', 'irisColorR']) if (key in patch) {
    if (patch[key] !== 0 && patch[key] !== 1) throw new RangeError('瞳色只能是 0（蓝）或 1（紫）');
    state[key] = patch[key];
  }
  for (const key of ['mouth', 'headX', 'headY', 'headZ']) {
    if (key in patch) {
      if (!Number.isFinite(patch[key])) throw new TypeError(`${key} 必须是有限数字`);
      state[key] = key === 'mouth' ? clamp(patch[key], 0, 1) : clamp(patch[key], -30, 30);
    }
  }
  for (const key of ['sweep', 'autoBlink']) if (key in patch) state[key] = Boolean(patch[key]);
  for (const {key} of EFFECT_CONTROLS) if (key in patch) {
    if (!Number.isFinite(patch[key])) throw new TypeError(`${key} 必须是有限数字`);
    state[key] = clamp(patch[key], 0, 1);
  }
  return state;
}

export function blinkAt(time) {
  const phase = ((time % 5.8) + 5.8) % 5.8;
  if (phase < 4.8 || phase > 5.1) return 1;
  if (phase < 4.9) return 1 - (phase - 4.8) / .1;
  if (phase < 4.95) return 0;
  return (phase - 4.95) / .15;
}

// Apply the envelope after smoothing the expression's baseline openness.
// Filtering the already blinking value delays closure and causes a final snap.
export function applyFaceBlink(values, blink) {
  return {...values,
    ParamEyeLOpen: values.ParamEyeLOpen * ([1, 2, 3].includes(values.ParamEyeLStyle) ? 1 : blink),
    ParamEyeROpen: values.ParamEyeROpen * ([1, 2, 3].includes(values.ParamEyeRStyle) ? 1 : blink),
  };
}

export function buildFacePose(state, time = 0) {
  const expression = EXPRESSIONS.find(item => item.id === state.expression);
  if (!expression) throw new RangeError('未知表情');
  const values = {...expression.values};
  values.ParamOutfit = state.outfit;
  values.ParamIrisColorL = state.irisColorL ?? IRIS_DEFAULTS.ParamIrisColorL;
  values.ParamIrisColorR = state.irisColorR ?? IRIS_DEFAULTS.ParamIrisColorR;
  for (const {key, parameter} of EFFECT_CONTROLS) values[parameter] = state[key] ?? values[parameter];
  const blink = state.autoBlink ? blinkAt(time) : 1;
  // Curved / squeezed eyes are closed drawings. White round eyes intentionally
  // stay wide open until a dedicated closed form is authored for that mode.
  // Normal eyes multiply the preset opening, so half-open eyes still close fully.
  if (state.mouthMode === 'manual') values.ParamMouthOpenY = state.mouth;
  if (state.mouthMode === 'demo') {
    const phrase = ((time % 3.6) + 3.6) % 3.6;
    values.ParamMouthOpenY = phrase > 2.7 ? 0 : clamp(.12 + .72 * Math.abs(Math.sin(time * 8.1)) * (.75 + .25 * Math.sin(time * 3.2)), 0, 1);
  }
  values.ParamAngleX = state.sweep ? Math.sin(time * .7) * 16 : state.headX;
  values.ParamAngleY = state.sweep ? Math.sin(time * .47) * 9 : state.headY;
  values.ParamAngleZ = state.sweep ? Math.sin(time * .53) * 6 : state.headZ;
  return applyFaceBlink(values, blink);
}

export function blendFacePose(previous, target, dt) {
  const amount = 1 - Math.exp(-Math.max(0, dt) * 18);
  return Object.fromEntries(Object.entries(target).map(([id, value]) => [id,
    // Switching away from an effect removes it immediately, including when dt
    // is zero. Its previous expression must not leave tears on an angry face.
    discrete.has(id) || (effects.has(id) && value === 0)
      || (id === 'ParamEyeLOpen' && target.ParamEyeLStyle === 3)
      || (id === 'ParamEyeROpen' && target.ParamEyeRStyle === 3)
      || previous[id] === undefined
      ? value : previous[id] + (value - previous[id]) * amount,
  ]));
}
