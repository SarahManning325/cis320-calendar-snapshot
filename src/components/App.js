import {useFiles} from '../hooks/useFiles';
import {useOCR} from '../hooks/useOCR';


export default function App() {

    const {imageData, loadFile} = useFiles();
    const {progress, progressLabel, ocrResult, handleOCR} = useOCR(imageData);
    

}