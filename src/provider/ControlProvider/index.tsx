import React, { createContext, ReactNode, useState, Dispatch, SetStateAction } from 'react';

type FileInfo = {
  name: string;
  path: string;
};

type Item = {
  id: string;
  content: string;
  name: string;
  scale: number;
  frontSide: string;
  rotate: number;
  order: number;
};

type ContextProps = {
  controlStatus: boolean;
  showMenu: boolean;
  scale: number;
  hsv: Array<string>;
  sh: Array<number>;
  degree: number;
  clothModel: Array<string>;
  designUrl: FileInfo;
  items: Array<Item>;
  selectedIndex: number;
  download: boolean;
  lastIndex: number;
  setSelectedFile: Dispatch<SetStateAction<File | undefined>>; // Added line
  setShowMenu: Dispatch<SetStateAction<boolean>>;
  setControlStatus: Dispatch<SetStateAction<boolean>>;
  setScale: Dispatch<SetStateAction<number>>;
  setHSV: Dispatch<SetStateAction<Array<string>>>;
  setSH: Dispatch<SetStateAction<Array<number>>>;
  setDegree: Dispatch<SetStateAction<number>>;
  setClothModel: Dispatch<SetStateAction<Array<string>>>;
  setDesignUrl: Dispatch<SetStateAction<FileInfo>>;
  setItems: Dispatch<SetStateAction<Array<Item>>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  setDownload: Dispatch<SetStateAction<boolean>>;
  setLastIndex: Dispatch<SetStateAction<number>>;
};

type Props = {
  children: ReactNode;
};

export const ControlContext = createContext<ContextProps>({
  controlStatus: true,
  showMenu: true,
  scale: 0,
  hsv: [],
  sh: [],
  degree: 0,
  clothModel: [],
  designUrl: {
    name: '',
    path: '',
  },
  selectedIndex: -1,
  items: [],
  download: false,
  lastIndex: -1,
  setSelectedFile: () => {}, // Default value for setSelectedFile
  setShowMenu: () => {},
  setControlStatus: () => {},
  setScale: () => {},
  setHSV: () => {},
  setSH: () => {},
  setDegree: () => {},
  setClothModel: () => {},
  setDesignUrl: () => {},
  setItems: () => {},
  setSelectedIndex: () => {},
  setDownload: () => {},
  setLastIndex: () => {},
});

export const ControlProvider = ({ children }: Props) => {
  const [controlStatus, setControlStatus] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState(false);
  const [scale, setScale] = useState<number>(100);
  const [hsv, setHSV] = useState<Array<string>>(['white', 'white']);
  const [sh, setSH] = useState<Array<number>>([100, 100]);
  const [degree, setDegree] = useState<number>(0);
  const [designUrl, setDesignUrl] = useState<FileInfo>({ name: '', path: '' });
  const [clothModel, setClothModel] = useState<Array<string>>([
    'TShirt',
    'front',
    '2.8',
    '3',
    '0',
  ]);
  const [items, setItems] = useState<Array<Item>>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [download, setDownload] = useState<boolean>(false);
  const [lastIndex, setLastIndex] = useState<number>(-1);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  return (
    <ControlContext.Provider
      value={{
        controlStatus,
        showMenu,
        scale,
        hsv,
        sh,
        degree,
        clothModel,
        designUrl,
        items,
        selectedIndex,
        download,
        lastIndex,
        setSelectedFile, // Include the new function
        setControlStatus,
        setShowMenu,
        setScale,
        setHSV,
        setSH,
        setDegree,
        setClothModel,
        setDesignUrl,
        setItems,
        setSelectedIndex,
        setDownload,
        setLastIndex,
      }}
    >
      {children}
    </ControlContext.Provider>
  );
};
