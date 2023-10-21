import{
    text,
    nat64, // balance 값 
    Record, // Allowance를 통해 값을 받음 
    update,
    Vec,
    ic,
    StableBTreeMap,
    Opt,
    bool,
  
}from 'azle'

export const Allowances = Record({
 spender:text,
 amount: nat64,
});
export const Account = Record({
  address: text,
  balance: nat64,
  allowances: Vec(Allowances),
});
// 맵에다 값들이 들어오면 저장하는 형식이다. 
// StableBTreeMap이 클래스라고 가정하면:
let state = new StableBTreeMap(text, Account, 0);
//from 주소를 0으로 설정 


const tokenInfo = {
  name: "",
  
};
function getCaller() : string {
  const caller = ic.caller().toString();
  return caller;
}
function getAccountByAddress(address: text): Opt<typeof Account> {
  return state.get(address);
}
function insertAccount(address: text, account: typeof Account): typeof Account {
  state.insert(address, account);
  const newAccountOpt = getAccountByAddress(address);
  if ("None" in newAccountOpt) {
    throw new Error("Insert failed");
  }
  return newAccountOpt.Some;
}

export default Canister({
  balanceOf: query([text], nat64, (address) => {
    const accountOpt = getAccountByAddress(address);
    if ("None" in accountOpt) {
      return 0n;
    }
    return accountOpt.Some.balance;
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
      toAccount = toAccountOpt.Some;
    }

    if (!fromAccount || fromAccount.balance < amount) {
      return false;
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

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

    callerAccount.balance -= amount;
    tokenInfo.totalSupply -= amount;

    insertAccount(caller, callerAccount);
    return true;
  }),
});

function Canister(arg0: { balanceOf: any; transfer: any; mint: any; burn: any; }) {
  throw new Error('Function not implemented.');
}

function query(arg0: any[], nat64: any, arg2: (address: any) => any): any {
  throw new Error('Function not implemented.');
}

function StableBTreeMap(text: any, Account: any, arg2: number) {
  throw new Error('Function not implemented.');
}
// ... [기존 코드]

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

  callerAccount.balance -= amount;
  insertAccount(caller, callerAccount);
}

function MinusToken(amount: nat64) {
  const caller = getCaller();
  const callerAccountOpt = getAccountByAddress(caller);
  
  if ("None" in callerAccountOpt) {
    throw new Error("Caller account not found");
  }
  const callerAccount = callerAccountOpt.Some;

  callerAccount.balance += amount;
  insertAccount(caller, callerAccount);
}


//이것을 프론트에서는 어떻게 활용할 것인지 
// name 과 owner의 차이 



