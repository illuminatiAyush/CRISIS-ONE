import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Incident } from "@/types/incident.type";

type IncidentState = {
  list: Incident[];
};

const initialState: IncidentState = {
  list: [],
};

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Incident[]>) {
      state.list = action.payload;
    },
    addOne(state, action: PayloadAction<Incident>) {
      state.list.unshift(action.payload);
    },
    updateOne(state, action: PayloadAction<Incident>) {
      const idx = state.list.findIndex(
        (i) => i.id === action.payload.id
      );
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeOne(state, action: PayloadAction<string>) {
      state.list = state.list.filter(
        (i) => i.id !== action.payload
      );
    },
  },
});

export const {
  setAll,
  addOne,
  updateOne,
  removeOne,
} = incidentsSlice.actions;

export default incidentsSlice.reducer;
