

const btn = document.getElementsByClassName('garden-fresh-btn');
const element = document.getElementsByClassName('market-fresh-colors');

btn[0].addEventListener('click', () => {
        const element = document.getElementsByClassName('market-fresh-colors');
        for (i=0;i < element.length;i++) {
            element[i].style.display = 'block';
        }
       
    });



