/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ButtonGroup,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
} from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md";
import { RiDownload2Line, RiFlashlightFill } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import FlashButton from "./FlashButton";
import { useProjectActions } from "./project-hooks";

interface DownloadFlashButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just download a HEX.
 */
const DownloadFlashButton = ({ size }: DownloadFlashButtonProps) => {
  const connectionStatus = useConnectionStatus();
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  const actions = useProjectActions();
  const buttonWidth = "10rem"; // 8.1 with md buttons
  return (
    <HStack>
      <Menu>
        <ButtonGroup isAttached>
          {connected ? (
            <FlashButton width={buttonWidth} mode={"button"} size={size} />
          ) : (
            <DownloadButton width={buttonWidth} mode={"button"} size={size} />
          )}
          <MenuButton
            variant="solid"
            borderLeft="1px"
            borderRadius="button"
            as={IconButton}
            // Shift to compensate for border radius on the right
            icon={
              <MdMoreVert
                style={{
                  marginLeft: "calc(-0.15 * var(--chakra-radii-button))",
                }}
              />
            }
            size={size}
          />
          <Portal>
            <MenuList zIndex={zIndexAboveTerminal}>
              {!connected && (
                <MenuItem icon={<RiFlashlightFill />} onClick={actions.flash}>
                  <FormattedMessage id="flash-action" />
                </MenuItem>
              )}
              {connected && (
                <MenuItem icon={<RiDownload2Line />} onClick={actions.download}>
                  <FormattedMessage id="download-hex-action" />
                </MenuItem>
              )}
              <MenuItem
                icon={<RiDownload2Line />}
                onClick={actions.downloadMainFile}
              >
                <FormattedMessage id="download-python-action" />
              </MenuItem>
            </MenuList>
          </Portal>
        </ButtonGroup>
      </Menu>
    </HStack>
  );
};

export default DownloadFlashButton;
