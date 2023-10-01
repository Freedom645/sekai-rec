<template>
  <canvas
    :id="canvasId"
    :width="width"
    :height="height"
    @mousedown="clickCanvas($event)"
    @touchstart="clickCanvas($event)"
  ></canvas>
</template>

<script setup lang="ts">
import type { Point, Rectangle, Size } from '@/module/ImageProcessor';
import type { PropType } from 'vue';
import { watch } from 'vue';

const props = defineProps({
  canvasId: { type: String, default: () => 'RectangleCanvas' },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  nativeSize: { type: Object as PropType<Size>, required: true, validator: (size: Size) => size.w > 0 && size.h > 0 },
  rect: { type: Object as PropType<Rectangle> },
  strokeWidth: { type: Number, default: () => 2 },
  strokeColor: { type: String, default: () => 'red' },
  lineJoin: { type: String as PropType<CanvasLineJoin>, default: () => 'bevel' },
  lineCap: { type: String as PropType<CanvasLineCap>, default: () => 'butt' },
  backgroundColor: { type: String, default: () => '#FFFFFFFF' },
  readonly: { type: Boolean },
});

const emits = defineEmits<{ (e: 'update:rect', rect: Rectangle): void }>();

watch(
  () => ({ width: props.width, height: props.height, nativeSize: props.nativeSize, rect: props.rect }),
  (value) => {
    console.log('watch', value);
    clear();
    if (value.rect !== undefined) {
      drawRectangle(value.rect);
    }
  },
  { deep: true }
);

const state = {
  context: undefined as CanvasRenderingContext2D | undefined,
  coordinates: [] as Point[],
};

const getContext = (): CanvasRenderingContext2D => {
  if (state.context === undefined) {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('#' + props.canvasId);
    state.context = canvas.getContext('2d') ?? undefined;
  }
  if (state.context === undefined) {
    throw new Error('CanvasRenderingContext2D is undefined.');
  }
  return state.context;
};

const getCoordinates = (event: MouseEvent | TouchEvent): Point => {
  const isTouchEvent = (value: MouseEvent | TouchEvent): value is TouchEvent => 'touches' in value;
  if (isTouchEvent(event) && event.touches.length > 0) {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('#' + props.canvasId);
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top,
    };
  }
  return {
    x: (<MouseEvent>event).offsetX,
    y: (<MouseEvent>event).offsetY,
  };
};

const getSizeRate = (): Size => {
  return { w: props.width / props.nativeSize.w, h: props.height / props.nativeSize.h };
};

const clickCanvas = (event: MouseEvent | TouchEvent) => {
  if (props.readonly) {
    return;
  }
  const coordinate = getCoordinates(event);
  state.coordinates.push(coordinate);
  if (state.coordinates.length > 0 && state.coordinates.length % 2 === 0) {
    const p1 = state.coordinates[state.coordinates.length - 2];
    const p2 = state.coordinates[state.coordinates.length - 1];
    const rect = convertRectangle(p1, p2);

    clear();
    drawRectangle(rect);

    emits('update:rect', rect);
  }
};

const convertRectangle = (p1: Point, p2: Point): Rectangle => {
  const { w: rateX, h: rateY } = getSizeRate();

  const x = Math.round(Math.min(p1.x, p2.x) / rateX);
  const y = Math.round(Math.min(p1.y, p2.y) / rateY);
  const w = Math.round(Math.abs(p1.x - p2.x) / rateX);
  const h = Math.round(Math.abs(p1.y - p2.y) / rateY);
  return { x, y, w, h };
};

const clear = () => {
  const ctx = getContext();
  ctx.beginPath();
  ctx.clearRect(0, 0, props.width, props.height);
  ctx.fillStyle = props.backgroundColor;
  ctx.fillRect(0, 0, props.width, props.height);
};

const drawRectangle = (rect: Rectangle) => {
  const ctx = getContext();
  ctx.strokeStyle = props.strokeColor;
  ctx.lineWidth = props.strokeWidth;
  ctx.lineJoin = props.lineJoin;
  ctx.lineCap = props.lineCap;

  const { w: rateX, h: rateY } = getSizeRate();

  ctx.beginPath();
  ctx.strokeRect(rect.x * rateX, rect.y * rateY, rect.w * rateX, rect.h * rateY);
};
</script>
