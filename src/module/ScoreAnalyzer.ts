import { createWorker, createScheduler, PSM } from 'tesseract.js';
import { convertTesseractRect } from './ImageProcessor';
import type { AnalyzeRecord } from '@/model/Analyze';
import { Element, ElementList } from '@/model/Analyze';
import type { Preset } from '@/stores/AnalyzerSettingsStore';

interface OcrResult {
  index: number;
  key: Element;
  text: string;
}

export const analyze = async (
  data: string[],
  preset: Preset,
  progress?: (state: 'setup' | 'ocr', value: number) => void
): Promise<AnalyzeRecord[]> => {
  progress?.('setup', 0);
  const { titleScheduler, scoreScheduler } = await setupScheduler();

  if (preset === undefined) {
    throw new Error('Implementation Error.');
  }
  try {
    progress?.('ocr', 0);
    const task: Array<Promise<OcrResult>> = [];
    for (const key of ElementList) {
      console.log(key);
      const rect = convertTesseractRect(preset.position[key]);
      if (key === Element.TITLE || key === Element.DIFFICULT) {
        data.forEach((img, index) => {
          task.push(
            titleScheduler.addJob('recognize', img, { rectangle: rect }).then((res) => ({
              index: index,
              key: key,
              text: res.data.text.replace(/\r?\n$/, ''),
            }))
          );
        });
        continue;
      }
      data.forEach((img, index) => {
        task.push(
          scoreScheduler.addJob('recognize', img, { rectangle: rect }).then((res) => ({
            index: index,
            key: key,
            text: res.data.text.replace(/\r?\n$/, ''),
          }))
        );
      });
    }

    console.log('wait task');

    const sum = titleScheduler.getQueueLen() + scoreScheduler.getQueueLen();
    const results = await Promise.all(
      task.map((t) =>
        t.then((res) => {
          const rate = (sum - titleScheduler.getQueueLen() - scoreScheduler.getQueueLen()) / sum;
          progress?.('ocr', rate * 100);
          return res;
        })
      )
    );
    console.log('convert');
    progress?.('ocr', 100);
    return results.reduce((pre, curr) => {
      const dataSet: AnalyzeRecord = pre[curr.index] ?? {};
      dataSet[curr.key] = curr.text;
      pre[curr.index] = dataSet;
      return pre;
    }, [] as AnalyzeRecord[]);
  } finally {
    titleScheduler.terminate();
    scoreScheduler.terminate();
  }
};

const setupScheduler = async () => {
  const tasks: Array<Promise<unknown>> = [];

  const titleScheduler = createScheduler();
  const scoreScheduler = createScheduler();

  const addTitleWorker = async () => titleScheduler.addWorker(await createTitleWorker());
  const addScoreWorker = async () => scoreScheduler.addWorker(await createScoreWorker());

  for (let i = 0; i < 1; i++) {
    tasks.push(addTitleWorker());
  }
  for (let i = 0; i < 2; i++) {
    tasks.push(addScoreWorker());
  }

  await Promise.all(tasks);
  return { titleScheduler, scoreScheduler };
};

const createTitleWorker = async () => {
  const worker = await createWorker();
  await worker.loadLanguage('eng+jpn');
  await worker.initialize('eng+jpn');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
  });
  return worker;
};

const createScoreWorker = async () => {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
  });

  return worker;
};
