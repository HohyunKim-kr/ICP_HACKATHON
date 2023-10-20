import{
    text,
    nat64,
    Record,
    update,
    Vec,
    ic,
    StableTreeMap,
    Opt,
}from 'azle'


/*1.토큰 발행 : canister: 를 token 값으로 들고온다. icp 토큰과 bv 토큰 
   코드 정도는 찾아서 ( 화면에서 확인할 수 있게 ) */
export const Allowances = Record({
     spender: text,
     amount: 10n, 
});
 export const Account = Record({
    address: text,
    balance: nat64,
    allowances: Vec(Allowances),
 }); 
 let state =StableTreeMap(text,Account,0);
 // mint 의 과정 
 function getAccountByAddress(address : text): Opt<typeof Account>{
    return (address);
 }
  // update , transfer 는 필요하다. 

 mint: update([text, nat64], bool, (to, amount) => {
    const caller = caller();

    // mint 함수는 admin인 계정만 호출할 수 있습니다.
    if (admins.indexOf(caller) == -1) {
      throw new Error("Only admins can mint new tokens");
    }

    const callerAccountOpt = getAccountByAddress(caller);
    // 새로운 양만큼 추가가 된다. 
    if ("None" in callerAccountOpt) {
      throw new Error("Caller account not found");
    }
    const callerAccount = callerAccountOpt.Some;
    const toAccountOpt = getAccountByAddress(to);
    if ("None" in toAccountOpt) {
      throw new Error("Recipient account not found");
    }
    const toAccount = toAccountOpt.Some;

    insertAccount(to, toAccount);
    return true;

  }),

const tokenInfo: Array<{
  name: string,
  VMAmount : bigint;
  ICPAmount : bigint;
  ownerAddress: string;
}> =[];
//계획 : from 으로 설정
tokenInfo.push({
    name:"jw",
    VMAmount : 100n,
    ICPAmount : 200n,
    ownerAddress :"0x",
});
// 계획 : to 로 설정 
tokenInfo.push({
    name:"hyo",
    VMAmount : 300n,
    ICPAmount : 200n,
    ownerAddress :"0x",
});

 
// 2.add,remove 캐니스터 
export const AddToken =({
   toAccount.balance += amount,
});
export const RemoveToken =({
  toAccount.balance -= amount,
});
// 3. swap 을 통해  거래 성공에 대한 것 까지 구현 
  
 


































