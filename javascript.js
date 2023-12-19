function openNamingConventions() {
    let x = document.getElementById("openConventions");
    if (x.style.display === "none") {
        x.style.display = "block";
        x.style.transition = "display 0.5s ease-in-out";
    } else {
        x.style.display = "none";
        x.style.transition = "display 0.5s ease-in-out";
    }
}


function copyTheText() {
    var copyText = document.getElementById('string-of-text').innerHTML;
    navigator.clipboard.writeText(copyText).then(() => {
        alert('Text copied to clipboard');
    });
}
