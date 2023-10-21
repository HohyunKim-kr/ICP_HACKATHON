const { isMinusToken } = require('typescript');

document.addEventListener("DOMContentLoaded", function() {
    fetch("/getAccount")
    .then(response => response.json())
    .then(data => {
        document.querySelector('.styleInput[value="amount of VM"]').value = data.balanceVM;  // VM 잔액을 출력
        document.querySelector('.styleInput[value="amount of ICP"]').value = data.balanceICP;  // ICP 잔액을 출력
    })
    .catch(error => console.error('Error:', error));
});
//start 버튼 
document.getElementById("GamStart").addEventListener("click", function() {
    window.location.href = "../base.js";
});
// 광고 건너뛰기 버튼 
document.getElementById(").addEventListener("click", function() {
    window.location.href = "newPage.html";
    isMinusToken();
});
// 광고 보기 버튼 
document.getElementById("moveButton").addEventListener("click", function() {
    window.location.href = "newPage.html";
    isMinusToken();
});
