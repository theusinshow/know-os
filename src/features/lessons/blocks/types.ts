export type ImportedLessonBlock = Readonly<{
  stableId: string;
  type: string;
  payload: unknown;
}>;

export type LessonBlockRendererProps = Readonly<{
  block: ImportedLessonBlock;
}>;
