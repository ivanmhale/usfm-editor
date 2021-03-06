import * as React from "react";
import { useMemo } from 'react';
import { FileSelector } from "./FileSelector"
import { DropdownMenu } from "./DropdownMenu"

export const InputSelector = ({ onChange, demoUsfmStrings }) => useMemo(() => {

    const dropdownMenuId = "input-dropdown"
    const fileSelectorId = "input-file"

    const selectOrAddOptionToDropdown = (fileName, usfm) => {
        const dropdown = document.getElementById(dropdownMenuId)
        const children = Array.from(dropdown.children)
        const prevCreatedOption = children.find(child => child.key == fileName)

        if (prevCreatedOption) {
            // update this option with the current data loaded from the file
            prevCreatedOption.value = usfm 
        } else {
            const opt = document.createElement("option")
            opt.key = fileName
            opt.value = usfm
            opt.innerHTML = fileName
            dropdown.appendChild(opt)
        }
        dropdown.value = usfm
    }

    const unsetSelectedFile = () => {
        // The <input> tag keeps track of the last file that was selected.
        // We want to unset it so that we can load the same file again.
        const fileSelector = document.getElementById(fileSelectorId)
        fileSelector.value = null
    }

    const handleDropdownChange = (event) => {
        onChange(event.target.value)
        unsetSelectedFile()
    }

    const handleInputFileChange = (fileName, usfm) => {
        onChange(usfm)
        selectOrAddOptionToDropdown(fileName, usfm)
    }

    return (
        <div>
            <div className="row">
                <div className="column">
                    <h2 className="margin-below-15px">Demo text selection</h2>
                </div>
            </div>
            <div className="horizontal">
                <DropdownMenu
                    id={dropdownMenuId}
                    onChange={handleDropdownChange}
                    demoUsfmStrings={demoUsfmStrings}
                />
                <span>OR</span>
                <FileSelector 
                    id={fileSelectorId}
                    onChange={handleInputFileChange} 
                />
            </div>
        </div>
    )
}, [])