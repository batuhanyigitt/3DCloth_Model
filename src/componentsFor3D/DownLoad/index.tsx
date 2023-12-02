import { useContext, useEffect } from 'react';
import { ControlContext } from 'provider/ControlProvider';
import { useThree } from '@react-three/fiber';
import JSZip from 'jszip';


const DownLoad = () => {
  const { clothModel, download, setDownload, items } =
    useContext(ControlContext);
  const { gl, scene, camera } = useThree();
  const getFileName = (url: string) => {
    const segments = url.split('/');
    return segments[segments.length - 1];
  };

  useEffect(() => {
    if (download) {
      const fCam = camera.clone();
      const bCam = camera.clone();
      bCam.position.set(0, 2, 100);
      fCam.position.set(0, 2, 0);
      bCam.zoom = 180;
      fCam.zoom = 180;
      bCam.updateProjectionMatrix();
      fCam.updateProjectionMatrix();
      const zip = new JSZip();
      let urls = items.map((item) => item.content);
      urls = [
        `/assets/${clothModel[0]}/ofront.png`,
        `/assets/${clothModel[0]}/oback.png`,
        ...urls,
      ];

      const saveFrontScreenshot = async () => {
        return new Promise((resolve) => {
          gl.domElement.toBlob(
            (blob) => {
              if (blob) {
                resolve(
                  zip.file(
                    clothModel[1] === 'front'
                      ? 'modelFrontTexture.png'
                      : 'modelBackTexture.png',
                    blob
                  )
                );
              } else {
                console.error('Error: Front screenshot blob is null');
                resolve(null);
              }
            },
            'image/png',
            1
          );
        });
      };

      const saveBackScreenshot = async () => {
        return new Promise((resolve) => {
          gl.domElement.toBlob(
            (blob) => {
              if (blob) {
                resolve(
                  zip.file(
                    clothModel[1] === 'front'
                      ? 'modelBackTexture.png'
                      : 'modelFrontTexture.png',
                    blob
                  )
                );
              } else {
                console.error('Error: Back screenshot blob is null');
                resolve(null);
              }
            },
            'image/png',
            1
          );
        });
      };

      const fetchAndStoreData = async (urls: any[]) => {
        const filePromises = urls.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          const name = getFileName(url);
          return { blob, name };
        });

        return Promise.all(filePromises);
      };

      const createJsonData = async () => {
        const designerParam = new Date().getTime().toString();
        const jsonData = {
          assetUrl: `./yeni-urun-ekle/?designer=${designerParam}`,
          designer: designerParam, // Change this to match your server's expected keys
          user: 'your-user-id',
          date: new Date().toLocaleDateString('en-US'),
          time: new Date().toLocaleTimeString('en-US'),
          product: clothModel[0],
          colors: 'colors-data', // Replace with actual color data
          assets: 'assets-data', // Replace with actual asset data
          lastactivity: 'last-activity-data', // Replace with actual last activity data
          // Add more data fields as needed
        };
        const apiUrl = './server/saveData.php'; 

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonData,
              // Include other data needed for the database insert
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

        // Print JSON data to the console
        console.log('JSON Data:', jsonData);
        window.location.href = "./yeni-urun-ekle";
        //const apiUrl = './yeni-urun-ekle';
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        })
          .then(response => response.json())
          .then(data => {
            // Handle the response from the server if needed
            console.log('Server response:', data);
            window.location.href = "./yeni-urun-ekle";
          })
          .catch(error => {
            console.error('Error during server request:', error);
          });

        zip.file('metadata.json', JSON.stringify(jsonData));
      };


      const downloadFiles = async () => {
        gl.render(scene, fCam);
        saveFrontScreenshot()
          .then(() => {
            gl.render(scene, bCam);
            return saveBackScreenshot();
          })
          .then(() => {
            return fetchAndStoreData(urls);
          })
          .then((files) => {
            const imgFolder = zip.folder('assets');
            files.forEach((file, index) => {
              imgFolder?.file(`${index}.png`, file.blob, { base64: true });
            });
            createJsonData();
            return zip.generateAsync({ type: 'blob' });
          })
          .then(async (content) => {
            const jsonData = { userID: 'your-user-id' };
            const formData = new FormData();
            formData.append('jsonFile', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
            formData.append('zipFile', content, `${clothModel[0]}.zip`);

            const apiUrl = './yeni-urun-ekle';
            fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(jsonData),
            })
              .then(response => response.json())
              .then(data => {
                // Handle the response from the server if needed
                console.log('Server response:', data);
              })
              .catch(error => {
                console.error('Error during server request:', error);
              });

            // Print JSON data to the console
            console.log('JSON Data:', jsonData);

            // Create a <pre> element to display JSON data on the page
            const jsonDataElement = document.createElement('pre');
            jsonDataElement.textContent = JSON.stringify(jsonData, null, 2);

            // Append the <pre> element to the body
            document.body.appendChild(jsonDataElement);

            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clothModel[0]}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch((error) => {
            console.error('Error during file download and upload:', error);
          });
      };

      downloadFiles();
      setDownload(false);
    }
  }, [download]);

  return null;
};

export default DownLoad;
