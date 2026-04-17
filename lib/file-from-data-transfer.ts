export function fileFromDataTransfer(dt: DataTransfer): File | null {
  const direct = dt.files?.[0];
  if (direct) {
    return direct;
  }
  const item = dt.items?.[0];
  return item?.kind === "file" ? item.getAsFile() : null;
}
