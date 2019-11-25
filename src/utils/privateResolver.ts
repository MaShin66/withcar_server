const privateResolver = resolverFunction => async (parent, args, context, info) => {
    if (!context.req.user) {  // 요청한 user 가 없다면 오류
      throw new Error("No JWT. I refuse to proceed");
    }
    const resolved = await resolverFunction(parent, args, context, info);
    return resolved;
  };
  
  export default privateResolver;