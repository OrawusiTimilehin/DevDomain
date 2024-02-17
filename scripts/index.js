$(document).ready(function(){
    console.log("JAVASCRIPT LINKED")
    const letters =  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const header = 'DEVDOMAIN'


    let count = 0;
    let letterInterval = 0;
    const interval = setInterval(function(){
        if (count < 100){
        var wordArray = $("#heading").text().split("");
        for(i = 0; i < wordArray.length; i++){
            console.log($("#heading").text().split("")[i]);
            if (count <= i * 7){
            wordArray[i] = letters[Math.floor(Math.random()*26)]
            }else{
                wordArray[i] = header[i];
            }
        }
        var cypher = wordArray.join('');
        $('#heading').text(cypher);
        count ++
    }
    }, 50)

})