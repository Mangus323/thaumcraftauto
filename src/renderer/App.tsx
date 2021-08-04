import React from "react";
import {ipcRenderer} from "electron";

const App = () => {
    const click = () => {
        let answer = ipcRenderer.sendSync('asynchronous-message', 'ping')
        console.log(answer);
        let b64encoded = btoa(new Uint8Array(answer).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''));
        let img = document.getElementById("img")
        // @ts-ignore
        img.src = 'data:image/jpeg;base64,' + b64encoded

    }

    setTimeout(()=> {click()}, 0);

    return <div>

        <img id="img"/>
        <button onClick={click}> send </button>
    </div>
}

export default App

