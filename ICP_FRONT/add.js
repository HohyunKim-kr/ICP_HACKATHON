document.querySelector(".ADName").addEventListener("click", function() {
    caller.AddToken();
    // 예를 들면, 만약 callerAccount의 정보를 콘솔에 출력하려면:
    const caller = caller.getCaller();
    const callerAccountOpt = caller.getAccountByAddress(caller);
    if ("None" in callerAccountOpt) {
        console.error("Caller account not found");
    } else {
        console.log(callerAccountOpt.Some);
    }
});