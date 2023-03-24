export function objectToParams(obj) {
    const urlParams = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
      // Stringify JSON values
      const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      const encodedValue = strValue;
      urlParams.append(key, encodedValue);
    }
    return urlParams.toString();
}