// ColorTheme.js
import { useContext, useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { ControlContext } from 'provider/ControlProvider';

type Props = {
  color: string;
  name: string;
  onColorSelect?: (color: string, name: string) => void; 
  isSelected: boolean;
};

export default function ColorTheme({ color, name, onColorSelect, isSelected }: Props) {
  const { hsv, setHSV } = useContext(ControlContext);
  const [isColorSelected, setColorSelected] = useState(isSelected);


  const handleColorSelect = () => {
    if (onColorSelect) {
      onColorSelect(color, name);
    }

    setColorSelected(!isColorSelected);
  };


  const toggleColorSelection = () => {
    const isColorSelected = hsv.includes(color);

    if (isColorSelected) {
      // If color is already selected, remove it
      const updatedHSV = hsv.filter((selectedColor) => selectedColor !== color);
      setHSV(updatedHSV);
    } else {
      // If color is not selected, add it
      setHSV([...hsv, color]);
    }
  };

  return (
    <div
      className='p-2 border border-zinc-300 w-40'
      style={{
        borderStyle: 'solid',
        borderWidth: isColorSelected ? '4px' : '4px',
        borderColor: isColorSelected ? '#9DA4C5' : '#EFEFEF',
      }}
      onClick={handleColorSelect}
    >
      <div className='flex justify-start items-center space-x-3 text-sm'>
        <div className='w-5 h-5' style={{ backgroundColor: color }} />
        <p>{name}</p>
      </div>
      <hr className='my-2' />
      <div className='flex justify-between items-center'>
        <p>{isColorSelected ? 'Renk Seçildi!' : 'Renk Kullan'}</p>
        {isColorSelected ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              const result = hsv.filter((ele) => ele !== color);
              setHSV(result);
              setColorSelected(false);
            }}
          >
            <XCircleIcon className='w-7 h-auto text-red-500' />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              setHSV([...hsv, color]);
              setColorSelected(true);
            }}
          >
            <PlusCircleIcon className='w-7 h-auto text-zinc-500' />
          </button>
        )}
      </div>
    </div>
  );
}