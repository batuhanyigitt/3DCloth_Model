import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';

import { ControlContext } from 'provider/ControlProvider';

export default function Home() {
  const { progress } = useProgress();
  const { controlStatus, setControlStatus } = useContext(ControlContext);
  const content = useRef<any>(null);
  const bg = useRef<any>(null);

  const [unsavedChanges, setUnsavedChanges] = useState(false); // Track unsaved changes
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Show confirmation modal

  const slideEffect = () => {
    gsap.to(content.current, {
      duration: 0.8,
      ease: 'power1.out',
      opacity: 0,
      onComplete: () => {
        gsap.to(bg.current, {
          duration: 2,
          ease: 'power1.out',
          opacity: 0,
          onComplete: () => {
            setControlStatus(true);
          },
        });
      },
    });
  };

  useEffect(() => {
    if (content.current && bg.current && progress === 100) {
      // Mark changes as unsaved when the progress is complete
      setUnsavedChanges(true);
      slideEffect();
    }
  }, [progress, content, bg]);

  useEffect(() => {
    // Add an event listener to prompt the user when they try to leave the page
    const handleBeforeUnload = (e: { preventDefault: () => void; returnValue: string; }) => {
      if (unsavedChanges) {
        // Show confirmation modal
        setShowConfirmationModal(true);

        // Prevent the default browser close behavior
        e.preventDefault();

        // Chrome requires returnValue to be set
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  const handleModalCancel = () => {
    setShowConfirmationModal(false);
  };

  const handleLeaveClick = () => {
    // Handle leaving the page (e.g., navigating to a different route)
    setShowConfirmationModal(false);
  };

  return !controlStatus ? (
    <div
      ref={bg}
      className='w-screen h-screen ios absolute top-0 z-30 flex items-center justify-center bg-zinc-900 select-none'
    >
      <Suspense fallback={null}>
        <div className='p-10 text-gray-500 h-screen ios w-screen flex justify-center items-center text-center'>
          <div
            ref={content}
            className='relative -translate-y-20 flex flex-col justify-center items-center space-y-5'
          >
            <p className='font-bold text-5xl'>TUVVAL 3D Cloth Customizer</p>
            <p className='font-bold text-2xl'>Please wait for a minute...</p>
          </div>
        </div>
      </Suspense>
      {/* Render the confirmation modal */}
      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Warning</h2>
            <p>You have unsaved changes. Are you sure you want to leave?</p>
            <button onClick={handleModalCancel}>Cancel</button>
            <button onClick={handleLeaveClick}>Leave</button>
          </div>
        </div>
      )}
    </div>
  ) : null;
}
