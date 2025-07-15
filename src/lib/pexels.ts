const PEXELS_API_KEY = "CEVWpXluVU77FgaVriTzqBCoN4FD3f0VL2Y8bXNPynNfqUg2DoUgPt8t";

export async function searchPexelsPhotos(
  query: string
): Promise<{ imageUrl: string; avgColor: string } | null> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Pexels API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      return {
        imageUrl: photo.src.medium,
        avgColor: photo.avg_color,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching from Pexels API:", error);
    return null;
  }
}
