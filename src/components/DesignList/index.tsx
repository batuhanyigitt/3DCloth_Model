import { ControlContext } from 'provider/ControlProvider';
import { useContext, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

import { TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';

const grid = 8;

interface Item {
  id: string;
  content: string;
  name: string;
  scale: number;
  frontSide: string;
  rotate: number;
  order: number;
}

const reorder = (
  list: Item[],
  startIndex: number,
  endIndex: number
): Item[] => {
  const origin = JSON.parse(JSON.stringify(list));
  const result = [...list].sort((a, b) => a.order - b.order);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  const clonedArray = JSON.parse(JSON.stringify(result));
  for (let i = 0; i < origin.length; i++) {
    const inx = result.findIndex((obj) => obj.order === origin[i].order);
    origin[i].order = inx;
  }
  return origin;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? '#F3F3F3' : 'white',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  padding: grid,
  width: '100%',
});

export default function DesignList() {
  const {
    designUrl,
    clothModel,
    items,
    lastIndex,
    setLastIndex,
    setItems,
    setDesignUrl,
    selectedIndex,
    setSelectedIndex,
  } = useContext(ControlContext);

  const [array, setArray] = useState(items);
  useEffect(() => {
    if (designUrl.path !== '' && items.length < 5) {
      setItems([
        ...items,
        {
          id: `${designUrl.path}`,
          content: designUrl.path,
          name: designUrl.name,
          scale: 0.8,
          frontSide: clothModel[1],
          rotate: 0,
          order: lastIndex + 1,
        },
      ]);
      setArray([
        ...items,
        {
          id: `${designUrl.path}`,
          content: designUrl.path,
          name: designUrl.name,
          scale: 0.8,
          frontSide: clothModel[1],
          rotate: 0,
          order: lastIndex + 1,
        },
      ]);
      setLastIndex(lastIndex + 1);
      setDesignUrl({
        name: '',
        path: '',
      });
    }
  }, [clothModel, designUrl, items, lastIndex, setDesignUrl, setItems, setLastIndex]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    setItems([...newItems]);
    setArray([...newItems]);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='droppable'>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {array

              .sort((a, b) => a.order - b.order)
              .map((item, index) => {
                return item.frontSide === clothModel[1] ? (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        id='customDraggItem'
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                        className='relative border border-zinc-400'
                        onPointerDown={(e) => {
                          setSelectedIndex(index);
                        }}
                      >
                        <div className='flex md:flex-row flex-col justify-between items-center w-full'>
                          <div className='flex md:flex-row flex-col items-center justify-between space-x-2'>
                            <img
                              src={item.content}
                              className='w-10 h-10 border border-zinc-400'
                            />
                            <div className='w-full md:w-48 text-center'>
                              <p
                                className='font-bold'
                                style={{
                                  color:
                                    selectedIndex === index
                                      ? '#FF0000'
                                      : 'black',
                                }}
                              >
                                {item.name}
                              </p>
                              <p className='text-yellow-600 text-sm border-t border-dashed border-zinc-500'>
                                Medium Resolution (150DPI)
                              </p>
                            </div>
                          </div>
                          <div className='flex justify-end'>
                            <button>
                              <TrashIcon
                                className='w-6 text-zinc-500'
                                onClick={(e) => {
                                  e.preventDefault();
                                  const newItems = items.filter(
                                    (ele) => ele.id !== item.id
                                  );
                                  setSelectedIndex(-1);
                                  setItems(newItems);
                                  setArray(newItems);
                                }}
                              />
                            </button>
                            <div className='relative text-zinc-400'>
                              <EllipsisVerticalIcon className='h-6' />
                              <EllipsisVerticalIcon className='h-6 absolute top-0 left-2' />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ) : null;
              })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {items.length === 5 && (
        <p className='text-red-600 font-bold'>
          You can add less than 6 textures.
        </p>
      )}
    </DragDropContext>
  );
}
