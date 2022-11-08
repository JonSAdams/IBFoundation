function openNamingConventions() {
    let x =document.getElementById("openConventions");
    if(x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none"
    }
}

function copyTheText() {
    var copyText = document.getElementById('string-of-text').innerHTML;
    navigator.clipboard.writeText(copyText);
    };