import dbConnect from '@/lib/mongodb';
import ProcessedTextbook from '@/models/ProcessedTextbook';
import Syllabus from '@/models/Syllabus';
import User from '@/models/User';

export type SelectedClassContext = {
  batch: string;
  section: string;
  subject?: string;
  year?: string;
  semester?: string;
};

export type KnowledgeContextInput = {
  batch?: string;
  section?: string;
  subject?: string;
  year?: string;
  semester?: string;
  unitName?: string;
  unitNumber?: number;
  topics?: string[];
  question?: string;
  limit?: number;
};

export type KnowledgeContextResult = {
  syllabusId?: string;
  textbookId?: string;
  syllabusSummary: string;
  textbookContext: string;
  selectedClass: SelectedClassContext | null;
  selectedTopics: string[];
  unitNumber?: number;
};

type SemanticSearchResult = {
  chunk?: string;
  text?: string;
  content?: string;
  excerpt?: string;
  topic?: string;
  similarity?: number;
  score?: number;
  unitNumber?: number;
  pageNumber?: number;
  page?: number;
};

const normalizeBatch = (value?: string | null) => value?.includes(' - ') ? value.split(' - ')[0].trim() : value?.trim() || '';

export function parseUnitNumber(unitName?: string): number | undefined {
  if (!unitName) return undefined;

  const romanToNum: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
    x: 10,
  };

  const match = unitName.match(/unit\s*([ivx]+|[0-9]+)/i);
  if (!match) return undefined;

  const value = match[1].toLowerCase();
  return romanToNum[value] || Number.parseInt(value, 10) || undefined;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function formatTopicList(topics: unknown): string[] {
  if (!Array.isArray(topics)) return [];
  return topics
    .map((topic: any) => toText(topic?.topic || topic))
    .filter(Boolean);
}

function formatUnitSummary(subject: any): string {
  const units = Array.isArray(subject?.unitsDetailed) ? subject.unitsDetailed : [];
  const trackedTopics = Array.isArray(subject?.topics) ? subject.topics : [];

  const unitLines = units.map((unit: any) => {
    const unitTopics = Array.isArray(unit?.topics)
      ? unit.topics.map((topic: any) => toText(topic?.topic || topic)).filter(Boolean)
      : [];
    return `${toText(unit?.unitNumber ? `Unit ${unit.unitNumber}` : 'Unit')} : ${unitTopics.join(', ') || 'No topics listed'}`;
  });

  const trackedTopicLines = trackedTopics
    .map((topic: any) => `- ${toText(topic?.topic || topic)} (${topic?.status || 'not-started'})`)
    .filter(Boolean);

  return [...unitLines, ...trackedTopicLines].filter(Boolean).join('\n');
}

function formatSyllabusSummary(syllabus: any, subjectName?: string): string {
  if (!syllabus) return 'No syllabus found in the database for the selected class.';

  const subjectMatch = subjectName
    ? syllabus.subjects?.find((subject: any) => subject.name === subjectName || subject.code === subjectName)
    : null;

  const subjects = subjectMatch ? [subjectMatch] : (syllabus.subjects || []);

  const subjectBlocks = subjects.map((subject: any) => {
    const subjectTitle = `${toText(subject?.name)}${subject?.code ? ` (${subject.code})` : ''}`;
    const unitSummary = formatUnitSummary(subject);
    return [subjectTitle, unitSummary].filter(Boolean).join('\n');
  });

  return [
    `Batch: ${syllabus.batch}`,
    `Section: ${syllabus.section}`,
    `Year: ${syllabus.year}`,
    `Semester: ${syllabus.semester}`,
    `Program: ${syllabus.program || 'N/A'}`,
    `Regulation: ${syllabus.regulation || 'N/A'}`,
    '',
    ...subjectBlocks,
  ].join('\n');
}

function formatTextbookContext(results: SemanticSearchResult[]): string {
  if (!results.length) return 'No textbook excerpts matched the selected syllabus topics yet.';

  return results
    .map((result, index) => {
      const excerpt = toText(result.chunk || result.content || result.text || result.excerpt);
      const topic = toText(result.topic);
      const score = typeof result.score === 'number'
        ? result.score
        : typeof result.similarity === 'number'
          ? result.similarity
          : undefined;

      return [
        `Excerpt ${index + 1}${topic ? ` - ${topic}` : ''}${score !== undefined ? ` (score: ${score.toFixed(3)})` : ''}`,
        excerpt,
      ].filter(Boolean).join('\n');
    })
    .join('\n\n');
}

async function fetchSemanticContext(
  origin: string,
  textbookId: string,
  query: string,
  k: number,
  unitNumber?: number
): Promise<SemanticSearchResult[]> {
  const response = await fetch(`${origin}/api/ai/semantic-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      textbookId,
      k,
      unitNumber,
    }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const results = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.chunks)
        ? data.chunks
        : Array.isArray(data?.data)
          ? data.data
          : [];

  return results as SemanticSearchResult[];
}

export async function buildKnowledgeContext(
  origin: string,
  input: KnowledgeContextInput
): Promise<KnowledgeContextResult> {
  await dbConnect();

  const batch = normalizeBatch(input.batch);
  const section = input.section?.trim() || '';
  const subject = input.subject?.trim() || '';
  const year = input.year?.trim();
  const semester = input.semester?.trim();
  const unitNumber = input.unitNumber || parseUnitNumber(input.unitName);
  const selectedTopics = (input.topics || []).map((topic) => topic.trim()).filter(Boolean);

  const syllabusQuery: Record<string, unknown> = {};
  if (batch) syllabusQuery.batch = batch;
  if (section) syllabusQuery.section = section;
  if (year) syllabusQuery.year = year;
  if (semester) syllabusQuery.semester = semester;

  let syllabus: any = null;
  if (Object.keys(syllabusQuery).length > 0) {
    syllabus = await Syllabus.findOne(syllabusQuery).sort({ updatedAt: -1 }).lean();
  }

  const textbookQuery: Record<string, unknown> = { status: 'completed' };
  if (batch) textbookQuery.batch = batch;
  if (section) textbookQuery.section = section;
  if (subject) textbookQuery.subject = subject;

  let textbook = await ProcessedTextbook.findOne(textbookQuery).sort({ processedAt: -1, updatedAt: -1 }).lean();

  if (!textbook && batch && section) {
    textbook = await ProcessedTextbook.findOne({
      batch,
      section,
      status: 'completed',
    }).sort({ processedAt: -1, updatedAt: -1 }).lean();
  }

  const syllabusSummary = formatSyllabusSummary(syllabus, subject || undefined);

  let textbookContext = '';
  if (textbook?.textbookId) {
    const searchTerms = [
      subject,
      input.unitName,
      ...(selectedTopics.length > 0 ? selectedTopics : []),
      input.question,
    ]
      .map((value) => toText(value))
      .filter(Boolean)
      .join(' ');

    const query = searchTerms || subject || input.unitName || selectedTopics.join(' ') || input.question || 'course content';
    const semanticResults = await fetchSemanticContext(origin, textbook.textbookId, query, input.limit || 6, unitNumber);
    textbookContext = formatTextbookContext(semanticResults);
  }

  return {
    syllabusId: syllabus?._id?.toString(),
    textbookId: textbook?.textbookId,
    syllabusSummary,
    textbookContext,
    selectedClass: batch && section ? { batch, section, subject, year, semester } : null,
    selectedTopics,
    unitNumber,
  };
}

export async function getProfessorClassContext(userId: string, requested?: SelectedClassContext | null): Promise<SelectedClassContext | null> {
  await dbConnect();

  const professor = await User.findById(userId).select('classesTeaching').lean();
  const classes = Array.isArray(professor?.classesTeaching) ? professor.classesTeaching : [];

  if (classes.length === 0) {
    return requested || null;
  }

  const normalizedRequested = requested
    ? {
        ...requested,
        batch: normalizeBatch(requested.batch),
        section: requested.section?.trim() || '',
        subject: requested.subject?.trim() || '',
      }
    : null;

  if (normalizedRequested?.batch && normalizedRequested.section && normalizedRequested.subject) {
    const exactMatch = classes.find((classInfo: any) =>
      normalizeBatch(classInfo.batch) === normalizedRequested.batch &&
      classInfo.section === normalizedRequested.section &&
      classInfo.subject === normalizedRequested.subject
    );

    if (exactMatch) {
      return {
        batch: normalizeBatch(exactMatch.batch),
        section: exactMatch.section,
        subject: exactMatch.subject,
        year: exactMatch.year?.toString(),
        semester: exactMatch.semester?.toString(),
      };
    }
  }

  const firstClass = classes[0];
  return {
    batch: normalizeBatch(firstClass.batch),
    section: firstClass.section,
    subject: firstClass.subject,
    year: firstClass.year?.toString(),
    semester: firstClass.semester?.toString(),
  };
}
