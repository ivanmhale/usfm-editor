import {identity, pathRule} from "json-transforms";
import {chapterNumberName, fauxVerseNumber, NumberTypeEnum, NumberTypeNames, verseNumberName} from "../numberTypes";
import {nodeTypes} from "../../utils/nodeTypes";

function bareTextNode(textString) {
    return {
        "object": "text",
        "text": removeTrailingNewline(textString),
        "marks": []
    };
}

function textWrapper(hasText) {
    hasText.text = removeTrailingNewline(hasText.text)
    return {
        "object": "block",
        "type": nodeTypes.TEXTWRAPPER,
        "data": {"source": hasText, "sourceTextField": "text"},
        "nodes": [bareTextNode(hasText.text)]
    };
}

function chapterBody(children) {
    return {
        "object": "block",
        "type": "chapterBody",
        "data": {},
        "nodes": [].concat(children)
    };
}

function verseBody(children) {
    return {
        "object": "block",
        "type": "verseBody",
        "data": {},
        "nodes": [].concat(children)
    };
}

function chapterNumber(source) {
    const number = source[chapterNumberName];
    return {
        "object": "block",
        "type": chapterNumberName,
        "data": {"source": source, "sourceTextField": chapterNumberName},
        "nodes": [bareTextNode(number)]
    };
}

function verseNumber(source) {
    const number = source[verseNumberName];
    const isFauxVerse = number.toLowerCase() === fauxVerseNumber;
    return {
        "object": "block",
        "type": isFauxVerse ? fauxVerseNumber : verseNumberName,
        "data": {"source": source, "sourceTextField": verseNumberName},
        "nodes": [bareTextNode(number)]
    };
}

function headersNode(sourceArray, runner) {
    return {
        "object": "block",
        "type": "headers",
        "data": {"source": sourceArray},
        "nodes": [].concat(runner(sourceArray))
    };
}

/** json-transforms rules to produce a Slate-compatible JSON tree */
export const slateRules = [
    pathRule(
        '.chapters',
        d => {
            const processedHeaders = headersNode(d.context.headers, d.runner);
            const processedChapters = d.runner(d.context.chapters);
            return ({
                "object": "block",
                "type": "book",
                "data": {"source": d.context.source},
                "nodes": [processedHeaders].concat(processedChapters)
            });
        }
    ),
    pathRule(
        '.' + NumberTypeNames.get(NumberTypeEnum.chapter),
        d => ({
            "object": "block",
            "type": "chapter",
            "data": {"source": d.context.source},
            "nodes": [
                chapterNumber(d.context),
                chapterBody(d.runner(d.context.verses))
            ]
        })
    ),
    pathRule(
        '.' + NumberTypeNames.get(NumberTypeEnum.verse),
        d => ({
            "object": "block",
            "type": "verse",
            "data": {"source": d.context.source},
            "nodes": [
                verseNumber(d.context),
                verseBody(d.runner(d.context.nodes))
            ]
        })
    ),
    pathRule(
        '.tag',
        d => {
            if (shouldAddEmptyTextFieldToParagraph(d.match, d.context)) {
                d.context.text = ""
            }
            return ({
                "object": "block",
                "type": d.match,
                "data": buildTagData(d.context),
                "nodes": [
                    d.context.text ? bareTextNode(d.context.text) : null,
                    d.context.content ? bareTextNode(d.context.content) : null,
                ]
                    .filter(el => el) // filter out nulls
            })
        }
    ),
    pathRule(
        '.text',
        d => textWrapper(d.context)
    ),
    identity
];

function removeTrailingNewline(text) {
    return text.replace(/[\r|\n|\r\n]$/, '')
}

function shouldAddEmptyTextFieldToParagraph(match, context) {
    return match == nodeTypes.P &&
        !context.hasOwnProperty("text")
}

function buildTagData(context) {
    const data = {"source": context}
    if (context.hasOwnProperty("text")) {
        data["sourceTextField"] = "text"
    } else if (context.hasOwnProperty("content")) {
        data["sourceTextField"] = "content"
    }
    return data
}