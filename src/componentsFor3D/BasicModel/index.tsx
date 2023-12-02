import React, { useContext, useEffect, useState } from 'react';
import { ControlContext } from 'provider/ControlProvider';
import { Decal, Plane, useGLTF, useTexture } from '@react-three/drei';
import { Vector3 } from 'three/src/math/Vector3';
import { Quaternion } from 'three/src/math/Quaternion';
import { Euler } from 'three/src/math/Euler';
import { PivotControls } from 'componentsFor3D/PivotControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const position = new Vector3();
const scale = new Vector3();
const quaternion = new Quaternion();

type Props = {
  url: string;
  index: number;
  size: number;
  rot: number;
  visible: boolean;
  pos: Array<number>;
  showLastChanges: boolean; // Yeni eklenen prop
};

type GLTFResult = GLTF & {
  nodes: {
    Cloth: any;
    Cube: THREE.Mesh;
  };
  materials: object;
};

const BasicModel = ({ url, index, size, rot, visible, pos, showLastChanges }: Props) => {
  const { selectedIndex, setSelectedIndex, clothModel } = useContext(ControlContext);
  const texture = useTexture(url);
  const [update, setUpdate] = useState(0.000001);
  const [value, setValue] = useState<Array<number>>([0, 0, 0, 0, 0, 1, 1]);

  const { nodes, materials } = useGLTF(`/assets/${clothModel[0]}/${clothModel[1]}.glb`) as unknown as GLTFResult;

  useEffect(() => {
    if (update > 0.001) setUpdate(0.000001);
    else setUpdate(update + 0.000001);
  }, [clothModel[1]]);

  const { width, height } = texture.image;
  const aspectRatio = width / height;
  const positionY = 0.6 - 0.001 * (index + 1);

  const handleLeave = () => {
    // Kontrol panelinde "Evet" denilirse son yapılan değişiklikleri göster
    if (showLastChanges) {
      // Son değişikliklere geri dönme işlemleri burada yapılır
      console.log('Son değişiklikleri göster');
      // Örneğin, value state'ini kullanarak son yapılan değişiklikleri geri alabilirsiniz.
      // setValue([...]); // Geri alınan değerleri set etmek için kullanılır.
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Değişiklikleri kaydetmelerini sağlamak için bir prompt göster
      const message = 'Sayfadan ayrılmak istediğinize emin misiniz? Değişiklikler kaydedilmemiş olabilir.';
      event.returnValue = message; // Standard
      return message; // Firefox
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Event Listener'ı temizle
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // useEffect sadece bir kere çağrılsın diye boş dependency array

  return (
    <mesh
      geometry={nodes.Cloth.geometry}
      position={[pos[0], positionY, pos[1]]}
      visible={visible}
      scale={[aspectRatio * 0.5, 1, 0.5]}
      onPointerLeave={handleLeave}
    >
      <group position={[0, 0.6, parseFloat(clothModel[4])]}>
        <PivotControls
          scale={0.5}
          lineWidth={6}
          activeAxes={[true, false, true]}
          disableAxes={selectedIndex !== index}
          disableSliders={selectedIndex !== index}
          disableRotations={selectedIndex !== index}
          onDrag={(local) => {
            local.decompose(position, quaternion, scale);
            const rotation = new Euler().setFromQuaternion(quaternion);
            let yRad = rotation.y;
            if (rotation.x !== 0) yRad = -rotation.x - rotation.y;
            setValue([
              position.x,
              position.z,
              rotation.x,
              yRad,
              rotation.z,
              scale.x,
              scale.z,
            ]);
          }}
          visible={selectedIndex === index}
        />
      </group>
      <group
        rotation={[-Math.PI / 2, -value[4] + rot, 0]}
        position={[value[0], 0.5, value[1] + parseFloat(clothModel[4])]}
        scale={[
          value[5] + (texture.image.width / texture.image.height) * 0.1,
          value[6] + 0.1,
          3,
        ]}
        onPointerDown={(e) => {
          if (visible) {
            e.stopPropagation();
            setSelectedIndex(index);
          }
        }}
      >
        <Plane rotation={[value[2], 0, value[3]]}>
          <meshBasicMaterial transparent opacity={0} color={'blue'} />
        </Plane>
      </group>
      <Decal
        position={[value[0] + update, 0, value[1] + parseFloat(clothModel[4])]}
        rotation={[-Math.PI / 2, 0, value[3] + rot]}
        scale={[
          value[5] + (texture.image.width / texture.image.height) * 0.1,
          value[6] + 0.1,
          3,
        ]}
      >
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={1}
          toneMapped={false}
          color={0xffffff}
        />
      </Decal>
      <meshBasicMaterial transparent opacity={0} color={'blue'} />
    </mesh>
  );
};

export default BasicModel;
