import { Box, Flex } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";
import ZoomControls from "../workbench/ZoomControls";
import NonMainFileNotice from "./NonMainFileNotice";
import EditorContainer from "./EditorContainer";

interface EditorAreaProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorArea = ({ filename, onSelectedFileChanged }: EditorAreaProps) => {
  const isMainFile = filename === MAIN_FILE;
  return (
    <Flex height="100%" flexDirection="column">
      {!isMainFile && (
        <NonMainFileNotice
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
        />
      )}
      <Box flex="1 1 auto" height={0} position="relative">
        <ZoomControls
          size="lg"
          position="absolute"
          top={0}
          right={0}
          pt={3}
          // Need to keep them away from the scrollbar
          pr={5}
          zIndex={1}
        />
        <EditorContainer filename={filename} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
