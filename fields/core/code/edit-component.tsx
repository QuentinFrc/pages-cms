"use client";

import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { StreamLanguage } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { linter } from "@codemirror/lint";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { forwardRef, useMemo } from "react";

// TODO: implement minlength and maxlength

const EditComponent = forwardRef((props: any, ref: any) => {
  const { value, onChange, field } = props;
  const { resolvedTheme } = useTheme();

  const extensions = useMemo(() => {
    const exts = [EditorView.lineWrapping];

    switch (field.options?.format) {
      case "yaml":
      case "yml":
        exts.push(StreamLanguage.define(yaml));
        break;
      case "javascript":
      case "js":
      case "jsx":
      case "typescript":
      case "ts":
      case "tsx":
        exts.push(javascript({ jsx: true }));
        break;
      case "json":
        exts.push(json());
        break;
      case "html":
      case "htm":
        exts.push(html());
        break;
      default:
        exts.push(
          markdown({ base: markdownLanguage, codeLanguages: languages })
        );
        break;
    }

    if (field.options.lintFn) {
      exts.push(linter(field.options.lintFn));
    }

    return exts;
  }, [field.options?.format]);

  return (
    <CodeMirror
      basicSetup={{
        foldGutter: false,
        lineNumbers: false,
        highlightActiveLine: false,
        searchKeymap: false,
      }}
      extensions={extensions}
      onChange={onChange}
      ref={ref}
      theme={resolvedTheme === "dark" ? githubDark : githubLight}
      value={value}
    />
  );
});

export { EditComponent };
