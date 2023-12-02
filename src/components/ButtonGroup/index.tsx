import Button from 'components/Button';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { useContext, useEffect, useState } from 'react';
import { ControlContext } from 'provider/ControlProvider';

type Data = {
  value: number;
  id: string;
};

export default function ButtonGroup() {
  const { clothModel, setClothModel } = useContext(ControlContext);
  // const [size, setSize] = useState<Data>({ value: 100, id: '' });
  // useEffect(() => {
  //   if (selectedIndex < 0) setSize({ id: '', value: 100 });
  //   else {
  //     setSize({
  //       value: items[selectedIndex].scale * 100,
  //       id: items[selectedIndex].id,
  //     });
  //   }
  // }, [selectedIndex]);
  // useEffect(() => {
  //   if (selectedIndex < 0) return;
  //   items[selectedIndex].scale = size.value / 100;
  //   setItems([...items]);
  // }, [size]);
  // const addRot = (rot: number) => {
  //   if (selectedIndex < 0) return;
  //   items[selectedIndex].rotate += rot;
  //   setItems([...items]);
  // };
  return (
    <div className='absolute flex md:flex-row flex-col justify-center items-center bottom-10 inset-x-0 left-1/2 -translate-x-1/2'>
      <div className='flex justify-center items-center space-x-4 lg:space-x-12'>
        <Button
          active={clothModel[1] === 'front'}
          onClick={(e) => {
            e.preventDefault();
            setClothModel([
              clothModel[0],
              'front',
              clothModel[2],
              clothModel[3],
              clothModel[4],
            ]);
          }}
        >
          Front
        </Button>
        <Button
          active={clothModel[1] === 'back'}
          onClick={(e) => {
            e.preventDefault();
            setClothModel([
              clothModel[0],
              'back',
              clothModel[2],
              clothModel[3],
              clothModel[4],
            ]);
          }}
        >
          Back
        </Button>
      </div>
      {/* <div
        className='max-w-fit rounded-full drop-shadow-md shadow-md flex justify-around items-center py-2 px-5 font-bold h-16 bg-white space-x-8 '
        style={{ color: selectedIndex < 0 ? '#C7C6C6' : '#666666' }}
      >
        <div className='flex justify-between items-center space-x-5 md:space-x-9 drop-shadow-none shadow-none'>
          <button
            onClick={(e) => {
              e.preventDefault();
              addRot(Math.PI / 2);
            }}
          >
            <ArrowUturnLeftIcon className='w-4 md:w-8' />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              addRot(-Math.PI / 2);
            }}
          >
            <ArrowUturnRightIcon className='w-4 md:w-8' />
          </button>
        </div>
        <div className='flex justify-between items-center space-x-3 md:space-x-7 drop-shadow-none shadow-none'>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (size.value > 1 && selectedIndex > -1)
                setSize({ value: size.value - 1, id: size.id });
            }}
          >
            <MinusIcon className='w-4 md:w-8 hover:text-black' />
          </button>
          <p>{size.value.toFixed(0)}%</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (size.value < 100 && selectedIndex > -1)
                setSize({ value: size.value + 1, id: size.id });
            }}
          >
            <PlusIcon className='w-4 md:w-8 hover:text-black' />
          </button>
        </div>
      </div> */}
    </div>
  );
}
