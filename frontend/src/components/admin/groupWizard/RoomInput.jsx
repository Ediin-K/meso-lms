import { useRef } from "react";
import { Box, Chip, TextField, Typography } from "@mui/material";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import { ROOM_PRESETS, getWizardFieldSx, wizardFieldClass } from "./wizardUi";

export default function RoomInput({ value, onChange, isDark, presets = ROOM_PRESETS }) {
  const inputRef = useRef(null);

  return (
    <Box className="flex flex-col gap-1.5 min-w-0">
      <TextField
        inputRef={inputRef}
        size="small"
        label="Salla"
        placeholder="p.sh. 132"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => inputRef.current?.focus()}
        fullWidth
        className={wizardFieldClass()}
        sx={getWizardFieldSx(isDark)}
        slotProps={{
          input: {
            startAdornment: (
              <MeetingRoomOutlinedIcon
                fontSize="small"
                className="mr-1 text-slate-400 dark:text-slate-500"
              />
            ),
          },
        }}
      />
      <Box className="flex flex-wrap gap-1">
        <Typography variant="caption" className="text-slate-500 dark:text-slate-400 mr-1 self-center">
          Shpejt:
        </Typography>
        {presets.map((room) => (
          <Chip
            key={room}
            label={room}
            size="small"
            variant={value === room ? "filled" : "outlined"}
            color={value === room ? "primary" : "default"}
            onClick={() => {
              onChange(room);
              inputRef.current?.focus();
            }}
            className="!font-semibold !cursor-pointer"
          />
        ))}
      </Box>
    </Box>
  );
}
