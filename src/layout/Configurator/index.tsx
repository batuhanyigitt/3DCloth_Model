import { MapControls, Preload, useContextBridge } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ControlContext } from 'provider/ControlProvider';
import { Suspense, useContext, useRef } from 'react';
import BackGround from 'componentsFor3D/BackGround';
import ButtonGroup from 'components/ButtonGroup';
import BasicModel from 'componentsFor3D/BasicModel';
import ClothModel from 'componentsFor3D/ClothModel';
import DownLoad from 'componentsFor3D/DownLoad';

export default function Configurator() {
  const ContextBridge = useContextBridge(ControlContext);
  const { setSelectedIndex, clothModel, selectedIndex, items } =
    useContext(ControlContext);
  const ref = useRef<any>();
  return (
    <div className={'h-screen w-screen fixed ios'}>
      <Suspense fallback={null}>
        <Canvas
          orthographic
          dpr={[1, 1.5]}
          camera={{ position: [0, 2, 0], zoom: 180 }}
          raycaster={{ params: { Line: { threshold: 0.15 } } }}
          onPointerMissed={(e) => {
            e.preventDefault();
            setSelectedIndex(-1);
          }}
          style={{ backgroundColor: '#ffffff' }}
        >
          <ContextBridge>
            <BackGround frontSide='front' />
            <BackGround frontSide='back' />
            <ClothModel frontSide='back' />
            <ClothModel frontSide='front' />
            {items.map((ele, index) => {
              let pos = [0, 100];
              if (ele.frontSide === clothModel[1]) pos = [0, 0];
              return (
                <BasicModel
                  url={ele.content}
                  index={ele.order}
                  size={ele.scale}
                  rot={ele.rotate}
                  visible={true}
                  key={index}
                  pos={pos} showLastChanges={false}                />
              );
            })}
          </ContextBridge>
          <pointLight intensity={0.8} position={[0, 2, 0]} />
          <ambientLight intensity={0.4} />
          <MapControls
            ref={ref}
            panSpeed={0.2}
            minZoom={150}
            maxZoom={600}
            zoomSpeed={0.4}
            enableRotate={false}
            enabled={selectedIndex === -1}
            makeDefault
          />
          <DownLoad />
          <Preload />
        </Canvas>
      </Suspense>
      <ButtonGroup />
    </div>
  );
}