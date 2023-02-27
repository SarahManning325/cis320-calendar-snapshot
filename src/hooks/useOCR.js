import { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js'

export function useOCR(imageData) {
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('idle');
    const [ocrResult, setOcrResult] = useState('');
    const workerRef = useRef<Tesseract.Worker | null>(null);
    useEffect(() => {
        workerRef.current = createWorker({
            logger: message => {
                if ('progress' in message) {
                    setProgress(message.progress);
                    setProgressLabel(message.progress == 1 ? 'Done' : message.status);
                }
            }
        });
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        }
    }, []);

    const context = {progress, setProgress, progressLabel, setProgressLabel, ocrResult, setOcrResult, workerRef, imageData}


    return {progress, progressLabel, ocrResult, handleOCR: async () => handleOCR(context)}

}


async function handleOCR(context) {
    const {setProgress, setProgressLabel, setOcrResult, imageData, workerRef} = context;

    setProgress(0);
    setProgressLabel('starting');

    const worker = workerRef.current;
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const response = await worker.recognize(imageData);
    setOcrResult(response.data.text);
    console.log(response.data);
}