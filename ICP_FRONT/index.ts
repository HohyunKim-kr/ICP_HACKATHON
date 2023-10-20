//필요한 정보들은 import
import{
    text,
    nat64, // balance 값 
    Record, // Allowance를 통해 값을 받음 
    update,
    Vec,
    ic,
    StableTreeMap,
    Opt,
    bool,
}from 'azle'
// caller 랑 insert를 어떻게 할 것인가 


// address(to) - 내 주소 
// address(from) - 지불의 대상을 0 으로 선정 가상의 주소 

/*1.토큰 발행 : canister: 를 token 값으로 들고온다. icp 토큰과 bv 토큰 
   코드 정도는 찾아서 ( 화면에서 확인할 수 있게 ) */
export const Allowances = Record({
     spender: text,
     amount: 10n, // 지불하고 받는 양을 미리 설정했다. 
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
  // from 의 상대를 정하지 않고서 
  // caller를 어떻게 지정 할 것인가. 
 mint: update([text, nat64], bool, (to, from ) => {
    const caller = caller();

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

function insertAccount(to: any, toAccount: any) {
  throw new Error('Function not implemented.');
}
// 3. swap 을 통해  거래 성공에 대한 것 까지 구현 
  
 


































