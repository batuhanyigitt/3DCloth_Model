import { useContext, useState, useEffect } from 'react';
import { ControlContext } from 'provider/ControlProvider';
import { useTexture } from '@react-three/drei';
type Props = {
  frontSide: string;
};
const BackGround = ({ frontSide }: Props) => {
  const { clothModel } = useContext(ControlContext);
  const [pos, setPos] = useState([0, 0]);
  const texture = useTexture(`/assets/${clothModel[0]}/o${frontSide}.png`);
  useEffect(() => {
    if (clothModel[1] === frontSide) setPos([0, 0]);
    else setPos([0, 100]);
  }, [clothModel[1]]);
  return (
    <mesh position={[pos[0], 0, pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[parseFloat(clothModel[2]), parseFloat(clothModel[3])]}
      />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        transparent
        opacity={1}
      />
    </mesh>
  );
};

export default BackGround;
