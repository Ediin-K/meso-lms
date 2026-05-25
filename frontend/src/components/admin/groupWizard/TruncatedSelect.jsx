import { FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { truncateText, getGroupsTheme, getMenuPaperSx, getWizardFieldSx, wizardFieldClass } from "./wizardUi";

export default function TruncatedSelect({
  label,
  value,
  onChange,
  options,
  emptyOption,
  isDark,
  size = "small",
  fullWidth = true,
  disabled = false,
  maxLabelLen = 32,
}) {
  const selected = options.find((o) => String(o.value) === String(value));
  const display = selected?.label ?? (emptyOption && !value ? emptyOption : "");
  const t = getGroupsTheme(isDark);

  return (
    <Tooltip title={display || label} placement="top" disableHoverListener={!display || display.length <= maxLabelLen}>
      <FormControl fullWidth={fullWidth} size={size} disabled={disabled} sx={getWizardFieldSx(isDark)}>
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          value={value}
          onChange={onChange}
          className={wizardFieldClass()}
          MenuProps={getMenuPaperSx(isDark)}
          renderValue={() => (
            <Typography
              component="span"
              className="block truncate text-sm font-medium"
              sx={{ color: t.text }}
            >
              {truncateText(display, maxLabelLen) || "—"}
            </Typography>
          )}
        >
          {emptyOption != null && <MenuItem value="">{emptyOption}</MenuItem>}
          {options.map((opt) => (
            <MenuItem key={opt.value} value={String(opt.value)}>
              <Typography className="text-sm" sx={{ color: t.text }} title={opt.label}>
                {opt.label}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}
