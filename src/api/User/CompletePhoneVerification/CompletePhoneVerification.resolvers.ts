import User from '../../../entities/User';
import Verification from '../../../entities/Verification';
import { CompletePhoneVerificationMutationArgs, CompletePhoneVerificationResponse } from '../../../types/graph';
import { Resolvers } from '../../../types/resolvers';
import createJWT from '../../../utils/createJWT';

const resolvers: Resolvers = {
  Mutation: {
    CompletePhoneVerification: async (_, args: CompletePhoneVerificationMutationArgs): Promise<CompletePhoneVerificationResponse> => {
      
      const { phoneNumber, key } = args;
      try {
        const verification = await Verification.findOne({ payload: phoneNumber, key });
        if (!verification) {
          return {
            ok: false,
            error: "인증키가 유효하지 않습니다",
            token: null
          };
        } else { // 인증 키가 맞다면
          verification.verified = true;
          verification.save();
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          token: null
        };
      }

      // phoneNumber 가 이미 존재하는 user 가 있다면
      try {
        const user = await User.findOne({ phoneNumber });
        if (user) {
          user.verifiedPhoneNumber = true;
          user.save();
          const token = createJWT(user.id);
          return {
            ok: true,
            error: null,
            token: token
          };
        } else {
          return {
            ok: true,
            error: null,
            token: null
          };
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          token: null
        };
      }
      
    }
  }
};

export default resolvers;