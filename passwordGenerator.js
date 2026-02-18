// Get DOM Elements
const passwordResult = document.getElementById('result');
const copyBtn = document.getElementById('copy');
const passwordLength = document.getElementById('numberOfCharacters');
const upperCaseOption = document.getElementById('upperCaseLetters');
const lowerCaseOption = document.getElementById('lowerCaseLetters');
const numbersOption = document.getElementById('number');
const specicalOption = document.getElementById('specialCharacters');
const generateBtn = document.getElementById('generate');
const form = document.getElementById('passwordGenerateForm');

// All the Characters used in the generator
const lowerCase = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const upperCase = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const numbers = ['0','1','2','3','4','5','6','7','8','9'];
const specialCharacters = ['!','@','#','$','%','^','&','*','(',')','<','>'];

// Functions

copyBtn.addEventListener('click', () => {
    const password = passwordResult.innerText;
    if (!password) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(password).then(() => {
            showCopiedFeedback();
        }).catch(() => {
            fallbackCopy(password);
        });
    } else {
        fallbackCopy(password);
    }
});

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopiedFeedback();
}

function showCopiedFeedback() {
    const original = copyBtn.innerText;
    copyBtn.innerText = 'Copied!';
    setTimeout(() => {
        copyBtn.innerText = original;
    }, 2000);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const characterAmount = passwordLength.value;
    const includeUpperCase = upperCaseOption.checked;
    const includeLowerCase = lowerCaseOption.checked;
    const includeNumbers = numbersOption.checked;
    const includeSpecialCharacters = specicalOption.checked;
    const password = generatePassword (
        characterAmount,
        includeUpperCase,
        includeLowerCase,
        includeNumbers,
        includeSpecialCharacters
    );

    passwordResult.innerText = password;
});

let generatePassword = (
        characterAmount,
        includeUpperCase,
        includeLowerCase,
        includeNumbers,
        includeSpecialCharacters
    ) => {
        let code = [];
        if(includeUpperCase) code = code.concat(upperCase);
        console.log(code);
        if(includeLowerCase) code = code.concat(lowerCase);
        console.log(code);
        if(includeNumbers) code = code.concat(numbers);
        console.log(code);
        if(includeSpecialCharacters) code = code.concat(specialCharacters);
        console.log(code);
        let passwordCharacters = [];
        for (let i = 0; i < characterAmount; i++) {
            const characterCode = code[Math.floor(Math.random() * code.length)];
            passwordCharacters.push(characterCode);
        }
        return passwordCharacters.join('');

    }