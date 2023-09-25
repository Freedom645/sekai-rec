import { createWorker, createScheduler, PSM } from 'tesseract.js';
import { Rectangle } from './ImageProcessor';
import type { ImagePosition, AnalyzeRecord } from '@/model/Analyze';
import { Element } from '@/model/Analyze';

export const PositionData = {
  ipadPro: {
    [Element.TITLE]: new Rectangle({ x: 200, y: 15 }, { w: 700, h: 60 }),
    [Element.DIFFICULT]: new Rectangle({ x: 212, y: 104 }, { w: 212, h: 48 }),
    [Element.COMBO]: new Rectangle({ x: 270, y: 1020 }, { w: 500, h: 170 }),
    [Element.PERFECT]: new Rectangle({ x: 1110, y: 950 }, { w: 140, h: 50 }),
    [Element.GREAT]: new Rectangle({ x: 1110, y: 1014 }, { w: 140, h: 50 }),
    [Element.GOOD]: new Rectangle({ x: 1110, y: 1080 }, { w: 140, h: 50 }),
    [Element.BAD]: new Rectangle({ x: 1110, y: 1146 }, { w: 140, h: 50 }),
    [Element.MISS]: new Rectangle({ x: 1110, y: 1210 }, { w: 140, h: 50 }),
    [Element.LATE]: new Rectangle({ x: 1312, y: 1074 }, { w: 120, h: 38 }),
    [Element.FAST]: new Rectangle({ x: 1446, y: 1074 }, { w: 120, h: 38 }),
    [Element.FLICK]: new Rectangle({ x: 1456, y: 1150 }, { w: 110, h: 36 }),
  } as ImagePosition,
} as const;

interface OcrResult {
  index: number;
  key: Element;
  text: string;
}

export const analyze = async (
  data: string[],
  progress?: (state: 'setup' | 'ocr', value: number) => void
): Promise<AnalyzeRecord[]> => {
  progress?.('setup', 0);
  const { titleScheduler, scoreScheduler } = await setupScheduler();

  try {
    progress?.('ocr', 0);
    const task: Array<Promise<OcrResult>> = [];
    for (const key of Object.keys(PositionData.ipadPro) as Element[]) {
      const rect = PositionData.ipadPro[key].convertTesseractRect();
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
  for (let i = 0; i < 1; i++) {
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
