<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri"
  import {Scan} from "./lligne/code/scanning/Scanner";
  import {
    filterLeadingTrailingDocumentation
  } from "./lligne/code/scanning/tokenfiltering/LeadingTrailingDocumentationFilter";
  import {ParseExpression} from "./lligne/code/parsing/Parser";

  let name = "";
  let greetMsg = ""

  let sourceCode = ""
  let parseMsg = ""

  async function greet(){
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsg = await invoke("greet", { name })
  }

  function parse_from_repl(){
    let scanResult = Scan(sourceCode)

    scanResult = filterLeadingTrailingDocumentation(scanResult)

    const parseResult = ParseExpression(scanResult)

    parseMsg = "Parsed " + (parseResult.NewLineOffsets.length+1) + " lines of code.";
  }
</script>

<div>
  <form id="hello" class="row" on:submit|preventDefault={greet}>
    <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <button type="submit">Show a Greeting</button>
  </form>
  <p>{greetMsg}</p>

  <form id="repl" class="row" on:submit|preventDefault={parse_from_repl}>
    <input id="repl-input" placeholder="REPL..." bind:value={sourceCode} />
    <button type="submit">Parse</button>
  </form>
  <p>{parseMsg}</p>


</div>
