/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0 */
import * as React from "react";
import { Route, Routes as ReactRoutes } from "react-router-dom";
import ApiExplorer from "../../pages/ApiExplorer";
import Home from "../../pages/Home";
import ShoppingList from "../../pages/ShoppingList";
import ShoppingLists from "../../pages/ShoppingLists";

/**
 * Defines the Routes.
 */
const Routes: React.FC = () => {
  return (
    <ReactRoutes>
      <Route key={0} path="/" element={<Home />} />
      <Route key={1} path="shopping/" element={<ShoppingLists />} />
      <Route
        key={2}
        path="shopping/:shoppingListId"
        element={<ShoppingList />}
      />
      <Route key={3} path="/apiExplorer" element={<ApiExplorer />} />
    </ReactRoutes>
  );
};

export default Routes;
