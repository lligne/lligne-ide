<script lang="ts">
  import { onMount } from 'svelte';

  import {scan} from "../lligne/code/scanning/Scanner";
  import {
    filterLeadingTrailingDocumentation
  } from "../lligne/code/scanning/tokenfiltering/LeadingTrailingDocumentationFilter";
  import {parseExpression} from "../lligne/code/parsing/Parser";

  import {EditorState} from "@codemirror/state"
  import {EditorView, keymap} from "@codemirror/view"
  import {defaultKeymap} from "@codemirror/commands"

  let editorState = EditorState.create({
    doc: "// Enter an expression\n",
    extensions: [keymap.of(defaultKeymap)]
  })

  let editorView : EditorView

  onMount(async () => {
    editorView = new EditorView({
      state: editorState,
      parent: document.getElementById('repl-box')
    })
  });

  let parseMsg = ""

  function parse_from_repl(){
    let sourceCode = editorView.state.doc.toString()
    console.log("Source: ", sourceCode)

    let scanResult = scan(sourceCode)

    scanResult = filterLeadingTrailingDocumentation(scanResult)

    const parseResult = parseExpression(scanResult)

    parseMsg = "Parsed " + (parseResult.newLineOffsets.length+1) + " lines of code.";
  }
</script>

<div>

  <h2>REPL:</h2>
  <div id="repl-box"></div>
  <button on:click={parse_from_repl}>Parse</button>
  <p>{parseMsg}</p>

</div>

<style>
  #repl-box {
    width: 100vh;
  }
</style>