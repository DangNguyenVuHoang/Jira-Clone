import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  comments: {}, // { issueId: [ {id, text, author, createdAt} ] }
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    addComment: {
      reducer(state, action) {
        const { issueId, comment } = action.payload;
        if (!state.comments[issueId]) state.comments[issueId] = [];
        state.comments[issueId].push(comment);
      },
      prepare(issueId, text, author) {
        return {
          payload: {
            issueId,
            comment: {
              id: nanoid(),
              text,
              author,
              createdAt: new Date().toISOString(),
            },
          },
        };
      },
    },
  },
});

export const { addComment } = commentSlice.actions;
export default commentSlice.reducer;
