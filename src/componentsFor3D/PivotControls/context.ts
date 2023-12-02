import { createContext } from 'react';
import { Object3D } from 'three/src/Three';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Vector3 } from 'three/src/math/Vector3';

export type OnDragStartProps = {
  component: 'Arrow' | 'Slider' | 'Rotator' | 'Scale';
  axis: 0 | 1 | 2;
  origin: Vector3;
  directions: Vector3[];
};

export type PivotContext = {
  onDragStart: (props: OnDragStartProps) => void;
  onDrag: (mdW: Matrix4) => void;
  onDragEnd: () => void;
  translation: { current: [number, number, number] };
  translationLimits?: [
    [number, number] | undefined,
    [number, number] | undefined,
    [number, number] | undefined
  ];
  rotationLimits?: [
    [number, number] | undefined,
    [number, number] | undefined,
    [number, number] | undefined
  ];
  axisColors: [string | number, string | number, string | number];
  hoveredColor: string | number;
  opacity: number;
  scale: number;
  lineWidth: number;
  fixed: boolean;
  displayValues: boolean;
  depthTest: boolean;
  userData?: { [key: string]: any };
  annotationsClass?: string;
  object: any;
};

export const context = createContext<PivotContext>(null!);

const isRef = (object: any): object is React.MutableRefObject<Object3D> =>
  object && object.current;
export const resolveObject = (
  object?: Object3D | React.MutableRefObject<Object3D>,
  fallback?: Object3D | React.MutableRefObject<Object3D>
): Object3D | undefined =>
  isRef(object)
    ? object.current
    : object
    ? object
    : fallback
    ? resolveObject(fallback)
    : undefined;
