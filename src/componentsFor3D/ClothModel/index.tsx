import { useContext, useState, useEffect } from 'react';
import { ControlContext } from 'provider/ControlProvider';
import { useTexture } from '@react-three/drei';
import { text } from 'stream/consumers';

type Props = {
  frontSide: string;
};

const BackGround = ({ frontSide }: Props) => {
  const { hsv, clothModel } = useContext(ControlContext);
  const [pos, setPos] = useState([0, 0]);
  const texture = useTexture(`/assets/${clothModel[0]}/${frontSide}.png`);
  useEffect(() => {
    if (clothModel[1] === frontSide) setPos([0, 0]);
    else setPos([0, 100]);
  }, [clothModel[1]]);
  return (
    <mesh position={[pos[0], 0.01, pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[parseFloat(clothModel[2]), parseFloat(clothModel[3])]}
      />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        color={
          frontSide === 'front' ? hsv[hsv.length - 1] : hsv[hsv.length - 1]
        }
        transparent
        opacity={1}
      />
    </mesh>
  );
};

export default BackGround;
