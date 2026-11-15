import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const lessonSchema = ajv.compile(readJson('schemas/lesson.schema.json'));
const audioSchema = ajv.compile(readJson('schemas/audio-manifest.schema.json'));
const digest = (value) => createHash('sha256').update(value).digest('hex');

export function loadContent() {
  return {
    lessons: readdirSync(resolve(root, 'content/lessons')).filter((p) => p.endsWith('.json'))
      .sort().map((p) => readJson(`content/lessons/${p}`)),
    manifest: readJson('content/audio/manifest.json'),
    policy: readJson('content/policy-approvals.json'),
  };
}

export function validateContent({ lessons, manifest, policy }, { release = false, publicDir = resolve(root, 'public') } = {}) {
  const errors = [];
  const add = (message) => errors.push(message);
  // 👑 Cross-file validation requires structurally valid objects; malformed data must fail clearly.
  if (!audioSchema(manifest)) add(`audio schema: ${ajv.errorsText(audioSchema.errors)}`);
  if (!Array.isArray(lessons) || lessons.length === 0) add('At least one lesson is required');
  for (const lesson of Array.isArray(lessons) ? lessons : []) {
    if (!lessonSchema(lesson)) add(`lesson schema: ${ajv.errorsText(lessonSchema.errors)}`);
  }
  if (errors.length) return errors;
  const unique = (values, name) => {
    if (new Set(values).size !== values.length) add(`Duplicate ${name}`);
  };
  unique(lessons.map((l) => l.id), 'lesson ID');
  unique(manifest.entries.map((e) => e.id), 'audio ID');
  const audio = new Map(manifest.entries.map((e) => [e.id, e]));
  const coverage = new Set();
  for (const lesson of lessons) {
    unique(lesson.steps.map((s) => s.id), `step ID in ${lesson.id}`);
    const prefix = { abc: 'letter.', numbers: 'number.', colors: 'color.' }[lesson.subject];
    for (const concept of lesson.conceptIds) {
      if (!concept.startsWith(prefix)) add(`Subject/concept mismatch: ${lesson.id}`);
      coverage.add(concept);
      // 👑 Coverage must include teaching and practice rather than a declared target alone.
      for (const kind of ['teach', 'demo', 'choice', 'review']) {
        if (!lesson.steps.some((s) => s.kind === kind && s.conceptId === concept)) add(`Missing ${kind} for ${concept}`);
      }
      // 👑 The player follows array order; listing every phase does not prevent testing a child before teaching.
      const positions = ['teach', 'demo', 'choice', 'review'].map((kind) => lesson.steps.findIndex((s) => s.kind === kind && s.conceptId === concept));
      if (positions.every((index) => index >= 0) && positions.some((index, i) => i > 0 && index < positions[i - 1])) {
        add(`Out-of-order learning phases: ${lesson.id}/${concept}`);
      }
    }
    for (const step of lesson.steps) {
      if (!lesson.conceptIds.includes(step.conceptId)) add(`Undeclared concept: ${step.conceptId}`);
      const expectedVisual = { abc: 'letter', numbers: 'quantity', colors: 'color' }[lesson.subject];
      if (step.visual.kind !== expectedVisual) add(`Visual kind mismatch: ${lesson.id}/${step.id}`);
      if (step.visual.value.toLowerCase() !== step.conceptId.split('.')[1]) add(`Visual value mismatch: ${lesson.id}/${step.id}`);
      for (const ref of [step.promptAudioId, step.successAudioId, step.retryAudioId].filter(Boolean)) {
        if (!audio.has(ref)) add(`Unknown audio reference: ${ref}`);
      }
      if (step.kind === 'choice') {
        unique(step.choices.map((c) => c.id), `choice ID in ${lesson.id}/${step.id}`);
        unique(step.choices.map((c) => c.conceptId), `choice concept in ${lesson.id}/${step.id}`);
        const answer = step.choices.find((c) => c.id === step.correctChoiceId);
        if (!answer || answer.conceptId !== step.conceptId) add(`Invalid answer: ${lesson.id}/${step.id}`);
        if (step.choices.some((c) => !c.conceptId.startsWith(prefix))) add(`Choice subject mismatch: ${lesson.id}/${step.id}`);
      }
    }
    if (release && lesson.status !== 'approved') add(`Unapproved lesson: ${lesson.id}`);
  }
  for (const entry of manifest.entries) {
    const approved = entry.status === 'approved';
    if (release && !approved) add(`Unapproved audio: ${entry.id}`);
    if (entry.file) {
      const path = resolve(publicDir, entry.file);
      const rel = relative(publicDir, path);
      // 👑 Offline media must stay inside public/ and cannot escape through relative paths.
      if (rel.startsWith('..') || isAbsolute(rel) || entry.file.split('/').includes('..')) {
        add(`Unsafe audio path: ${entry.id}`);
      } else if (!existsSync(path)) {
        add(`Missing audio file: ${entry.file}`);
      } else if (approved) {
        const bytes = readFileSync(path);
        if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) add(`Audio integrity mismatch: ${entry.id}`);
      }
    }
    if (approved) {
      for (const field of ['file', 'durationMs', 'bytes', 'sha256', 'textSha256', 'licenseRef', 'approvalRef', 'voiceRef', 'modelRef']) {
        if (!entry[field]) add(`Approved audio missing ${field}: ${entry.id}`);
      }
      if (entry.textSha256 !== digest(entry.text)) add(`Stale audio script: ${entry.id}`);
      if (entry.provider === 'pending') add(`Approved audio has pending provider: ${entry.id}`);
    }
    if (entry.provider === 'elevenlabs') {
      const gate = policy?.elevenlabs;
      // 👑 Offline output must not bypass the written child-product approval.
      if (gate?.status !== 'approved' || !['writtenApprovalRef', 'voiceRightsRef', 'distributionLicenseRef', 'ownerCostApprovalRef'].every((key) => gate[key])) {
        add(`ElevenLabs approval blocked: ${entry.id}`);
      }
    }
  }
  if (release) {
    const required = [
      ...Array.from({ length: 26 }, (_, i) => `letter.${String.fromCharCode(97 + i)}`),
      ...Array.from({ length: 101 }, (_, i) => `number.${i}`),
      ...readJson('content/catalog.json').colors.map((c) => `color.${c}`),
    ];
    for (const concept of required) if (!coverage.has(concept)) add(`Missing coverage: ${concept}`);
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = validateContent(loadContent(), { release: process.argv.includes('--release') });
    if (errors.length) {
      console.error(errors.join('\n'));
      process.exitCode = 1;
    } else console.log('Content validation passed');
  } catch (error) {
    console.error(`Content validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
