<script lang="ts">
  import { ipcRenderer } from "electron";
  import { InputRange, CheckBox, InputText, ListBox } from "Common/Input";
  import { Text, Label, Flex, FlexItem, Line } from "Common";
  import { ButtonTool, SecondaryButton } from "Common/Buttons";
  import { TOPPANELHEIGHT } from "Const";
  import { Folder } from "Common/Icons";
  import { settings, modalBounds } from "../../../store";

  import SwitchListItem from "./SwitchListItem.svelte";

  export let zIndex: number;

  let switchItems: Types.TabItem[] = [];
  // Keyed by position: a fresh id per rebuild recreated every row on any settings change.
  $: switchItems = $settings.app.commandSwitches.map((item, index) => ({
    id: String(index),
    text: item.switch,
    itemArgs: {
      item,
    },
    item: SwitchListItem,
  }));

  async function onChangeExportPath(event: CustomEvent) {
    const directory = await ipcRenderer.invoke("selectExportDirectory");

    if (!directory) {
      return;
    }

    $settings.app.exportDir = directory;
  }
  function onSwitchItemRemoveClick(item: Types.TabItem) {
    $settings.app.commandSwitches = switchItems.reduce<Types.CommandSwitch[]>((result, swtch) => {
      if (swtch.id !== item.id) {
        const sw = swtch.itemArgs.item as Types.CommandSwitch;
        result.push({
          switch: sw.switch,
          value: sw.value,
        });
      }

      return result;
    }, []);
  }
  async function onAddSwicth(event: CustomEvent) {
    $settings.app.commandSwitches.push({
      switch: "",
    });
    $settings.app.commandSwitches = $settings.app.commandSwitches;
  }
  function onClearSwicthList(event: CustomEvent) {
    $settings.app.commandSwitches = [];
  }

  let bodyHeight: number;
  $: {
    if ($modalBounds) {
      bodyHeight = $modalBounds.height - 94;
    }
  }

  // These blocks rerun on any settings edit; only message the windows when the
  // scale itself changed.
  let sentFigmaUiScale: number;
  let sentPanelScale: number;
  $: if ($settings.ui.scaleFigmaUI !== sentFigmaUiScale) {
    sentFigmaUiScale = $settings.ui.scaleFigmaUI;
    ipcRenderer.invoke("updateFigmaUiScale", sentFigmaUiScale);
  }
  $: if ($settings.ui.scalePanel !== sentPanelScale) {
    sentPanelScale = $settings.ui.scalePanel;
    ipcRenderer.invoke("updatePanelScale", sentPanelScale);
    $settings.app.panelHeight = Math.floor(TOPPANELHEIGHT * sentPanelScale);
  }
</script>

<div style={`z-index: ${zIndex}; height: ${bodyHeight}px;`}>
  <Flex>
    <Flex der="column" width="-webkit-fill-available">
      <Label>Scale UI</Label>
      <InputRange bind:value={$settings.ui.scaleFigmaUI} min={0.5} max={1.5} step={0.05} />
      <Flex der="column" alignItems="center" justifyContent="center">
        <Text padding="8px 0 0 0">{Math.floor($settings.ui.scaleFigmaUI * 100)}%</Text>
      </Flex>
    </Flex>
    <Flex width="120px" />
    <Flex der="column" width="-webkit-fill-available">
      <Label>Scale Tabs</Label>
      <InputRange bind:value={$settings.ui.scalePanel} min={0.5} max={1.5} step={0.05} />
      <Flex der="column" alignItems="center" justifyContent="center">
        <Text padding="8px 0 0 0">{Math.floor($settings.ui.scalePanel * 100)}%</Text>
      </Flex>
    </Flex>
  </Flex>

  <Flex height="50px" />
  <Line />
  <Flex height="40px" />

  <Flex>
    <Flex der="column" width="-webkit-fill-available">
      <Label>Main settings</Label>
      <CheckBox bind:checked={$settings.app.saveLastOpenedTabs} text="Save the last opened tabs" />
      <CheckBox bind:checked={$settings.app.enableColorSpaceSrgb} text="Enable color space sRGB" />
      <CheckBox bind:checked={$settings.app.visibleNewProjectBtn} text="Show new project button" />
      <CheckBox bind:checked={$settings.app.useZenity} text="Use Zenity for Dialogs" />
      <CheckBox
        bind:checked={$settings.app.useOldPreviewer}
        text="Use old Previewer in ThemeCreator"
      />
      <CheckBox bind:checked={$settings.app.disableThemes} text="Disable themes" />
    </Flex>
    <Flex width="120px" />
    <Flex der="column" width="-webkit-fill-available">
      <Label>Export files to</Label>
      <Flex>
        <FlexItem grow={1}>
          <InputText bind:value={$settings.app.exportDir}>
            <ButtonTool normalBgColor="tarsparent" on:buttonClick={onChangeExportPath}>
              <Folder color="var(--text)" size="18" />
            </ButtonTool>
          </InputText>
        </FlexItem>
        <Flex width="20px" />
        <SecondaryButton on:buttonClick={onChangeExportPath}>Change</SecondaryButton>
      </Flex>
    </Flex>
  </Flex>

  <Flex height="50px" />
  <Line />
  <Flex height="40px" />

  <Flex>
    <Flex der="column" width="-webkit-fill-available">
      <Label>Chromium command line switches</Label>
      <ListBox items={switchItems} onItemRemoveClick={onSwitchItemRemoveClick} height="160px" />
      <Flex height="10px" />
      <Flex>
        <FlexItem grow={1} />
        <SecondaryButton on:buttonClick={onClearSwicthList}>Clear list</SecondaryButton>
        <Flex width="10px" />
        <SecondaryButton on:buttonClick={onAddSwicth}>Add Switch</SecondaryButton>
      </Flex>
    </Flex>
  </Flex>
</div>

<style>
  div {
    position: absolute;
    background-color: var(--bg-panel);
    width: -webkit-fill-available;
    padding: 32px 32px 8px 32px;
    user-select: none;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
