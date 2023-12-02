import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { useContext, useMemo } from 'react';
import { ControlContext } from 'provider/ControlProvider';

const TextureModel = () => {
  const { scale, hsv, degree } = useContext(ControlContext);
  const model = useLoader(
    OBJLoader,
    '/assets/silk_scarf/silk_scarf_3d_model.obj'
  );
  const texture = useLoader(
    THREE.TextureLoader,
    '/assets/patterns/1_texture_original.png'
  );

  const material = useMemo(() => {
    const newTexture = texture.clone();
    newTexture.repeat.set(2 * (scale / 100), 0.8 * (scale / 100));
    newTexture.wrapS = THREE.RepeatWrapping;
    newTexture.wrapT = THREE.RepeatWrapping;
    newTexture.rotation = degree;
    return new THREE.MeshBasicMaterial({
      map: newTexture,
      lightMap: newTexture,
      transparent: true,
      color: 'hslToHex(hsv[0], hsv[1], hsv[2])',
    });
  }, [texture, scale, hsv, degree]);

  model.traverse((child: any) => {
    if (child.isMesh) {
      child.material = material;
    }
  });

  return (
    <primitive
      position={[-0.01, 0.39, 0.005]}
      scale={[1.03, 1.05, 1]}
      object={model}
    />
  );
};

export default TextureModel;
