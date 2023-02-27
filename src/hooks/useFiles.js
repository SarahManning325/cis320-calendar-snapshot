import { useEffect, useRef, useState } from 'react';

export function useFiles() {
const [imageData, setImageData] = useState<null | string>(null);
  const loadFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      setImageData(imageDataUri);
    };
    reader.readAsDataURL(file);
  };

  return {imageData, loadFile}
}

