import User from '../../../entities/User';
import Verification from '../../../entities/Verification';
import { CompleteEmailVerificationMutationArgs, CompleteEmailVerificationResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import privateResolver from '../../../utils/privateResolver';

const resolvers: Resolvers = {
  Mutation: {
    CompleteEmailVerification: privateResolver(
      async (_, args: CompleteEmailVerificationMutationArgs, { req }): Promise<CompleteEmailVerificationResponse> => {

        const user: User = req.user;
        const { key } = args;
        if (user.email) { // user 의 email 이 있다면 Verification 에 있는 email 과 key 값 찾아서
          try {
            const verification = await Verification.findOne({
              key,
              payload: user.email
            });
            if (verification) { // 위에서 찾은 값이 있다면 유저의 이메일 인증을 true 로 변경
              user.verifiedEmail = true;
              user.save();
              return {
                ok: true,
                error: null
              };
            } else {
              return {
                ok: false,
                error: "인증 목록에 없는 이메일입니다"
              };
            }
          } catch (error) {
            return {
              ok: false,
              error: error.message
            };
          }

        } else {
          return {
            ok: false,
            error: "유저에 목록에 없는 이메일입니다"
          };
        }
      }
    )
  }
};

export default resolvers;