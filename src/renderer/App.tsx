import React, {useState} from "react";
import {ipcRenderer} from "electron";
import {constants as c} from "../number_constants"

const App = () => {
    let [image, setImage] = useState("")

    const start = () => {
        let answer = ipcRenderer.sendSync('asynchronous-message', 'ping')
        console.log(answer);

    }
    const restart = () => {
        let answer = ipcRenderer.sendSync('asynchronous-message', 'ping')
        let b64array = new Uint8Array(answer).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, '')
        setImage('data:image/jpeg;base64,' + btoa(b64array))
    }

    return <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        <div style={{padding: 3, backgroundColor: "black"}}>
            <img id={"img"} src={image} alt={"image"}
                 style={{width: c.research.w, height: c.research.h, display: "block", backgroundColor: "white"}}/>
        </div>
        <div>
            <button onClick={start}>Start</button>
            <button onClick={restart}>Restart</button>
        </div>
    </div>

}

export default App



