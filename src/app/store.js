import { configureStore, combineReducers } from "@reduxjs/toolkit";
import projectReducer from "./projectSlice";
import issueReducer from "./issueSlice";
import storage from "redux-persist/lib/storage";
import commentReducer from "./commentSlice";
import { persistReducer, persistStore } from "redux-persist";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

const rootReducer = combineReducers({
  project: projectReducer,
  issue: issueReducer,
  comment: commentReducer,
});

const persistConfig = {
  key: "jira",
  storage,
};



const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
