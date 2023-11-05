import { createWorker, createScheduler, PSM } from 'tesseract.js';
import ImageProcessor from './ImageProcessor';
import type { AnalyzeRecord, DefaultKey, ThresholdNumber, ThresholdString } from '@/model/Analyze';
import { Element, ElementList, type Preset } from '@/model/Analyze';

interface OcrResult {
  index: number;
  key: Element;
  text: string;
}

export const generateThresholdUrls = async (url: string, thresholdSet: ThresholdNumber): Promise<ThresholdString> => {
  interface Task {
    key: number;
    data: string;
  }
  // 閾値の重複排除
  const thresholds = Object.values(thresholdSet).reduce((obj, value) => obj.add(value), new Set<number>());
  const tasks = await Promise.all(
    Array.from(thresholds).map(
      async (value) => ({ key: value, data: await ImageProcessor.convertThresholdImage(url, value) } as Task)
    )
  );

  // 閾値から逆マッピング
  const valueUrlMap = tasks.reduce(
    (obj, rec) => Object.assign(obj, { [rec.key]: rec.data }),
    {} as { [key: number]: string }
  );

  return (Object.keys(thresholdSet) as DefaultKey[]).reduce(
    (obj, key) => Object.assign(obj, { [key]: valueUrlMap[thresholdSet[key] ?? thresholdSet['default']] }),
    {} as ThresholdString
  );
};

export const analyze = async (
  data: ThresholdString[],
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
      const rect = preset.position[key].convertTesseractRect();
      const scheduler = key === Element.TITLE || key === Element.DIFFICULT ? titleScheduler : scoreScheduler;
      data.forEach((img, index) => {
        task.push(
          scheduler.addJob('recognize', img[key] ?? img.default, { rectangle: rect }).then((res) => ({
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
