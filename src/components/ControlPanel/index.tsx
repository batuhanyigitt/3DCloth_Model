import React, { useContext, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import ColorTheme from 'components/ColorTheme';
import DesignList from 'components/DesignList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ControlContext } from 'provider/ControlProvider';
import { Scrollbars } from 'react-custom-scrollbars-2';

export default function ControlPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const SideBarRef = useRef<any>(null);
  const { setDesignUrl, setDownload, setSelectedIndex } = useContext(ControlContext);
  const [selectedFile, setSelectedFile] = useState<any>();
  const [jsonObject, setJsonObject] = useState<any>(null);
  const [undoActions, setUndoActions] = useState<any[]>([]);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleColorSelect = (color: string, name: string) => {
    if (selectedColor === color) {
      setSelectedColor(null);
      logUserAction('Color Deselected', `Color Name: ${name}, Color Code: ${color}`);
    } else {
      setSelectedColor(color);
      logUserAction('Color Selected', `Color Name: ${name}, Color Code: ${color}`);
    }
    console.log('Selected Color:', name, color);
  };

  useEffect(() => {
    if (SideBarRef.current) {
      if (sidebarOpen)
        gsap.to(SideBarRef.current, {
          duration: 1,
          ease: 'power2.out',
          x: 0,
        });
      else
        gsap.to(SideBarRef.current, {
          duration: 1,
          ease: 'power2.out',
          x: window.innerWidth >= 768 ? 393 : 230,
        });
    }
  }, [SideBarRef, sidebarOpen]);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile) as string;
    setDesignUrl({ name: selectedFile.name, path: objectUrl });
    logUserAction('Uploaded Design', selectedFile.name);
    setSelectedFile(null);
  }, [selectedFile, setDesignUrl]);

  const onSelectFile = (e: any) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    const file = e.target.files[0];

    const supportedFileTypes = ['image/png', 'image/jpeg'];
    if (!supportedFileTypes.includes(file.type)) {
      console.error('Unsupported file type:', file.type);
      alert("Sorry, the file you are trying to upload is not supported.");
      return;
    }

    setSelectedFile(file);
    e.target.value = null;
  };

  const hiddenFileInput = useRef<any>();
  const handleClick = () => {
    hiddenFileInput?.current?.click();
  };

  const handleSave = async () => {
    //const apiUrl = 'https://tuvval.com/pixpma/sql.php?server=1&db=tuvv_designer&table=designs&pos=0';
    const apiUrl = 'https://hooks.zapier.com/hooks/catch/16461614/3foexya/';
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designer: 'your_designer_id', // Değiştirilecek
          user: 'your_user_id', // Değiştirilecek
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString(),
          product: 'your_product_name', // Değiştirilecek
          colors: selectedColor,
          assets: 'your_asset_data', // Değiştirilecek
          lastactivity: lastUserAction,
        }),
      });

      if (response.ok) {
        console.log('Data sent to server successfully');
      } else {
        console.error('Error sending data to server:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending data to server:', error);
    }

    window.location.href = "./yeni-urun-ekle";
    setShowUndoModal(true);
  };

  function renderUndoModal(): React.ReactNode {
    if (showUndoModal) {
      return (
        <div className="undo-modal">
          <h2>Undo Modal</h2>
          <p>Last User Action: {lastUserAction}</p>
          <button onClick={() => setShowUndoModal(false)}>Close</button>
        </div>
      );
    }
    return null;
  }

  const logUserAction = (action: string, details?: string) => {
    const userActions = JSON.parse(localStorage.getItem('userActions') || '[]');
    const timestamp = new Date().toISOString();
    const actionData = { action, details, timestamp };
    userActions.push(actionData);
    localStorage.setItem('userActions', JSON.stringify(userActions));
    setLastUserAction(`${action} - ${details || ''}`);
    setUndoActions(userActions);
  };

  return (
    <div className='absolute top-0 right-0 border-r border-zinc-300 drop-shadow-md shadow-md text-zinc-700' ref={SideBarRef}>
      <div className='w-230 md:w-393 h-screen relative'>
        <button
          className='text-3xl h-36 border border-zinc-300 rounded-full p-3 absolute -left-9 top-1/2 hover:bg-zinc-200 drop-shadow-md shadow-md bg-white'
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <p className='mr-5'>{sidebarOpen ? '>' : '<'}</p>
        </button>
      </div>
      <div className='w-230 md:w-393 h-screen  p-5 absolute top-0 bg-white'>
        <p className='text-2xl text-black'>Color Selection</p>
        <p>
          Select the colors you want to see your design on 1 or more
          You can choose more colors.
        </p>
        <Scrollbars
          autoHide
          style={{ width: '100%', height: '100%', overflow: 'auto' }}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...style,
                backgroundColor: '#9DA4C5',
                borderRadius: '5px',
              }}
            />
          )}
        >
          <div className='flex justify-start items-center flex-wrap my-6 gap-3'>
            <ColorTheme
              color='#E7E9E7'
              name='Blanc De Blanc'
              onColorSelect={() => handleColorSelect('#E7E9E7', 'Blanc De Blanc')}
              isSelected={selectedColor === '#E7E9E7'}
            />
            <ColorTheme
              color='#635b68'
              name='Moonless Night'
              onColorSelect={() => handleColorSelect('#635b68', 'Moonless Night')}
              isSelected={selectedColor === '#635b68'}
            />
            <ColorTheme
              color='#d3c8b7'
              name='Brown'
              onColorSelect={() => handleColorSelect('#635b68', 'Moonless Night')}
              isSelected={selectedColor === '#635b68'}
            />
            <ColorTheme
              color='#414b66'
              name='Nobility Blue'
              onColorSelect={() => handleColorSelect('#635b68', 'Moonless Night')}
              isSelected={selectedColor === '#635b68'}
            />
            <ColorTheme
              color='#5f81a3'
              name='Nobility Blue'
              onColorSelect={() => handleColorSelect('#635b68', 'Moonless Night')}
              isSelected={selectedColor === '#635b68'}
            />
            <ColorTheme
              color='#6b0303'
              name='Red'
              onColorSelect={() => handleColorSelect('#635b68', 'Moonless Night')}
              isSelected={selectedColor === '#635b68'}
            />
            {/* Diğer ColorTheme bileşenleri buraya eklenmeli */}
          </div>
          <div className='relative'>
            <p className='text-2xl text-zinc-900'>Katmanlar</p>
            <DesignList />
            <input
              className={'hidden'}
              ref={hiddenFileInput}
              type='file'
              onChange={onSelectFile}
            />
            <button
              className='flex justify-start items-center text-black p-4 border-dashed border border-zinc-400 w-full font-bold space-x-3 hover:bg-zinc-100 my-2'
              onClick={handleClick}
            >
              <PlusIcon className='w-7  ' />
              <div className='flex flex-col justify-between items-start'>
                <p className='text-lg'>Add Design</p>
                <p className='text-zinc-500 text-sm'>
                  Print Area Size{' '}
                  <span className='border-b border-dashed border-zinc-500'>
                    4500 x 5100px
                  </span>{' '}
                  (300 DPI)
                </p>
              </div>
            </button>
          </div>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center mt-4'>
            <button
              className='bg-black hover:bg-zinc-800 text-white text-center px-8 py-4 rounded-full mb-2 md:mb-0 md:mr-2'
              onClick={() => {
                setSelectedIndex(-1);
                setDownload(true);
              }}
            >
              Download Assets
            </button>
            <button
              className='bg-blue-500 hover:bg-blue-600 text-white text-center px-8 py-4 rounded-full'
              onClick={handleSave}
            >
              Save
            </button>
          </div>
          <div className='mt-40' style={{ marginTop: '20px'}}>
            <p>Last User Action: {lastUserAction}</p>
          </div>

          {renderUndoModal()}
        </Scrollbars>
      </div>
    </div>
  );
}

