import { Size, useFrame, useThree } from '@react-three/fiber';

import { AxisArrow } from './AxisArrow';
import { PlaneSlider } from './PlaneSlider';
import { AxisRotator } from './AxisRotator';
import { SphereScale } from './SphereScale';
import { context, OnDragStartProps, resolveObject } from './context';
import {
  Box3,
  Camera,
  Group,
  Matrix4,
  Object3D,
  Vector3,
} from 'three/src/Three';
import {
  ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useMemo,
  MutableRefObject,
  forwardRef,
} from 'react';

const tV0 = new Vector3();
const tV1 = new Vector3();
const tV2 = new Vector3();

const getPoint2 = (point3: Vector3, camera: Camera, size: Size) => {
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  camera.updateMatrixWorld(false);
  const vector = point3.project(camera);
  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;
  return vector;
};

const getPoint3 = (point2: Vector3, camera: Camera, size: Size, zValue = 1) => {
  const vector = tV0.set(
    (point2.x / size.width) * 2 - 1,
    -(point2.y / size.height) * 2 + 1,
    zValue
  );
  vector.unproject(camera);
  return vector;
};

export const calculateScaleFactor = (
  point3: Vector3,
  radiusPx: number,
  camera: Camera,
  size: Size
) => {
  const point2 = getPoint2(tV2.copy(point3), camera, size);
  let scale = 0;
  for (let i = 0; i < 2; ++i) {
    const point2off = tV1
      .copy(point2)
      .setComponent(i, point2.getComponent(i) + radiusPx);
    const point3off = getPoint3(point2off, camera, size, point2off.z);
    scale = Math.max(scale, point3.distanceTo(point3off));
  }
  return scale;
};

const mL0 = new Matrix4();
const mW0 = new Matrix4();
const mP = new Matrix4();
const mPInv = new Matrix4();
const mW = new Matrix4();
const mL = new Matrix4();
const mL0Inv = new Matrix4();
const mdL = new Matrix4();

const bb = new Box3();
const bbObj = new Box3();
const vCenter = new Vector3();
const vSize = new Vector3();
const vAnchorOffset = new Vector3();
const vPosition = new Vector3();

const xDir = new Vector3(1, 0, 0);
const yDir = new Vector3(0, 1, 0);
const zDir = new Vector3(0, 0, 1);

type PivotControlsProps = {
  /** Scale of the gizmo, 1 */
  scale?: number;
  /** Width of the gizmo lines, this is a Line2 prop, 2.5 */
  lineWidth?: number;
  /** If fixed is true is remains constant in size, scale is now in pixels, false */
  fixed?: boolean;
  /** Pivot does not act as a group, it won't shift contents but can offset in position */
  offset?: [number, number, number];
  /** Starting rotation */
  rotation?: [number, number, number];
  /** Attached mode, requires a ref to the Object3D to be transformed */
  object?: Object3D | MutableRefObject<Object3D>;
  /** Starting matrix */
  matrix?: Matrix4;
  /** BBAnchor, each axis can be between -1/0/+1 */
  anchor?: [number, number, number];
  /** If autoTransform is true, automatically apply the local transform on drag, true */
  autoTransform?: boolean;
  /** Allows you to switch individual axes off */
  activeAxes?: [boolean, boolean, boolean];

  disableAxes?: boolean;
  disableSliders?: boolean;
  disableRotations?: boolean;

  /** Limits */
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

  /** RGB colors */
  axisColors?: [string | number, string | number, string | number];
  /** Color of the hovered item */
  hoveredColor?: string | number;
  /** CSS Classname applied to the HTML annotations */
  annotationsClass?: string;
  /** Drag start event */
  onDragStart?: (props: OnDragStartProps) => void;
  /** Drag event */
  onDrag?: (
    local: Matrix4,
    deltaL: Matrix4,
    world: Matrix4,
    deltaW: Matrix4
  ) => void;
  /** Drag end event */
  onDragEnd?: () => void;
  /** Set this to false if you want the gizmo to be visible through faces */
  depthTest?: boolean;
  displayValues?: boolean;
  opacity?: number;
  visible?: boolean;
  userData?: { [key: string]: any };
  children?: ReactNode;
};

export const PivotControls = forwardRef<Group, PivotControlsProps>(
  (
    {
      object,
      matrix,
      onDragStart,
      onDrag,
      onDragEnd,
      autoTransform = true,
      anchor,
      disableAxes = false,
      disableSliders = false,
      disableRotations = false,
      activeAxes = [true, true, true],
      offset = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = 0.8,
      lineWidth = 4,
      fixed = false,
      translationLimits,
      rotationLimits,
      depthTest = true,
      axisColors = ['#ff2060', '#20df80', '#2080ff'],
      hoveredColor = '#ffff40',
      displayValues = true,
      annotationsClass,
      opacity = 1,
      visible = true,
      userData,
      children,
    },
    fRef
  ) => {
    const invalidate = useThree((state) => state.invalidate);
    const parentRef = useRef<Group>(null!);
    const ref = useRef<Group>(null!);
    const gizmoRef = useRef<Group>(null!);
    const childrenRef = useRef<Group>(null!);
    const translation = useRef<[number, number, number]>([0, 0, 0]);

    useEffect(() => {
      if (object) {
        const target = resolveObject(object);
        if (target) {
          // An object has been attached
          const pivot = ref.current;
          const doesUpdate = target.matrixAutoUpdate;
          target.updateWorldMatrix(true, true);
          target.matrixAutoUpdate = false;
          pivot.matrix = target.matrix.clone();
          pivot.children[0].visible = true;
          return () => {
            if (doesUpdate) {
              target.matrixAutoUpdate = true;
              target.matrix.decompose(
                target.position,
                target.quaternion,
                target.scale
              );
            }
          };
        }
      }
    }, [object]);

    useLayoutEffect(() => {
      if (anchor) {
        const target = resolveObject(object, childrenRef.current);
        if (target) {
          target.updateWorldMatrix(true, true);
          mPInv.copy(target.matrixWorld).invert();
          bb.makeEmpty();
          target.traverse((obj: any) => {
            if (!obj.geometry) return;
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            mL.copy(obj.matrixWorld).premultiply(mPInv);
            bbObj.copy(obj.geometry.boundingBox);
            bbObj.applyMatrix4(mL);
            bb.union(bbObj);
          });
          vCenter.copy(bb.max).add(bb.min).multiplyScalar(0.5);
          vSize.copy(bb.max).sub(bb.min).multiplyScalar(0.5);
          vAnchorOffset
            .copy(vSize)
            .multiply(new Vector3(...anchor))
            .add(vCenter);
          vPosition.set(...offset).add(vAnchorOffset);
          gizmoRef.current.position.copy(vPosition);
          invalidate();
        }
      }
    });

    const config = useMemo(
      () => ({
        onDragStart: (props: OnDragStartProps) => {
          mL0.copy(ref.current.matrix);
          mW0.copy(ref.current.matrixWorld);
          onDragStart && onDragStart(props);
          invalidate();
        },
        onDrag: (mdW: Matrix4) => {
          mP.copy(parentRef.current.matrixWorld);
          mPInv.copy(mP).invert();
          // After applying the delta
          mW.copy(mW0).premultiply(mdW);
          mL.copy(mW).premultiply(mPInv);
          mL0Inv.copy(mL0).invert();
          mdL.copy(mL).multiply(mL0Inv);
          if (autoTransform) ref.current.matrix.copy(mL);

          // Update the attached object, if there is any
          const target = resolveObject(object);
          if (target) target.matrix.copy(mL);

          if (onDrag) onDrag(mL, mdL, mW, mdW);
          invalidate();
        },
        onDragEnd: () => {
          if (onDragEnd) onDragEnd();
          invalidate();
        },
        translation,
        translationLimits,
        rotationLimits,
        axisColors,
        hoveredColor,
        opacity,
        scale,
        lineWidth,
        fixed,
        displayValues,
        depthTest,
        userData,
        annotationsClass,
        object,
      }),
      [
        object,
        onDragStart,
        onDrag,
        onDragEnd,
        translation,
        translationLimits,
        rotationLimits,
        depthTest,
        scale,
        lineWidth,
        fixed,
        ...axisColors,
        hoveredColor,
        opacity,
        displayValues,
        userData,
        autoTransform,
        annotationsClass,
      ]
    );

    const vec = new Vector3();
    useFrame((state) => {
      if (fixed) {
        const sf = calculateScaleFactor(
          gizmoRef.current.getWorldPosition(vec),
          scale,
          state.camera,
          state.size
        );
        if (gizmoRef.current) {
          if (
            gizmoRef.current?.scale.x !== sf ||
            gizmoRef.current?.scale.y !== sf ||
            gizmoRef.current?.scale.z !== sf
          ) {
            gizmoRef.current.scale.setScalar(sf);
            state.invalidate();
          }
        }
      }
    });

    useImperativeHandle(fRef, () => ref.current, []);

    return (
      <context.Provider value={config}>
        <group ref={parentRef}>
          <group ref={ref} matrix={matrix} matrixAutoUpdate={false}>
            <group
              visible={visible}
              ref={gizmoRef}
              position={offset}
              rotation={rotation}
            >

              {!disableAxes && activeAxes[1] && (
                <AxisArrow axis={1} direction={yDir} />
              )}
              <SphereScale axis={0} direction={xDir} />
              {/* <SphereScale axis={1} direction={yDir} /> */}
              {/* <SphereScale axis={2} direction={zDir} /> */}

              {!disableSliders && activeAxes[0] && activeAxes[1] && (
                <PlaneSlider axis={2} dir1={xDir} dir2={yDir} />
              )}
              {!disableSliders && activeAxes[0] && activeAxes[2] && (
                <PlaneSlider axis={1} dir1={zDir} dir2={xDir} />
              )}
              {!disableSliders && activeAxes[2] && activeAxes[1] && (
                <PlaneSlider axis={0} dir1={yDir} dir2={zDir} />
              )}
              {!disableRotations && activeAxes[0] && activeAxes[1] && (
                <AxisRotator axis={2} dir1={xDir} dir2={yDir} />
              )}
              {!disableRotations && activeAxes[0] && activeAxes[2] && (
                <AxisRotator axis={1} dir1={zDir} dir2={xDir} />
              )}
              {!disableRotations && activeAxes[2] && activeAxes[1] && (
                <AxisRotator axis={0} dir1={yDir} dir2={zDir} />
              )}
            </group>
            <group ref={childrenRef}>{children}</group>
          </group>
        </group>
      </context.Provider>
    );
  }
);

PivotControls.displayName = 'pivoteControls';
