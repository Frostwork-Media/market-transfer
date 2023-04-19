export function objectToParams(obj) {
    const urlParams = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
      // Stringify JSON values
      const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      const encodedValue = strValue.toString();
      urlParams.append(key, encodedValue);
    }
    return urlParams.toString();
}

export function floatToPercent(f: number): string {
  return `${Math.round(f * 1000) / 10}%`; 
}

export function round2SF(f: number): number {
  return Math.round(f * 100) / 100;
}

export function extractSlugFromURL(url) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}