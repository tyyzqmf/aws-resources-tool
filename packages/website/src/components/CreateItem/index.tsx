/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Box,
  Button,
  FormField,
  Input,
  Modal,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useState } from "react";

/**
 * Component to render a widget to add an item.
 */
const CreateItem: React.FC<{
  title: string;
  visibleModal: boolean;
  isLoading: boolean;
  setVisibleModal: (visible: boolean) => void;
  callback: (itemName: string) => Promise<void>;
}> = ({ title, visibleModal, setVisibleModal, callback, isLoading }) => {
  const [showValidation, setShowValidation] = useState(false);
  const [itemToCreate, setItemToCreate] = useState<string | undefined>();
  return (
    <Modal
      onDismiss={() => setVisibleModal(false)}
      visible={visibleModal}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => {
                setVisibleModal(false);
                setItemToCreate(undefined);
                setShowValidation(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isLoading}
              onClick={async () => {
                setShowValidation(true);
                if (!itemToCreate) {
                  return;
                }
                await callback(itemToCreate);
                setVisibleModal(false);
                setItemToCreate(undefined);
                setShowValidation(false);
              }}
            >
              Create
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={title}
    >
      <FormField
        label="Name"
        errorText={
          showValidation && !itemToCreate ? `Name must be provided` : undefined
        }
      >
        <Input
          value={itemToCreate || ""}
          onChange={({ detail }) => setItemToCreate(detail.value)}
        />
      </FormField>
    </Modal>
  );
};

export default CreateItem;
