export function groupByCamera(fileMetadataList: Array<{ camera: string }>) {
  const grouped: Record<string, { camera: string; count: number }> = {};

  for (const fileMetadata of fileMetadataList) {
    const camera = fileMetadata.camera;

    grouped[camera] = {
      camera,
      count: (grouped[camera]?.count || 0) + 1,
    };
  }

  return grouped;
}
