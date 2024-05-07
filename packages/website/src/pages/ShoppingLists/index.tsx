/* eslint-disable @typescript-eslint/no-floating-promises */
import { InfiniteQueryTable } from "@aws-northstar/ui/components";
import {
  Button,
  Header,
  Link,
  SpaceBetween,
  TableProps,
} from "@cloudscape-design/components";
import {
  ShoppingList,
  usePutShoppingList,
  useDeleteShoppingList,
  useGetShoppingLists,
} from "myapi-typescript-react-query-hooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateItem from "../../components/CreateItem";
import { AppLayoutContext } from "../../layouts/App";

const PAGE_SIZE = 50;

/**
 * Component to render the ShoppingLists "/" route.
 */
const ShoppingLists: React.FC = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedShoppingList, setSelectedShoppingList] = useState<
    ShoppingList[]
  >([]);
  const getShoppingLists = useGetShoppingLists({ pageSize: PAGE_SIZE });
  const putShoppingList = usePutShoppingList();
  const deleteShoppingList = useDeleteShoppingList();
  const navigate = useNavigate();
  const { setAppLayoutProps } = useContext(AppLayoutContext);

  useEffect(() => {
    setAppLayoutProps({
      contentType: "table",
    });
  }, [setAppLayoutProps]);

  const columnDefinitions = useMemo<
    TableProps.ColumnDefinition<ShoppingList>[]
  >(
    () => [
      {
        id: "shoppingListId",
        isRowHeader: true,
        header: "Shopping List Id",
        cell: (cell) => (
          <Link
            href={`/${cell.shoppingListId}`}
            onFollow={(e) => {
              e.preventDefault();
              navigate(`/${cell.shoppingListId}`);
            }}
          >
            {cell.shoppingListId}
          </Link>
        ),
      },
      {
        id: "name",
        header: "Name",
        cell: (cell) => cell.name,
      },
      {
        id: "shoppingItems",
        header: "Shopping Items",
        cell: (cell) => `${cell.shoppingItems?.length || 0} Items.`,
      },
    ],
    [navigate],
  );

  return (
    <>
      <CreateItem
        title="Create Shopping List"
        callback={async (item) => {
          await putShoppingList.mutateAsync({
            putShoppingListRequestContent: {
              name: item,
            },
          });
          getShoppingLists.refetch();
        }}
        isLoading={putShoppingList.isLoading}
        visibleModal={visibleModal}
        setVisibleModal={setVisibleModal}
      />
      <InfiniteQueryTable
        query={getShoppingLists}
        itemsKey="shoppingLists"
        pageSize={PAGE_SIZE}
        selectionType="single"
        stickyHeader={true}
        selectedItems={selectedShoppingList}
        onSelectionChange={(e) =>
          setSelectedShoppingList(e.detail.selectedItems)
        }
        header={
          <Header
            variant="awsui-h1-sticky"
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button
                  loading={deleteShoppingList.isLoading}
                  data-testid="header-btn-delete"
                  disabled={selectedShoppingList.length === 0}
                  onClick={async () => {
                    await deleteShoppingList.mutateAsync({
                      shoppingListId: selectedShoppingList![0].shoppingListId,
                    });
                    setSelectedShoppingList([]);
                    getShoppingLists.refetch();
                  }}
                >
                  Delete
                </Button>
                <Button
                  data-testid="header-btn-create"
                  variant="primary"
                  onClick={() => setVisibleModal(true)}
                >
                  Create Shopping List
                </Button>
              </SpaceBetween>
            }
          >
            Shopping Lists
          </Header>
        }
        variant="full-page"
        columnDefinitions={columnDefinitions}
      />
    </>
  );
};

export default ShoppingLists;
