import { z } from 'zod';

const SyllabusSchema = z.object({
  year: z.string().default(''),
  semester: z.string().default(''),
  subjects: z.array(
    z.object({
      code: z.string().default(''),
      name: z.string().default(''),
      units: z.array(
        z.object({
          unitNumber: z.string().default(''),
          topics: z.array(
            z.object({
              topic: z.string().default(''),
              subtopics: z.array(z.string()).default([]),
            })
          ).default([]),
        })
      ).default([]),
    })
  ).default([]),
});

export type ParsedSyllabus = z.infer<typeof SyllabusSchema>;

function getGeminiApiKey() {
  const key =
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  return key?.trim() || '';
}

const EXACT_PROMPT = `Extract structured syllabus from the following text.

Return ONLY valid JSON in this format:

{
"year": "",
"semester": "",
"subjects": [
{
"code": "",
"name": "",
"units": [
{
"unitNumber": "",
"topics": [
{
"topic": "",
"subtopics": []
}
]
}
]
}
]
}

Rules:

* Do not add explanations
* Do not return text outside JSON
* Detect units like UNIT-I, UNIT-II
* Group topics under correct units
* Extract subject codes like CSM111`;

const FALLBACK_PROMPT = `Extract syllabus data and return STRICT valid JSON only.

Required JSON shape:
{
"year": "",
"semester": "",
"subjects": [
  {
    "code": "",
    "name": "",
    "units": [
      {
        "unitNumber": "",
        "topics": [
          {
            "topic": "",
            "subtopics": []
          }
        ]
      }
    ]
  }
]
}

Rules:
- JSON only, no markdown
- Infer year/semester when explicit labels exist
- Keep units in order
- Do not return empty subjects if subjects exist in text`;

const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash-lite'];
const RETRYABLE_HTTP_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const SUBJECT_CODE_REGEX = /\b([A-Z]{2,6}\d{2,4}[A-Z0-9]*|\d{2}[A-Z]{2,6}\d{2,4}[A-Z0-9]*)\b/;

function compactAndPrioritizeText(text: string, maxChars = 45000) {
  const normalized = text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (normalized.length <= maxChars) {
    return normalized;
  }

  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  const keywordRegex = /(unit|subject|syllabus|semester|year|course|code|module|topic)/i;
  const prioritized = lines.filter((line) => keywordRegex.test(line));
  const baseline = lines.slice(0, 400);

  const merged = [...baseline, ...prioritized];
  const deduped = Array.from(new Set(merged)).join('\n');
  return deduped.slice(0, maxChars);
}

function extractJsonObject(raw: string): string {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstCurly = raw.indexOf('{');
  const lastCurly = raw.lastIndexOf('}');

  if (firstCurly >= 0 && lastCurly > firstCurly) {
    return raw.slice(firstCurly, lastCurly + 1).trim();
  }

  return raw.trim();
}

function normalizeParsedSyllabus(data: ParsedSyllabus): ParsedSyllabus {
  return {
    year: data.year?.trim() ?? '',
    semester: data.semester?.trim() ?? '',
    subjects: (data.subjects || []).map((subject) => ({
      code: subject.code?.trim() ?? '',
      name: subject.name?.trim() ?? '',
      units: (subject.units || []).map((unit) => ({
        unitNumber: unit.unitNumber?.trim() ?? '',
        topics: (unit.topics || []).map((topic) => ({
          topic: topic.topic?.trim() ?? '',
          subtopics: (topic.subtopics || []).map((subtopic) => subtopic.trim()).filter(Boolean),
        })),
      })),
    })),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStatusCode(message: string) {
  const match = message.match(/Gemini API error:\s*(\d{3})/);
  return match ? Number(match[1]) : null;
}

function summarizeError(error: unknown, maxLength = 260) {
  const text = error instanceof Error ? error.message : String(error);
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}

function isQuotaExhaustedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /resource_exhausted|quota exceeded|limit:\s*0|billing details/i.test(error.message);
}

function isRetryableGeminiError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const statusCode = extractStatusCode(error.message);
  if (statusCode && RETRYABLE_HTTP_CODES.has(statusCode)) {
    return true;
  }

  return (
    error.name === 'AbortError' ||
    /timed out|timeout|network|unavailable|temporar/i.test(error.message)
  );
}

function safeLineToTopic(line: string) {
  const cleaned = line
    .replace(/^[-*\u2022\d.)\s]+/, '')
    .replace(/^(topic|topics?)\s*[:\-]/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';
  if (cleaned.length < 3) return '';
  if (/^(credits?|hours?|marks?|scheme|outcomes?|objectives?)[:\s]/i.test(cleaned)) return '';
  if (/^(department|program|regulation|university)\b/i.test(cleaned)) return '';
  if (/^(l\s*t\s*p\s*c|l-t-p-c|s\.no|sno|code|subject code)\b/i.test(cleaned)) return '';
  return cleaned;
}

function romanToArabic(roman: string) {
  const upper = roman.toUpperCase();
  const map: Record<string, number> = { I: 1, V: 5, X: 10 };
  let total = 0;
  for (let i = 0; i < upper.length; i += 1) {
    const current = map[upper[i]] || 0;
    const next = map[upper[i + 1]] || 0;
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

function detectAcademicSlot(text: string) {
  const normalized = text.replace(/\s+/g, ' ');

  const numericYear = normalized.match(/\b([1-4])(?:st|nd|rd|th)?\s*year\b/i)?.[1];
  const numericSem = normalized.match(/\b(?:semester|sem)\s*[:\-]?\s*([1-2])\b/i)?.[1];
  if (numericYear || numericSem) {
    return {
      year: numericYear || '',
      semester: numericSem || '',
    };
  }

  const romanMatch = normalized.match(/\b([IVX]{1,4})\s*[-/]\s*([IVX]{1,2})\b/i);
  if (romanMatch) {
    const year = String(romanToArabic(romanMatch[1]));
    const semester = String(romanToArabic(romanMatch[2]));
    if (/^[1-4]$/.test(year) && /^[1-2]$/.test(semester)) {
      return { year, semester };
    }
  }

  return { year: '', semester: '' };
}

function toHeuristicLines(text: string) {
  const baseLines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const expanded: string[] = [];

  for (const line of baseLines) {
    expanded.push(line);
    if (line.includes('|')) {
      const parts = line.split('|').map((part) => part.trim()).filter(Boolean);
      if (parts.length > 1) {
        expanded.push(parts.join(' - '));
      }
    }
  }

  return expanded;
}

function isLikelySubjectHeader(line: string) {
  if (/\bunit\b/i.test(line)) return false;
  if (/\b(course outcomes?|objectives?|textbooks?|references?)\b/i.test(line)) return false;
  if (!SUBJECT_CODE_REGEX.test(line)) return false;
  if (/\b(credits?|hours?|l\s*t\s*p\s*c|scheme|marks?)\b/i.test(line) && !/[A-Za-z]{4,}/.test(line)) {
    return false;
  }
  return true;
}

function parseSubjectHeader(line: string) {
  const codeMatch = line.match(SUBJECT_CODE_REGEX);
  const code = codeMatch?.[1] ?? '';

  let working = line;
  if (code) {
    working = working.replace(code, ' ');
  }

  const pipeParts = line.split('|').map((part) => part.trim()).filter(Boolean);
  if (pipeParts.length > 1) {
    const candidate = pipeParts
      .map((part) => part.replace(SUBJECT_CODE_REGEX, '').trim())
      .filter((part) => part.length >= 4)
      .sort((a, b) => b.length - a.length)[0];
    if (candidate) {
      working = candidate;
    }
  }

  const cleanedName = working
    .replace(/\b\d+\s*-\s*\d+\s*-\s*\d+\s*-\s*\d+\b/g, ' ')
    .replace(/\b(credits?|hours?|l\s*t\s*p\s*c|theory|practical|lab)\b/gi, ' ')
    .replace(/[-:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    code,
    name: cleanedName || 'Unnamed Subject',
  };
}

function parseUnitLabel(line: string) {
  const patterns = [
    /\bunit\s*[-: ]*([IVX]+|\d+)\b/i,
    /\b([IVX]+|\d+)\s*unit\b/i,
    /\bmodule\s*[-: ]*([IVX]+|\d+)\b/i,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match?.[1]) {
      return `UNIT-${match[1].toUpperCase()}`;
    }
  }

  return null;
}

function splitTopicAndSubtopics(topicText: string) {
  const normalized = topicText.replace(/\s+/g, ' ').trim();

  const colonSplit = normalized.split(':');
  if (colonSplit.length >= 2) {
    const topic = colonSplit[0].trim();
    const rest = colonSplit.slice(1).join(':').trim();
    const subtopics = rest
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
    return { topic, subtopics };
  }

  if (normalized.includes(' - ') && normalized.length > 40) {
    const [first, ...rest] = normalized.split(' - ');
    return {
      topic: first.trim(),
      subtopics: rest.join(' - ').split(/[;,]/).map((item) => item.trim()).filter(Boolean),
    };
  }

  return { topic: normalized, subtopics: [] as string[] };
}

function heuristicParseSyllabus(text: string): ParsedSyllabus {
  const normalized = text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const { year, semester } = detectAcademicSlot(normalized);

  const lines = toHeuristicLines(normalized);
  const subjectAnchorIndexes: number[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isLikelySubjectHeader(line)) {
      subjectAnchorIndexes.push(i);
    }
  }

  const subjects: ParsedSyllabus['subjects'] = [];

  const parseUnitsFromSection = (sectionLines: string[]) => {
    const units: ParsedSyllabus['subjects'][number]['units'] = [];
    let currentUnit: ParsedSyllabus['subjects'][number]['units'][number] | null = null;

    for (const rawLine of sectionLines) {
      const line = rawLine.replace(/\|/g, ' ').trim();
      if (!line) continue;

      const unitLabel = parseUnitLabel(line);
      if (unitLabel) {
        currentUnit = {
          unitNumber: unitLabel,
          topics: [],
        };
        units.push(currentUnit);

        const remainder = line
          .replace(/\b(unit|module)\b\s*[-: ]*([IVX]+|\d+)\b/i, '')
          .replace(/^[-: ]+/, '')
          .trim();

        if (remainder) {
          const normalizedTopic = safeLineToTopic(remainder);
          if (normalizedTopic) {
            const split = splitTopicAndSubtopics(normalizedTopic);
            currentUnit.topics.push(split);
          }
        }
        continue;
      }

      if (!currentUnit) {
        currentUnit = {
          unitNumber: 'UNIT-I',
          topics: [],
        };
        units.push(currentUnit);
      }

      const topicText = safeLineToTopic(line);
      if (!topicText) continue;

      const split = splitTopicAndSubtopics(topicText);

      if (!split.topic) continue;

      const duplicateTopic = currentUnit.topics.some(
        (existingTopic) => existingTopic.topic.toLowerCase() === split.topic.toLowerCase()
      );

      if (duplicateTopic) continue;

      currentUnit.topics.push({
        topic: split.topic,
        subtopics: split.subtopics,
      });
    }

    return units.filter((unit) => unit.topics.length > 0);
  };

  if (subjectAnchorIndexes.length > 0) {
    for (let i = 0; i < subjectAnchorIndexes.length; i += 1) {
      const start = subjectAnchorIndexes[i];
      const end = i + 1 < subjectAnchorIndexes.length ? subjectAnchorIndexes[i + 1] : lines.length;
      const header = lines[start];
      const sectionLines = lines.slice(start + 1, end);

      const parsedHeader = parseSubjectHeader(header);
      const code = parsedHeader.code;
      const name = parsedHeader.name;

      const units = parseUnitsFromSection(sectionLines);

      if (units.length) {
        subjects.push({ code, name, units });
      }
    }
  }

  if (!subjects.length) {
    const units = parseUnitsFromSection(lines);
    subjects.push({
      code: '',
      name: 'General Syllabus',
      units: units.length
        ? units
        : [
            {
              unitNumber: 'UNIT-I',
              topics: lines
                .map(safeLineToTopic)
                .filter(Boolean)
                .slice(0, 30)
                .map((topic) => splitTopicAndSubtopics(topic)),
            },
          ],
    });
  }

  const validated = SyllabusSchema.parse({
    year,
    semester,
    subjects,
  });

  return normalizeParsedSyllabus(validated);
}

export async function parseSyllabus(text: string): Promise<ParsedSyllabus> {
  const apiKey = getGeminiApiKey();

  if (!text || !text.trim()) {
    throw new Error('No input text provided for syllabus parsing.');
  }

  const preparedText = compactAndPrioritizeText(text);

  if (!apiKey) {
    console.warn(
      'Gemini key not configured. Using heuristic parser fallback. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY for AI parsing.'
    );
    return heuristicParseSyllabus(preparedText);
  }

  const callGeminiSingleAttempt = async (prompt: string, modelName: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${prompt}\n\nSyllabus text:\n${preparedText}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const modelText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!modelText) {
        throw new Error('Gemini returned an empty response.');
      }

      return modelText;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const callGeminiResilient = async (prompt: string) => {
    const collectedErrors: string[] = [];

    for (const modelName of MODEL_CANDIDATES) {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          return await callGeminiSingleAttempt(prompt, modelName);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown Gemini error';
          collectedErrors.push(`${modelName}#${attempt}: ${message}`);

          if (isQuotaExhaustedError(error)) {
            break;
          }

          if (!isRetryableGeminiError(error)) {
            break;
          }

          if (attempt < 3) {
            const backoffMs = Math.min(1500 * 2 ** (attempt - 1), 7000);
            const jitterMs = Math.floor(Math.random() * 250);
            await delay(backoffMs + jitterMs);
          }
        }
      }
    }

    throw new Error(`Gemini unavailable after retries. ${collectedErrors.join(' | ')}`);
  };

  const tryParseModelOutput = (rawModelText: string) => {
    const candidateJson = extractJsonObject(rawModelText);
    const parsed = JSON.parse(candidateJson);
    const validated = SyllabusSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error('AI returned invalid syllabus JSON structure.');
    }

    const normalized = normalizeParsedSyllabus(validated.data);
    if (!normalized.subjects.length) {
      throw new Error('AI returned empty subjects.');
    }

    return normalized;
  };

  try {
    const primaryOutput = await callGeminiResilient(EXACT_PROMPT);
    return tryParseModelOutput(primaryOutput);
  } catch (primaryError) {
    try {
      const fallbackOutput = await callGeminiResilient(FALLBACK_PROMPT);
      return tryParseModelOutput(fallbackOutput);
    } catch (fallbackError) {
      console.warn('AI unavailable, using heuristic parser fallback.', {
        primaryError: summarizeError(primaryError),
        fallbackError: summarizeError(fallbackError),
      });
      return heuristicParseSyllabus(preparedText);
    }
  }
}
