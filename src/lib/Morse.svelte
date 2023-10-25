<script lang="ts">

    let msg = ""
    let encodedMsg = "Encoded"

    const morseCode = {
        A: '.-',
        B: '-...',
        C: '-.-.',
        D: '-..',
        E: '.',
        F: '..-.',
        G: '--.',
        H: '....',
        I: '..',
        J: '.---',
        K: '-.-',
        L: '.-..',
        M: '--',
        N: '-.',
        O: '---',
        P: '.--.',
        Q: '--.-',
        R: '.-.',
        S: '...',
        T: '-',
        U: '..-',
        V: '...-',
        W: '.--',
        X: '-..-',
        Y: '-.--',
        Z: '--..',
        "1": '.----',
        "2": '..---',
        "3": '...--',
        "4": '....-',
        "5": '.....',
        "6": '-....',
        "7": '--...',
        "8": '---..',
        "9": '----.',
        "0": '-----',
        "?": '..--..',
        "!": '-.-.--',
        ".": '.-.-.-',
        ",": '--..--',
        ";": '-.-.-.',
        ":": "---..."
    }

    function encode() {
        const ucMsg = msg.toUpperCase()

        encodedMsg = ""
        for (let i=0; i<ucMsg.length; i+=1) {
            encodedMsg += morseCode[ucMsg[i]] ?? ""
        }
    }

</script>

<div>
    <form class="row" on:submit|preventDefault={encode}>
        <textarea bind:value={msg} on:input={encode}></textarea>
    </form>
    <p>{encodedMsg}</p>
    <p>{encodedMsg.length} Morse symbols.</p>
</div>



