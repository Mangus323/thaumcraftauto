import React from "react";
import {ipcRenderer} from "electron";

const App = () => {

    let array: Array<any> = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            array.push(
                <img id={`img${i}${j}`}>

                </img>
            )
        }
    }

    const click = () => {
        let answer = ipcRenderer.sendSync('asynchronous-message', 'ping')
        console.log(answer);


        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {


                let b64encoded = btoa(new Uint8Array(answer[i][j].bitmap.data).reduce(function (data, byte) {
                    return data + String.fromCharCode(byte);
                }, ''));
                let img = document.getElementById(`img${i}${j}`)
                // @ts-ignore
                img.src = 'data:image/jpeg;base64,' + b64encoded
            }

        }


    }


    return <div>


        {...array}

        <button onClick={click}> send</button>
    </div>
}

export default App

