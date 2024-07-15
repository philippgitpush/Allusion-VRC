import { observer } from 'mobx-react-lite';
import React, { useCallback, useRef, useState } from 'react';
import { useStore } from 'src/frontend/contexts/StoreContext';
import { Button, IconSet } from 'widgets';
import { Dialog } from 'widgets/popovers';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const VRChatImportDialog = observer(() => {
  const { uiStore, locationStore, fileStore } = useStore();
  const worldUrlRef = useRef<HTMLInputElement>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const pf = '[VRChatImport]';

  const handleImportAction = (url: string) => {
    const vrChatUrlPattern = /https:\/\/vrchat\.com\/home\/(?:world\/|launch\?worldId=)(wrld_[a-zA-Z0-9-]+)/;
    const match = url.match(vrChatUrlPattern);

    if (match) {
      const worldId = match[1];
      console.log(`${pf} Match! World ID: ${worldId}`);
      saveToAllusion(worldId);
      uiStore.closeVRChatImport();
      //uiStore.enableSlideMode();
      uiStore.clearFileSelection();
      //uiStore.selectFile(fileStore.fileList[10])
      console.log(fileStore.fileList)
    } else {
      console.warn(`${pf} Failed Match. The specified world URL does not correspond to the correct format.`);
    }
  };

  const downloadFile = async (url: string, filename: string, outputPath: string) => {
    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'arraybuffer',
      });
  
      const savePath = path.join(outputPath, filename);
  
      fs.writeFileSync(savePath, Buffer.from(response.data));
      console.log(`${pf} File ${filename} saved successfully at ${savePath}`);
    } catch (error) {
      console.error(`${pf} Error downloading file:`, error);
    }
  };

  const saveToAllusion = (worldId: string) => {
    fetchWorldData(worldId)
    .then(data => {
      console.log(`${pf} Fetched World Data:`, data);
      downloadFile(data?.imageUrl, data?.name + '.jpg', locationStore.locationList[0].path)
    })
    .catch(error => {
      console.error(`${pf} Failed to fetch world data:`, error);
    });
    
  }

  const fetchWorldData = async (worldId: string) => {
    try {
      const response = await axios.get(`https://vrchat.com/api/1/worlds/${worldId}`);
      const { name, authorName, imageUrl } = response.data;
  
      console.log(`${pf} Matched World: ${name} by ${authorName}`);
  
      return {
        name,
        authorName,
        imageUrl,
      };
    } catch (error) {
      console.error(`${pf} Error fetching world data:`, error);
      // throw error;
    }
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocationId(event.target.value);
  };

  return (
    <Dialog
      open={uiStore.isVRChatImportOpen}
      title="VRChat Import"
      icon={IconSet.VRCHAT}
      onCancel={uiStore.closeVRChatImport}
    >
      <form id="search-form" role="search" method="dialog" onSubmit={(e) => e.preventDefault()}>

        <div className="form-group" style={{ display: 'flex', gap: '10px', flexDirection: 'column', margin: '20px 0 20px 0' }}>
          <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
            <label id="name">VRChat World URL</label>
            <input
              className="input"
              aria-labelledby="world-url"
              autoFocus
              ref={worldUrlRef}
            />
          </div>

          <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label htmlFor="location-dropdown">Save Location</label>
            <select
              id="location-dropdown"
              className="criteria-input"
              value={selectedLocationId}
              onChange={handleLocationChange}
            >
              {locationStore.locationList.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="dialog-actions">
          <Button
            styling="filled"
            text="Import from VRChat"
            icon={IconSet.IMPORT}
            onClick={() => {
              const url = worldUrlRef.current?.value ?? '';
              handleImportAction(url);
            }}
            disabled={false}
          />
        </fieldset>
      </form>
    </Dialog>
  );
});

export default VRChatImportDialog;
