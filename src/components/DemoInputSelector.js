import * as React from "react";
import { useMemo } from 'react';

export const DemoInputSelector = ({ onChange, demoUsfmStrings }) => useMemo(() => {

    const handleDropdownChange = 
        e => onChange(e.target.value)

    const fileReader = (() => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target.result)
            addUsfmFileToDropdown(e.target.fileName, e.target.result)
        }
        return reader
    })()

    const addUsfmFileToDropdown = (fileName, usfm) => {
        const dropdown = document.getElementById("input-dropdown")
        const opt = document.createElement("option")
        opt.key = fileName
        opt.value = usfm
        opt.innerHTML = fileName
        dropdown.appendChild(opt)
        dropdown.value = usfm
    }

    const handleInputFileChange = 
        event => {
            const file = event.target.files[0]
            fileReader.fileName = file.name
            fileReader.readAsText(file)
        }

    const DropdownMenu = ({ onChange, demoUsfmStrings }) => {
        return (
            <select id="input-dropdown" required onChange={onChange}>
            {
                Array.from(demoUsfmStrings).map(function(arr) {
                    const [k, v] = arr;
                    return <option key={k} value={v}>{k}</option>;
                })
            }
            </select>
        )
    }

    const FileSelector = ({ onChange }) => {
        return (
            <input type="file" class="text-no-display" accept=".usfm,.txt" onChange={onChange} />
        )
    }

    return (
        <div>
            <div class="row">
                <div class="column">
                    <h2 class="margin-below-15px">Demo text selection</h2>
                </div>
            </div>
            <div class="horizontal">
                <DropdownMenu
                    onChange={handleDropdownChange}
                    demoUsfmStrings={demoUsfmStrings}
                />
                <span>OR</span>
                <FileSelector onChange={handleInputFileChange} />
            </div>
        </div>
    )
}, [])