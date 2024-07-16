import { observer } from 'mobx-react-lite';
import React, { useCallback, useRef, useState } from 'react';
import { useStore } from 'src/frontend/contexts/StoreContext';
import { Button, IconSet } from 'widgets';
import { Dialog } from 'widgets/popovers';
import ExifIO from 'common/ExifIO';

import axios from 'axios';
import path from 'path';
import fs from 'fs';

export const VRChatImportDialog = observer(() => {
  const { uiStore, locationStore, fileStore, exifTool } = useStore();
  const worldUrlRef = useRef<HTMLInputElement>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const pf = '[VRChatImport]';

  const saveFileToLocation = async (url: string, filename: string, outputPath: string) => {
    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'arraybuffer',
      });
  
      const savePath = path.join(outputPath, filename);
      fs.writeFileSync(savePath, Buffer.from(response.data));
  
      console.log(`${pf} File ${filename} saved successfully to ${savePath}`);
    } catch (error) {
      console.error(`${pf} Error downloading file:`, error);
    }
  };
  
  const fetchWorldData = async (worldId: string) => {
    try {
      const response = await axios.get(`https://vrchat.com/api/1/worlds/${worldId}`);
      const { name, authorName, imageUrl } = response.data;
  
      console.log(`${pf} Matched World: ${name} by ${authorName}`);
  
      return { name, authorName, imageUrl };
    } catch (error) {
      console.error(`${pf} Error fetching world data:`, error);
    }
  };
  
  const matchWorldIdFromUrl = (url: string): string | null => {
    const vrChatUrlPattern = /https:\/\/vrchat\.com\/home\/(?:world\/|launch\?worldId=)(wrld_[a-zA-Z0-9-]+)/;
    const match = url.match(vrChatUrlPattern);
    return match ? match[1] : null;
  };
  
  /* const checkDuplicate = async (worldId: string) => {
    let match = false;
  
    for (const file of fileStore.fileList) {
      const tagValues = await exifTool.readExifTags(file.absolutePath, ['CreatorWorkURL']);
      const creatorWorkUrl = tagValues[0]?.toString();
      
      if (creatorWorkUrl) {
        console.log(matchWorldIdFromUrl(creatorWorkUrl));

        if (matchWorldIdFromUrl(creatorWorkUrl) === worldId) {
          match = true;
          break;
        }
      }
    }
  
    if (match) {
      console.log(`${pf} Already downloaded. Skipping ...`);
    } else {
      console.log(`${pf} LGTM! Download`);
    }
  }; */

  const handleImportAction = (url: string) => {
    const match = matchWorldIdFromUrl(url);

    if (match) {
      const worldId = match;
      console.log(`${pf} Match! World ID: ${worldId}`);

      /* checkDuplicate(worldId); */

      saveToAllusion(worldId);
      uiStore.closeVRChatImport();
      //uiStore.enableSlideMode();
      uiStore.clearFileSelection();
      //uiStore.selectFile(fileStore.fileList[10])
    } else {
      console.warn(`${pf} Failed Match. The specified world URL does not correspond to the correct format.`);
    }
  };

  const saveToAllusion = (worldId: string) => {
    fetchWorldData(worldId)
    .then(data => {
      console.log(`${pf} Fetched World Data:`, data);
      saveFileToLocation(data?.imageUrl, data?.name + '.jpg', locationStore.locationList[0].path)
    })
    .catch(error => {
      console.error(`${pf} Failed to fetch world data:`, error);
    });
  }

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
