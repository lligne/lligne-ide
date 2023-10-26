<script lang="ts">
    import Greet from './lib/Greet.svelte'
    import Repl from './lib/lligne-ide/Repl.svelte'
    // import Morse from "./lib/Morse.svelte";
</script>


<main class="container">
    <h1>Lligne IDE</h1>

    <div class="row">
        <Greet/>
    </div>

    <div class="row">
        <Repl/>
    </div>

<!--    <hr>-->
<!--    <Morse/>-->

</main>

