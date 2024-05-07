/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Board,
  BoardItem,
  BoardProps,
} from "@cloudscape-design/board-components";
import {
  Button,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";
import {
  ShoppingList as _ShoppingList,
  usePutShoppingList,
  useGetShoppingLists,
} from "myapi-typescript-react-query-hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateItem from "../../components/CreateItem";

type ListItem = { name: string };

/**
 * Component to render a singular Shopping List "/:shoppingListId" route.
 */
const ShoppingList: React.FC = () => {
  const { shoppingListId } = useParams();
  const [visibleModal, setVisibleModal] = useState(false);
  const getShoppingLists = useGetShoppingLists({ shoppingListId });
  const putShoppingList = usePutShoppingList();
  const shoppingList: _ShoppingList | undefined =
    getShoppingLists.data?.pages[0].shoppingLists[0]!;
  const [shoppingItems, setShoppingItems] =
    useState<BoardProps.Item<ListItem>[]>();

  useEffect(() => {
    setShoppingItems(
      shoppingList?.shoppingItems?.map((i) => ({
        id: i,
        definition: { minColumnSpan: 4 },
        data: { name: i },
      })),
    );
  }, [shoppingList?.shoppingItems]);

  return (
    <ContentLayout
      header={
        <Header
          variant="awsui-h1-sticky"
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button
                data-testid="header-btn-create"
                variant="primary"
                onClick={() => setVisibleModal(true)}
              >
                Add Item
              </Button>
            </SpaceBetween>
          }
        >
          Shopping list: {shoppingList?.name}
        </Header>
      }
    >
      <CreateItem
        isLoading={false}
        title="Add Item"
        callback={async (item) => {
          const items = [
            ...(shoppingItems || []),
            {
              id: item,
              definition: { minColumnSpan: 4 },
              data: { name: item },
            },
          ];
          setShoppingItems(items);
          putShoppingList.mutate({
            putShoppingListRequestContent: {
              name: shoppingList.name,
              shoppingListId: shoppingList.shoppingListId,
              shoppingItems: items.map((i) => i.data.name),
            },
          });
        }}
        visibleModal={visibleModal}
        setVisibleModal={setVisibleModal}
      />
      <Container>
        {!shoppingList ? (
          <Spinner />
        ) : (
          <Board<ListItem>
            onItemsChange={(event) => {
              const items = event.detail.items as BoardProps.Item<ListItem>[];
              setShoppingItems(items);
              putShoppingList.mutate({
                putShoppingListRequestContent: {
                  name: shoppingList.name,
                  shoppingListId: shoppingList.shoppingListId,
                  shoppingItems: items.map((i) => i.data.name),
                },
              });
            }}
            items={shoppingItems || []}
            renderItem={(item, actions) => (
              <BoardItem
                header={item.data.name}
                settings={
                  <Button
                    iconName="close"
                    variant="icon"
                    onClick={actions.removeItem}
                  />
                }
                i18nStrings={{
                  dragHandleAriaLabel: "Drag handle",
                  dragHandleAriaDescription:
                    "Use Space or Enter to activate drag, arrow keys to move, Space or Enter to submit, or Escape to discard.",
                  resizeHandleAriaLabel: "Resize handle",
                  resizeHandleAriaDescription:
                    "Use Space or Enter to activate resize, arrow keys to move, Space or Enter to submit, or Escape to discard.",
                }}
              />
            )}
            i18nStrings={{
              liveAnnouncementDndCommitted: () => "",
              liveAnnouncementDndDiscarded: () => "",
              liveAnnouncementDndItemInserted: () => "",
              liveAnnouncementDndItemReordered: () => "",
              liveAnnouncementDndItemResized: () => "",
              liveAnnouncementDndStarted: () => "",
              liveAnnouncementItemRemoved: () => "",
              navigationAriaLabel: "",
              navigationItemAriaLabel: () => "",
            }}
            empty={<></>}
          />
        )}
      </Container>
    </ContentLayout>
  );
};

export default ShoppingList;
