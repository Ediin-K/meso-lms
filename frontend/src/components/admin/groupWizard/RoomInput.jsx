import { useRef } from "react";
import { Box, Chip, TextField, Typography } from "@mui/material";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import { ROOM_PRESETS, getGroupsTheme, getWizardFieldSx, wizardFieldClass } from "./wizardUi";

export default function RoomInput({ value, onChange, isDark, presets = ROOM_PRESETS }) {
  const inputRef = useRef(null);
  const t = getGroupsTheme(isDark);

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
                className="mr-1"
                sx={{ color: t.textMuted }}
              />
            ),
          },
        }}
      />
      <Box className="flex flex-wrap gap-1">
        <Typography variant="caption" className="mr-1 self-center" sx={{ color: t.textMuted }}>
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
            sx={{
              color: value === room ? "var(--lms-schedule-card)" : t.text,
              borderColor: t.border,
              bgcolor: value === room ? t.accentStrong : "transparent",
              "&:hover": {
                bgcolor: value === room ? t.accentStrong : t.hover,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
