// null 이 아닐경우 notNull 에 args[key] 를 넣는 함수..?
const cleanNullArgs = (args: object): object => {
    const notNull = {};
    Object.keys(args).forEach(key => {
      if (args[key] !== null) {
        notNull[key] = args[key];
      }
    });
    return notNull;
  };
  
  export default cleanNullArgs;