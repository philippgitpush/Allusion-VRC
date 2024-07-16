import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { IconSet } from 'widgets';
import { ToolbarButton } from 'widgets/toolbar';
import { FileRemoval } from '../../components/RemovalAlert';
import FileTagEditor from '../../containers/AppToolbar/FileTagEditor';
import { useStore } from '../../contexts/StoreContext';
import { SortCommand, ViewCommand, VRChatCommand } from './Menus';
import Searchbar from './Searchbar';
import { MenuButton, MenuRadioGroup, MenuRadioItem } from 'widgets/menus';
import { MenuDivider, MenuItem, MenuSliderItem } from 'widgets/menus/menu-items';

const OutlinerToggle = observer(() => {
  const { uiStore, fileStore } = useStore();

  return (
    <ToolbarButton
      id="outliner-toggle"
      text="Toggle Outliner"
      icon={uiStore.isOutlinerOpen ? IconSet.DOUBLE_CARET : IconSet.MENU_HAMBURGER}
      controls="outliner"
      pressed={uiStore.isOutlinerOpen}
      onClick={uiStore.toggleOutliner}
      tabIndex={0}
    />
  );
});

const PrimaryCommands = observer(() => {
  const { fileStore } = useStore();

  return (
    <>
      <OutlinerToggle />
      <FileSelectionCommand />

      <Searchbar />

      {/* TODO: Put back tag button (or just the T hotkey) */}
      {fileStore.showsMissingContent ? (
        // Only show option to remove selected files in toolbar when viewing missing files */}
        <RemoveFilesPopover />
      ) : (
        // Only show when not viewing missing files (so it is replaced by the Delete button)
        <FileTagEditor />
      )}

      <VRChatCommand />

      <SortCommand />

      <ViewCommand />
    </>
  );
});

export default PrimaryCommands;

export const SlideModeCommand = observer(() => {
  const { uiStore } = useStore();

  const [ compressionQuality, setCompressionQuality ] = useState(95);

  const handleImageCompression = () => { // TODO }

  return (
    <>
      <ToolbarButton
        isCollapsible={false}
        icon={IconSet.ARROW_LEFT}
        onClick={uiStore.disableSlideMode}
        text="Back"
        tooltip="Back to content panel"
      />

      <div className="spacer" />

      <FileTagEditor />

      <MenuButton
        icon={IconSet.COMPRESS}
        menuID="__compress-imag-options"
        id="__compress-image-menu"
        text="Compress current image"
        tooltip="Compress current image"
      >
        <MenuSliderItem
          value={ compressionQuality }
          label="Quality"
          onChange={ setCompressionQuality }
          id="quality"
          options={[
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' }
          ]}
          min={ 0 }
          max={ 100 }
          step={ 25 }
        />
        
        <br />

        <MenuItem
          icon={IconSet.COMPRESS}
          onClick={() => {}}
          text="Compress Image"
        />
      </MenuButton>

      <ToolbarButton
        icon={IconSet.INFO}
        onClick={uiStore.toggleInspector}
        checked={uiStore.isInspectorOpen}
        text="Toggle the inspector panel"
        tooltip="Toggle the inspector panel"
      />
    </>
  );
});

const FileSelectionCommand = observer(() => {
  const { uiStore, fileStore } = useStore();
  const selectionCount = uiStore.fileSelection.size;
  const fileCount = fileStore.fileList.length;

  const allFilesSelected = fileCount > 0 && selectionCount === fileCount;
  // If everything is selected, deselect all. Else, select all
  const handleToggleSelect = () => {
    selectionCount === fileCount ? uiStore.clearFileSelection() : uiStore.selectAllFiles();
  };

  return (
    <ToolbarButton
      isCollapsible={false}
      icon={allFilesSelected ? IconSet.SELECT_ALL_CHECKED : IconSet.SELECT_ALL}
      onClick={handleToggleSelect}
      pressed={allFilesSelected}
      text={selectionCount}
      tooltip="Selects or deselects all images"
      disabled={fileCount === 0}
    />
  );
});

const RemoveFilesPopover = observer(() => {
  const { uiStore } = useStore();
  return (
    <>
      <ToolbarButton
        icon={IconSet.DELETE}
        disabled={uiStore.fileSelection.size === 0}
        onClick={uiStore.openToolbarFileRemover}
        text="Delete"
        tooltip="Delete selected missing images from library"
      />
      <FileRemoval />
    </>
  );
});
