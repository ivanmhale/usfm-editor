import {transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmjsStructureRules";
import {slateRules} from "./usfmjsToSlateRules";
import {nodeTypes} from "../../utils/nodeTypes";

export const creationStamps = {
    /**
     * This node was created by the user, after the document was originally
     * loaded from the database and transformed into slate nodes
     */
    POST_INIT: "post_init"
}

const nodeTypeToUsfmTagMap = new Map([
    [nodeTypes.TEXTWRAPPER, ""],
    [nodeTypes.P, "\\p"],
    [nodeTypes.ND, "\\nd"],
    [nodeTypes.S, "\\s"]
])

export function createSlateNodeByType(nodeType, text) {
    const usfm = nodeTypeToUsfmTagMap.get(nodeType) +
        getWhitespaceToAdd(nodeType, text) +
        text
    return usfmToSlateJson(usfm)
}

function getWhitespaceToAdd(nodeType, text) {
    switch (nodeType) {
        case nodeTypes.TEXTWRAPPER:
            // The newline is only needed so that usfmjs.toJSON performs a conversion.
            // The newline is actually removed during the conversion.
            return text.trim() ? "" : "\n"
        default:
            return text.trim() ? " " : ""
    }
}

function usfmToSlateJson(usfm) {
    const usfmJson = usfmjs.toJSON(usfm).headers[0]
    const slateJson = usfmJsonToSlateJson(usfmJson)
    slateJson.data.creationStamp = creationStamps.POST_INIT 
    return slateJson
}

function usfmJsonToSlateJson(usfmJson, isInitialization) {
    const transformations = isInitialization
        ? [ objectToArrayRules, slateRules ]
        : [ slateRules ];

    const transformedJson = transformations.reduce(transformOneRuleset, usfmJson);
    return transformedJson;
}

export function toUsfmJsonDocAndSlateJsonDoc(usfm) {
    const usfmJsDocument = usfmjs.toJSON(usfm);
    console.debug("usfmJsDocument", usfmJsDocument);

    const transformedJson = usfmJsonToSlateJson(usfmJsDocument, true)

    const slateDocument = {
        "object": "value",
        "document": {
            "object": "document",
            "data": {},
            "nodes": [transformedJson]
        }
    };
    console.debug("slateDocument", slateDocument);

    return {usfmJsDocument, slateDocument};
}

function transformOneRuleset(json, rules) {
    const transformed = transform(json, rules);
    console.debug("JSON transformation result", transformed);
    return transformed;
}