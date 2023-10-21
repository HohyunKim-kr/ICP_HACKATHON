import{
    text,
    nat64, // balance 값 
    Record, // Allowance를 통해 값을 받음 
    update,
    Vec,
    StableBTreeMap,
    Opt,
    bool,
  
  
}from 'azle'
let level = nat64;
const CANISTER_ID ="캐니스터 ID";
// From 주소 : CANISTER_ID
// to 주소는 :0 으로 설정 
export const Allowances = Record({
 spender:text, // 특정 양을 보낼 수 있음을 저장 
 amount: nat64,
});
export const Account = Record({
  address: text,
  totalSupply: nat64,
  allowances: Vec(Allowances),
});
// 맵에다 값들이 들어오면 저장하는 형식이다. 
// StableBTreeMap이 클래스라고 가정하면:0 의 성질은 뺴도 되지 않을까/
// callerAccount == toAccount 와 같다고 생각한다. 
let state = new StableBTreeMap(text, Account, 0);
// state는 상태 지정 
const tokenInfo = {
  name: "Canister",
  totalSupply: 100n, // 공급량 
  owner: "jw",
};

function getCaller() : string {
  // 현재 ic.caller()를 반환하는 대신 CANISTER_ID 값을 반환합니다.
  return CANISTER_ID;
}

function getAccountByAddress(address: text): Opt<typeof Account> {
  return state.get(address);
}
function insertAccount(address: text, totalSupply: typeof Account): typeof Account {
  state.insert(address,totalSupply);
  const newAccountOpt = getAccountByAddress(address);
  if ("None" in newAccountOpt) {
    throw new Error("Insert failed");
  }
  return newAccountOpt.Some;
}
// Canister 에서 return 된 totalSupply 를 보여주고자 한다. 
export default Canister({
  balanceOf: query([text], nat64, (address) => {
    const accountOpt = getAccountByAddress(CANISTER_ID);
    if ("None" in accountOpt) {
      return 0n;
    }
    return accountOpt.Some.totalSupply; // canister_id의 양이 반환될 것이다. 
  }),
  transfer: update([text, nat64], bool, (to, amount) => {
    const fromAddress = getCaller();
    const fromAccountOpt = getAccountByAddress(fromAddress);
    if ("None" in fromAccountOpt) {
      throw new Error("fromAccount not found");
    }
    const fromAccount = fromAccountOpt.Some; // 들어오는 주소 

    let toAccountOpt = getAccountByAddress(to); // 보내는 주소 
    let toAccount;
    if ("None" in toAccountOpt) {
      const newToAccount: typeof Account = {
        address: to,
        balance: 0n,
        allowances: [],
      };
      toAccount = insertAccount(to, newToAccount);
    } else {
      toAccount = toAccountOpt.Some; // 이거를 0으로 만든다. 
    }

    if (!fromAccount || fromAccount.balance < amount) {
      return false;
    }

    insertAccount(fromAddress, fromAccount);
    insertAccount(to, toAccount);

    return true;
  }),
 
  mint: update([text, nat64], bool, (to, amount) => {
    const toAccountOpt = getAccountByAddress(to);
    let toAccount;
    if ("None" in toAccountOpt) {
      const newToAccount: typeof Account = {
        address: to,
        balance: 0n,
        allowances: [],
      };
      toAccount = insertAccount(to, newToAccount);
    } else {
      toAccount = toAccountOpt.Some;
    }

    toAccount.balance += amount;
    tokenInfo.totalSupply += amount;

    insertAccount(to, toAccount);
    return true;
  }),
   // token으로 아이템을 살때 , 사용자가 아이템을 사용했을 때 값에 비례하는 토큰을 태운다. 
  burn: update([nat64], bool, (amount) => {
    const caller = getCaller();

    const callerAccountOpt = getAccountByAddress(caller);
    if ("None" in callerAccountOpt) {
      throw new Error("Caller account not found");
    }
    const callerAccount = callerAccountOpt.Some;

    if (callerAccount.balance < amount) {
      throw new Error("Insufficient tokens to burn");
    }
    tokenInfo.totalSupply -= amount;
    callerAccount.totalSupply += amount;
    insertAccount(caller, callerAccount);
    return true;
  }),
});

// error 처리 
function Canister(arg0: { balanceOf: any; transfer: any; mint: any; burn: any; }) {
  throw new Error('Function not implemented.');
}

function query(arg0: any[], nat64: any, arg2: (address: any) => any): any {
  throw new Error('Function not implemented.');
}

function StableBTreeMap(text: any, Account: any, arg2: number) {
  throw new Error('Function not implemented.');
}

function AddToken(amount: nat64) {
  const caller = getCaller();
  const callerAccountOpt = getAccountByAddress(caller);
  
  if ("None" in callerAccountOpt) {
    throw new Error("Caller account not found");
  }
  const callerAccount = callerAccountOpt.Some;
  
  // Ensure the account has enough tokens
  if (callerAccount.balance < amount) {
    throw new Error("Insufficient balance");
  }
  if (!amount) {
    amount = BigInt(Math.floor(level * 1.3));
   }

  callerAccount.balance -= amount;
  insertAccount(caller, callerAccount);
};



